import { PrismaService } from 'src/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

function generateApplicationNumber(): string {
  const randomNumber = Math.floor(10000000 + Math.random() * 900000).toString();
  return `APP-${randomNumber}`;
}

@Injectable()
export class ApplicationService {
  constructor(private readonly prisma: PrismaService) {}

  async updateApplicatorData(data: any) {
    await this.prisma.applicator.update({
      where: { id: data.id },
      data,
    });
  }

  async createApplicationForVerifiedPhone(telephone: string) {
    // İlgili telefonla kayıtlı bir Applicator var mı kontrol ediyoruz.
    let applicator = await this.prisma.applicator.findUnique({
      where: { telephone },
    });

    if (!applicator) {
      // Eğer yoksa, minimal bilgileriyle yeni bir Applicator oluşturuyoruz.
      applicator = await this.prisma.applicator.create({
        data: {
          telephone,
          // Diğer alanlar varsa (örneğin name, email, birthDate) ekleyebilirsin.
          status: 'APPLICATOR', // Varsayılan durum
        },
      });
    }

    const applicationNumber = generateApplicationNumber();

    // Yeni başvuru kaydını oluşturuyoruz.
    const newApplication = await this.prisma.application.create({
      data: {
        applicatorId: applicator.id,
        applicationNumber,
        status: 'PENDING', // İstersen başlangıç statüsü olarak PRE_APPLICATION da seçebilirsin.
        preApplicationData: [], // Başlangıçta boş array
        applicationData: [], // Başlangıçta boş array
      },
    });

    return newApplication;
  }
  async getAllApplications() {
    return await this.prisma.application.findMany({
      select: {
        id: true,
        applicationNumber: true,
        preApplicationData: true,
        applicationData: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getApplicationWithForms(applicationId: string) {
    // İlgili application'ı çekiyoruz.
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        applicationNumber: true,
        preApplicationData: true,
        applicationData: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // preApplicationData ve applicationData'nın array olduğunu varsayıyoruz.
    // Eğer veri yoksa boş array döndürüyoruz.
    const preForms = Array.isArray(application.preApplicationData)
      ? application.preApplicationData
      : [];
    const appForms = Array.isArray(application.applicationData)
      ? application.applicationData
      : [];

    // İki array'i birleştiriyoruz.
    const forms = [...preForms, ...appForms];

    // Front-end'e döneceğimiz response'a "forms" property'sini ekliyoruz.
    return {
      ...application,
      forms,
    };
  }

  async updatePreApplicationSection(
    applicationId: string,
    section: string,
    newData: any,
  ) {
    // Uygulamanın mevcut preApplicationData'sını getiriyoruz
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Varsayıyoruz ki preApplicationData JSONB sütunu olarak array şeklinde saklanıyor
    const preApplicationData =
      (application.preApplicationData as Array<{
        section: string;
        step: number;
        data: any;
      }>) || [];

    // İlgili section'ı bulup, data'sını güncelliyoruz
    const updatedPreApplicationData = preApplicationData.map((item) =>
      item.section === section ? { ...item, data: newData } : item,
    );

    // Güncellenmiş array'i veritabanında update ediyoruz
    const updatedApplication = await this.prisma.application.update({
      where: { id: applicationId },
      data: { preApplicationData: updatedPreApplicationData },
    });

    return updatedApplication;
  }
}
