import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { RoleType, User, } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { v4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import {
  ChangeEmailDto,
  UpdateUserDto,
} from 'src/dtos/user.dto';
import { SafeUser } from 'src/common/interfaces/safe-user.interface';
import { isUUID } from 'class-validator';
import { LoginDto, RegisterDto } from 'src/dtos/auth.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
  ) {}

  private toSafeUser(
    user: User & { roles: { role: RoleType }[] },
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
      createdAt: user.createdAt,
      telephone: user.telephone,
      roles: user.roles.map((role) => role.role),
    };
  }

  async findOne(email: string): Promise<User | undefined> {
    return this.prismaService.user.findUnique({
      where: { email },
      include: {
        roles: true,
      },
    });
  }

async getAllUsers(): Promise<SafeUser[]> {
    const users = await this.prismaService.user.findMany({
      where: { deletedAt: null },
      include: {
        roles: true,
      },
    });
    return users.map((user) => this.toSafeUser(user));
  }

  async findUserByEmail(email: string): Promise<SafeUser> {
    const user = await this.prismaService.user.findUnique({
      where: { email , deletedAt: null},
      include: {
        roles: true,
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
      },
    });
  
    return user ? this.toSafeUser(user) : null;
  }
  

  async findUserById(id: string): Promise<SafeUser> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      include: {
        roles: true,
      },
    });

    if (!user) {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }

    return this.toSafeUser(user);
  }


  async createUser(userData: RegisterDto): Promise<SafeUser> {
    const user = await this.findOne(userData.email);
    if (user) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }
    const hash = await this.hashPassword(userData.password);
    const newUser = await this.prismaService.user.create({
      data: { ...userData, id: v4(), password: hash } as any,
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
        include: { roles: true},
      });
    } catch (error) {
      throw new InternalServerErrorException('Email could not be updated');
    }
    return HttpStatus.OK;
  }

  
  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    const updateData = {
      ...updateUserDto,
    };
    const user = await this.prismaService.user.update({
      where: { id: userId },
      data: updateData,
      include: { roles: true},
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
