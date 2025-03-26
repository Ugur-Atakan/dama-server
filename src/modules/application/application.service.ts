import { PrismaService } from 'src/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

function generateApplicationNumber(): string {
  const randomNumber = Math.floor(10000000 + Math.random() * 900000).toString();
  return `APP-${randomNumber}`;
}

@Injectable()
export class ApplicationService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllApplicators() {
    return await this.prisma.applicator.findMany({
      where: { status: 'APPLICATOR' },
      include: { applications: true,appointments: true }
    });
  }

  async getClientApplicators() {
    return await this.prisma.applicator.findMany({
      where: { status: 'APPLICATOR' },
      include: { applications: true,appointments: true },
    });
  }

  async updateApplicatorData(data: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    birthDate: string;
  }) {
    await this.prisma.applicator.update({
      where: { id: data.id },
      data,
    });
  }

  async createApplicationForVerifiedPhone(telephone: string) {
    // İlgili telefonla kayıtlı bir Applicator var mı kontrol ediyoruz.
    const applicator = await this.prisma.applicator.findUnique({
      where: { telephone },
    });

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

  async getUserApplications(applicatorId: string) {
    // İlgili application'ı çekiyoruz.
    const application = await this.prisma.application.findMany({
      where: { applicatorId: applicatorId },
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
    // Front-end'e döneceğimiz response'a "forms" property'sini ekliyoruz.
    return application;
  }

  async updatePreApplicationSection(
    applicationId: string,
    updateData: { section: string; step: number; data: any },
  ) {
    // Uygulamanın mevcut preApplicationData'sını getiriyoruz
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // JSONB sütununun array olarak saklandığını varsayıyoruz
    let preApplicationData =
      (application.preApplicationData as Array<{
        section: string;
        step: number;
        data: any;
      }>) || [];

    // Güncellenecek section'ı arıyoruz
    const index = preApplicationData.findIndex(
      (item) => item.section === updateData.section,
    );

    if (index >= 0) {
      // Eğer bulunduysa, güncelliyoruz
      preApplicationData[index].data = updateData.data;
      // İsteğe bağlı: adım (step) bilgisini de güncelleyebilirsin:
      preApplicationData[index].step = updateData.step;
    } else {
      // Eğer bulunamadıysa, yeni section öğesi ekliyoruz
      preApplicationData.push({
        section: updateData.section,
        step: updateData.step,
        data: updateData.data,
      });
    }

    // Güncellenmiş array'i veritabanında update ediyoruz
    const updatedApplication = await this.prisma.application.update({
      where: { id: applicationId },
      data: { preApplicationData },
    });

    return updatedApplication;
  }

  async updateApplicationSection(
    applicationId: string,
    updateData: { section: string; step: number; data: any },
  ) {
    // Uygulamanın mevcut applicationData'sını getiriyoruz
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    let applicationData =
      (application.applicationData as Array<{
        section: string;
        step: number;
        data: any;
      }>) || [];

    const index = applicationData.findIndex(
      (item) => item.section === updateData.section,
    );

    if (index >= 0) {
      applicationData[index].data = updateData.data;
      applicationData[index].step = updateData.step;
    } else {
      applicationData.push({
        section: updateData.section,
        step: updateData.step,
        data: updateData.data,
      });
    }

    const updatedApplication = await this.prisma.application.update({
      where: { id: applicationId },
      data: { applicationData },
    });

    return updatedApplication;
  }
}
