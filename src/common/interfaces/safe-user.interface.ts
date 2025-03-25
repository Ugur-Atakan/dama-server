  import {UserRole } from '@prisma/client';

  export interface SafeUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    telephone?: string;
    profileImage?: string;
    notifications: boolean;
    emailConfirmed: boolean;
    telephoneConfirmed: boolean;
    roles: UserRole[]; // Kullanıcı birden fazla role sahip olabileceği için Role[] olarak ayarladık
    isActive: boolean;
    createdAt: Date;
  }
