import { User as PrismaUser } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity implements PrismaUser {
  id: string;
  email: string;
  
  @Exclude()
  password: string;
  
  firstName: string;
  lastName: string | null;
  telephone: string | null;
  profileImage: string | null;
  notifications: boolean;
  emailConfirmed: boolean;
  telephoneConfirmed: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  isActive: boolean;
  loginProvider: any;
  enableToken: string;
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
  address: string;
}