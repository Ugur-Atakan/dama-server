import { PrismaService } from 'src/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { stat } from 'fs';
import e, { application } from 'express';

function generateApplicationNumber(): string {
  const randomNumber = Math.floor(10000000 + Math.random() * 900000).toString();
  return `APP-${randomNumber}`;
}

@Injectable()
export class ApplicationService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllApplicators() {
    const applicators= await this.prisma.applicator.findMany({
      where: {
        status: { in: ['APPLICATOR', 'APPOINTMENT_SCHEDULED'] },
        deletedAt: null,
      },
      include: { appointments: true, application:{
        select: {
        status: true,
        id: true,
        applicationNumber: true,
        createdAt: true,
        updatedAt: true,
      }, },
    },
    });
    console.log('applicators:',applicators);
    return applicators.map((applicator) => ({
        applicatorId: applicator.id,
        firstName: applicator.firstName,
        lastName: applicator.lastName,
        status: applicator.status,
        email: applicator.email,
        telephone: applicator.telephone,
        applicationStatus: applicator.application.status,
        applicationNumber: applicator.application.applicationNumber,
        createdAt: applicator.application.createdAt,
        updatedAt: applicator.application.updatedAt,
        appointments: applicator.appointments,
      }));  
  
}

  async findApplicator(id: string) {
   const applicator=await this.prisma.applicator.findUnique({
      where: { id: id },
      include: { appointments: true, application: true },
    });
    if (!applicator) {
      throw new NotFoundException('Applicator not found');
    }
    return {
      applicatorId:applicator.id,
      applicationNumber:applicator.application.applicationNumber,
      createdAt:applicator.application.createdAt,
      updatedAt:applicator.application.updatedAt,
      appointments:applicator.appointments,
      preApplicationData:applicator.application.preApplicationData,
      applicationData:applicator.application.applicationData,
    };
  } 


  async deleteApplicator(id: string) {
    const application= await this.prisma.applicator.update({
      where: { id: id },
      data: { deletedAt: new Date() },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    return 'Application deleted successfully';
  }

  async getAllClients() {
    return await this.prisma.applicator.findMany({
      where: { status: 'CLIENT' },
      include: { appointments: true, application: true },
    });
  }


  async setAsClient(id: string) { 
    const applicator = await this.prisma.applicator.update({
      where: { id: id },
      data: { status: 'CLIENT' },
    });
    if (!applicator) {
      throw new NotFoundException('Applicator not found');
    }
    return applicator;
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
    try {
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
    } catch (error: any) {
      console.error(error);
      throw new Error('Error updating pre-application section');
    }
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
    console.log('gelen data:',updateData);

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

  async createApplication(applicatorId: string) {
    await this.prisma.application.create({
      data: {
        applicatorId,
        applicationNumber: generateApplicationNumber(),
        status: 'PRE_APPLICATION',
        preApplicationData: [
          { section: 'contact', step: 1, data: {} },
          { section: 'incident', step: 2, data: {} },
          { section: 'passport', step: 3, data: {} },
          { section: 'employment', step: 4, data: {} },
          { section: 'recognition', step: 5, data: {} },
          { section: 'payment', step: 6, data: {} },
        ],
        applicationData: [
          { section: 'marital', step: 1, data: {
            maritalStatus: null,
            spouseName: null,
            hasChildren: null,
            children:[{
              name: null,
              birthDate: null,
            }],

          } },
          { section: 'employment', step: 2, data: {
            employerName: null,
            position: null,
            salary: null,
            startDate: null,
            hasContract: null,
            contractFile: null,

          } },
          { section: 'workConditions', step: 3, data: {
            bases: null,
            dailyHours: null,
            weeklyDays: null,
            lastWorkDate: null,
            supervisorName: null,

          } },
          { section: 'postEmployment', step: 4, data: {
            currentCompany: null,
            currentSalary: null,
            previousJobs: [{
              company: null,
              startDate: null,
              endDate: null,
          }],
         }},
          { section: 'evidenceWitness', step: 5, data: {
            hasWitnesses: null,
            witnesses: [{
              firstName: null,
              lastName: null,
            }],
            evidenceLinks: [],
          } },
        ],
      },
    });
  }
}
