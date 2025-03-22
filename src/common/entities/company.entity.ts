// src/companies/entities/company.entity.ts
import { $Enums, Company as PrismaCompany } from '@prisma/client';
import {
  CompanyUser as PrismaCompanyMember,
  CompanyRole,
} from '@prisma/client';

export class CompanyEntity implements PrismaCompany {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  companyName: string;
  monetaryValue: number;
  status: $Enums.CompanyStatus;
  purchasedPricingPlanId: string;
  addressPreference: $Enums.AddressPreferenceType;
  businessActivity: string;
  companyTypeId: string;
  compensationMethod: $Enums.CompensationMethod;
  customAddress: string;
  hiringPlans: string;
  optionPoolHasPool: boolean;
  optionPoolShares: number;
  optionPoolSize: number;
  parValuePerShare: number;
  stateId: string;
  totalShares: number;
  deletedAt: Date | null;
  vestingSchedule: string;
  constructor(partial: Partial<CompanyEntity>) {
    Object.assign(this, partial);
  }
}

export class CompanyMemberEntity implements PrismaCompanyMember {
  id: string;
  companyId: string;
  userId: string;
  role: CompanyRole;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(partial: Partial<CompanyMemberEntity>) {
    Object.assign(this, partial);
  }
}
