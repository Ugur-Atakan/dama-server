export class CompanyObjectEntity {
  id: string;
  companyId: string;
  
  constructor(partial: Partial<CompanyObjectEntity>) {
    Object.assign(this, partial);
  }
}

