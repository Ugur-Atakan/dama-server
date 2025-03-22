import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Ticket, TicketStatus } from '@prisma/client';
import { CreateTicketDto, EditTicketStatusDto, TicketMessageDto } from 'src/dtos/support.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SupportService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllTickets(): Promise<Ticket[]> {
    return this.prismaService.ticket.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        company: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    });
  }

  async editTicketStatus(
    userId: string,
    ticketId: string,
    status:EditTicketStatusDto['status'],
    priority:EditTicketStatusDto['priority']
  ): Promise<Ticket> {
    // Bilet Bulunamıyorsa Hata Fırlat
    const ticket = await this.prismaService.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
    }

    // Kullanıcı ve Rolleri Al
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Yetki Kontrolü
    const isAdmin = user.roles.some((role) => role.role === 'ADMIN');
    const isOwner = ticket.userId === userId;

    if (!isAdmin && !isOwner) {
      throw new HttpException(
        'You do not have permission to update this ticket',
        HttpStatus.FORBIDDEN,
      );
    }

    // Bilet Durumu Kontrolü
    if (!isAdmin && ticket.status === 'CLOSED') {
      throw new HttpException(
        'Cannot edit a ticket that is already closed',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Geçersiz Durum Kontrolü
    if (!Object.values(TicketStatus).includes(status)) {
      throw new HttpException(
        'Invalid ticket status',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Bileti Güncelle
    return this.prismaService.ticket.update({
      where: { id: ticketId },
      data: { status,priority:priority },
    });
  }

  async createTicket(userId: string, data: CreateTicketDto): Promise<Ticket> {
    // gelen değer bir nesne veya nesneler dizisi olabilir.
    const { message,companyId, ...ticketData } = data;
    // Eğer message bir dizi değilse, diziye çeviriyoruz.
    const messagesArray = Array.isArray(message) ? message : [message];
  
    const ticket = await this.prismaService.ticket.create({
      data: {
        ...ticketData,
        messages: {
          create: messagesArray.map((msg: TicketMessageDto) => {
            // Attachments varsa, bunları array'e çevir ve uploadedBy ekle
            const attachmentsData = msg.attachments
              ? (Array.isArray(msg.attachments)
                  ? msg.attachments
                  : [msg.attachments]
                ).map(att => ({
                  ...att,
                  uploadedBy: { connect: { id: userId } },
                }))
              : undefined;
              
            return {
              message: msg.message,
              userId,
              isStaff: false,
              attachments: attachmentsData ? { create: attachmentsData } : undefined,
            };
          }),
        },
        user: {
          connect: {
            id: userId,
          },
        },
        company: companyId
          ? {
              connect: {
                id: companyId,
              },
            }
          : undefined,
      },
    });
    return ticket;
  }
  

  async getUserTickets(userId: string): Promise<Ticket[]> {
    return this.prismaService.ticket.findMany({
      where: {
        userId,
      },
    });
  }

  async getCompanyTickets(companyId: string): Promise<Ticket[]> {
    return await this.prismaService.ticket.findMany({
      include: {
        user: true,
        company: true,
      },
      where: {
       company:{
        some:{
          id:companyId
        }
       }
      },      
      orderBy: { createdAt: 'desc' }, // isteğe bağlı sıralama
    });
  }
  


// contorl(){
//   const user = await this.prismaService.user.findUnique({
//     where: {
//       id: userId,
//     },
//     include: {
//       roles: true,
//     },
//   });
//   const userRoles = user.roles.map((role) => role.role);
//   const isOwner = ticket.userId === userId;
//   const isAdmin = userRoles.includes('ADMIN');
//   if (!isOwner && !isAdmin) {
//     throw new HttpException('You are not allowed to view this ticket', 403);
//   }
// }

  async getTicketById(ticketId: string): Promise<Ticket> {
    const ticket = await this.prismaService.ticket.findUnique({
      where: {
        id: ticketId,
      },
      include: {
        user:{
          select:{
            id:true,
            email:true,
            firstName:true,
            lastName:true,
            profileImage:true,
            telephone:true,
          }
        },
        messages: {
          include: {
            attachments: true,
        },
      },
      },
    });
    if (!ticket) {
      throw new HttpException('Ticket not found', 404);
    }

    return ticket;
  }

  async addMessage(
    userId: string,
    ticketMessage: TicketMessageDto,
  ): Promise<Ticket> {
    // Ticket'ı bul
    const ticket = await this.prismaService.ticket.findUnique({
      where: { id: ticketMessage.ticketId },
      include: { user: true },
    });
  
    if (!ticket) {
      throw new Error('Ticket not found');
    }
  
    // Sadece ticket sahibi mesaj ekleyebilsin
    if (ticket.userId !== userId) {
      throw new Error('You are not allowed to add a message to this ticket');
    }
  
    // Attachments varsa, bunları işlemden geçirelim:
    let attachmentsData = undefined;
    if (ticketMessage.attachments) {
      // Eğer attachments tek bir obje ise, array'e çeviriyoruz
      const attachmentsArray = Array.isArray(ticketMessage.attachments)
        ? ticketMessage.attachments
        : [ticketMessage.attachments];
      
      // Her attachment için, "uploadedBy" alanını ekliyoruz.
      attachmentsData = attachmentsArray.map((att) => ({
        ...att,
        uploadedBy: { connect: { id: userId } },
      }));
    }
  
    // Ticket güncelleme: Yeni mesajı ekle
    return this.prismaService.ticket.update({
      where: { id: ticketMessage.ticketId },
      data: {
        messages: {
          create: {
            message: ticketMessage.message,
            userId,
            isStaff: false,
            attachments: attachmentsData ? { create: attachmentsData } : undefined,
          },
        },
      },
    });
  }
  

  async addMessageFromStaff(
    userId: string,
    ticketMessage: TicketMessageDto,
  ): Promise<Ticket> {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        roles: true,
      },
    });

    const userRoles = user.roles.map((role) => role.role);

    const ticket = await this.prismaService.ticket.findUnique({
      where: {
        id: ticketMessage.ticketId,
      },
      include: {
        user: true,
      },
    });
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    // if (!userRoles.includes('ADMIN')) {
    //   throw new Error('You are not allowed to add message to this ticket');
    // }

    return this.prismaService.ticket.update({
      where: {
        id: ticketMessage.ticketId,
      },
      data: {
        messages: {
          create: {
            message: ticketMessage.message,
            userId,
            isStaff: true,
          },
        },
      },
    });
  }
}
