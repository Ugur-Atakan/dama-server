import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { RoleType, User, CompanyUser } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { v4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import {
  ChangeEmailDto,
  LoginDto,
  RegisterDto,
  UpdateUserDto,
} from 'src/dtos/user.dto';
import { SafeUser } from 'src/common/interfaces/safe-user.interface';
import { isUUID } from 'class-validator';
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly stripeService: StripeService,
  ) {}

  private toSafeUser(
    user: User & { roles: { role: RoleType }[] } & { companies: any[] },
  ): any {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage,
      emailConfirmed: user.emailConfirmed,
      telephoneConfirmed: user.telephoneConfirmed,
      notifications: user.notifications,
      isActive: user.isActive,
      loginProvider: user.loginProvider,
      createdAt: user.createdAt,
      telephone: user.telephone,
      customerStripeID: user.customerStripeID,
      roles: user.roles.map((role) => role.role),
      companies:
        user.companies && user.companies.length > 0
          ? user.companies.map((companyUser) => ({
              companyName: companyUser.company.companyName,
              companyId: companyUser.company.id,
              role: companyUser.role,
              createdAt: companyUser.company.createdAt,
              state: companyUser.company.state.name,
              status: companyUser.company.status,
            }))
          : [],
    };
  }

  async findOne(email: string): Promise<User | undefined> {
    return this.prismaService.user.findUnique({
      where: { email },
      include: {
        roles: true,
        companies: {
          include: {
            company: {
              select: {
                companyName: true,
                id: true,
                createdAt: true,
                state: {
                  select: {
                    name: true,
                  },
                },
                status: true,
              },
            },
          },
        },
      },
    });
  }

  async findUserByEmail(email: string): Promise<SafeUser> {
    const user = await this.prismaService.user.findUnique({
      where: { email , deletedAt: null},
      include: {
        roles: true,
        companies: {
          include: {
            company: {
              select: {
                companyName: true,
                id: true,
                createdAt: true,
                state: {
                  select: {
                    name: true,
                  },
                },
                status: true,
              },
            },
          },
        },
      },
    });
    if (!user) {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }
    return this.toSafeUser(user);
  }


  async checkUserByEmail(email: string): Promise<SafeUser | null> {
    const user = await this.prismaService.user.findUnique({
      where: { email, deletedAt: null },
      include: {
        roles: true,
        companies: {
          include: {
            company: {
              select: {
                companyName: true,
                id: true,
                createdAt: true,
                state: { select: { name: true } },
                status: true,
              },
            },
          },
        },
      },
    });
  
    return user ? this.toSafeUser(user) : null;
  }
  

  async findUserById(id: string): Promise<SafeUser> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      include: {
        roles: true,
        companies: {
          include: {
            company: {
              select: {
                companyName: true,
                id: true,
                createdAt: true,
                state: {
                  select: {
                    name: true,
                  },
                },
                status: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }

    return this.toSafeUser(user);
  }

  private formatUserCompanies(companies: any[]): any[] {
    return companies.map((companyRecord) => ({
      companyId: companyRecord.companyId,
      companyName: companyRecord.company?.companyName || 'Unknown',
      role: companyRecord.role,
      createdAt: new Date(companyRecord.createdAt).toLocaleString(),
      state: companyRecord.company?.state?.name || 'Unknown',
      companyType: companyRecord.company?.companyType?.name || 'Unknown',
      status: companyRecord.company?.status || 'Unknown',
    }));
  }

  async getUserUploadedDocuments(userId: string): Promise<any[]> {
    return await this.prismaService.document.findMany({
      where: { uploadedById: userId },
    });
  }

  async getUserCompanies(userId: string): Promise<any[]> {
    const result = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        companies: {
          include: {
            company: {
              select: {
                companyName: true,
                id: true,
                createdAt: true,
                state: {
                  select: {
                    name: true,
                  },
                },
                companyType: {
                  select: {
                    name: true,
                  },
                },
                status: true,
              },
            },
          },
        },
      },
    });
    if (!result || !result.companies) return [];
    return this.formatUserCompanies(result.companies);
  }

  // 3. Kullanıcının siparişlerini döndüren metod
  async getUserOrders(userId: string): Promise<any[]> {
    const userWithOrders = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        orders: {
          select: {
            id: true,
            status: true,
            amount: true,
            currency: true,
            stripeCheckoutSessionId: true,
            createdAt: true,
            companyId: true,
            paymentMethod: true,
            orderItems: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    stripeProductId: true,
                    createdAt: true,
                    description: true,
                  },
                },
                price: {
                  select: {
                    id: true,
                    unit_amount: true,
                    currency: true,
                    stripePriceId: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return userWithOrders?.orders || [];
  }

  // 4. Kullanıcının biletlerini döndüren metod
  async getUserTickets(userId: string): Promise<any[]> {
    const userWithTickets = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        tickets: true,
      },
    });
    return userWithTickets?.tickets || [];
  }

  // Ana metod: getUserDetails
  async getUserDetails(userId: string): Promise<any> {
    if (!isUUID(userId)) {
      throw new HttpException('Invalid UUID', HttpStatus.BAD_REQUEST);
    }

    const [uploadedDocuments, companies, orders, tickets, user] =
      await Promise.all([
        this.getUserUploadedDocuments(userId),
        this.getUserCompanies(userId),
        this.getUserOrders(userId),
        this.getUserTickets(userId),
        this.prismaService.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            emailConfirmed: true,
            telephoneConfirmed: true,
            notifications: true,
            isActive: true,
            loginProvider: true,
            createdAt: true,
            telephone: true,
            customerStripeID: true,
            roles: { select: { role: true } },
          },
        }),
      ]);

    if (!user) {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }

    // Şifre alanı zaten select edilmediği için delete etmeye gerek yok.
    return {
      ...user,
      uploadedDocuments,
      companies,
      orders,
      tickets,
      roles: user.roles.map((r) => r.role),
    };
  }

  async getAllUsers(includeDeleted: boolean = false): Promise<SafeUser[]> {
    const users = await this.prismaService.user.findMany({
      where: includeDeleted ? {} : { deletedAt: null },
      include: {
        roles: true,
        companies: {
          include: {
            company: {
              select: {
                companyName: true,
                id: true,
                createdAt: true,
                state: {
                  select: {
                    name: true,
                  },
                },
                status: true,
              },
            },
          },
        },
      },
    });
    const safeUsers = users.map((user) =>
      this.toSafeUser(
        user as User & { roles: { role: RoleType }[] } & { companies: any[] },
      ),
    );
    return safeUsers;
  }

  async createUser(userData: RegisterDto): Promise<SafeUser> {
    const user = await this.findOne(userData.email);
    if (user) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }
    const hash = await this.hashPassword(userData.password);
    const customerStripeID = (
      await this.stripeService.createCustomer({
        email: userData.email,
        name: userData.firstName + ' ' + userData.lastName,
      })
    ).id;
    const newUser = await this.prismaService.user.create({
      data: { ...userData, id: v4(), password: hash, customerStripeID } as any,
      select: {
        email: true,
        firstName: true,
        lastName: true,
        id: true,
      },
    });

    await this.prismaService.userRole.create({
      data: {
        userId: newUser.id,
        role: RoleType.USER,
      },
    });
    return await this.findUserByEmail(newUser.email);
  }

  async changeUserEmail(userId: string, data: ChangeEmailDto) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }

    const compare = await bcrypt.compare(data.currentPassword, user.password);
    if (!compare) {
      throw new HttpException('Password is incorrect', HttpStatus.BAD_REQUEST);
    }
    try {
      await this.prismaService.user.update({
        where: { id: userId },
        data: { email: data.newEmail },
        include: { roles: true, companies: true },
      });
    } catch (error) {
      throw new InternalServerErrorException('Email could not be updated');
    }
    return HttpStatus.OK;
  }

  async createCustomerId(user) {
    const customerStripeID = (
      await this.stripeService.createCustomer({
        email: user.email,
        name: user.firstName + ' ' + user.lastName,
      })
    ).id;
    this.prismaService.user.update({
      where: { email: user.email },
      data: { customerStripeID },
    });
    return customerStripeID;
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    const updateData = {
      ...updateUserDto,
    };
    const user = await this.prismaService.user.update({
      where: { id: userId },
      data: updateData,
      include: { roles: true, companies: true },
    });

    if (!user) {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }
  }

  async checkPassword(loginDto: LoginDto): Promise<boolean> {
    const user = await this.prismaService.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }

    return bcrypt.compare(loginDto.password, user.password);
  }

  // TOOD: Send email to user before deleting account
  // TODO: Delete user from all tables that have a foreign key to user table before deleting the user itself (cascade delete)
  // TOOD: Soft delete user instead of hard delete

  async deleteUser(id: string): Promise<User> {
    try {
      return await this.prismaService.user.update({
        where: { id },
        data: { isActive: false, deletedAt: new Date() },
      });
    } catch {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }
  }

  async harddeleteUser(id: string): Promise<User> {

    try {
      return await this.prismaService.user.delete({
        where: { id },
      });
    } catch {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }
  }
  async setNewPassword(userId: string, newPassword: string): Promise<void> {
    const hash = await this.hashPassword(newPassword);
    await this.prismaService.user.update({
      where: { id: userId },
      data: { password: hash },
    });
  }

  async verifyUserEmail(
    email: string,
  ): Promise<{ message: string; status: number }> {
    await this.prismaService.user.update({
      where: { email },
      data: { emailConfirmed: true },
    });

    return { message: 'Email verified', status: 200 };
  }

  async verifyUserPhone(
    email: string,
  ): Promise<{ message: string; status: number }> {
    await this.prismaService.user.update({
      where: { email },
      data: { telephoneConfirmed: true },
    });

    return { message: 'Telephone verified', status: 200 };
  }

  async editRoles(userId: string, newRoles: RoleType[]): Promise<SafeUser> {
    await this.prismaService.userRole.deleteMany({
      where: { userId: userId },
    });

    const roles = newRoles.map((role) => ({
      userId: userId,
      role,
    }));

    await this.prismaService.userRole.createMany({
      data: roles,
    });

    return await this.findUserById(userId);
  }

  private async hashPassword(password: string): Promise<string> {
    const saltOrRounds = 10;
    return bcrypt.hash(password, saltOrRounds);
  }
}
