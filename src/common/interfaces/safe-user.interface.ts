  import {  LoginProvider, RoleType } from '@prisma/client';

  export interface SafeUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    telephone?: string;
    customerStripeID?: string;
    profileImage?: string;
    notifications: boolean;
    emailConfirmed: boolean;
    telephoneConfirmed: boolean;
    assignedAstrologer?: string;
    roles: RoleType[]; // Kullanıcı birden fazla role sahip olabileceği için Role[] olarak ayarladık
    isActive: boolean;
    loginProvider: LoginProvider;
    address?: Address;
    createdAt: Date;
    companies?: CompanyUser[];
  }

export interface Address {
  country: string;
  city: string;
  state: string;
  zipCode: string;
  streetAddress: string;
}

export interface CompanyUser {
  companyId: string;
  role: RoleType;
  createdAt: Date;
}

