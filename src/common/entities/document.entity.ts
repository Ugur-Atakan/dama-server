// src/documents/entities/document.entity.ts
import { Document as PrismaDocument } from '@prisma/client';

export class DocumentEntity implements PrismaDocument {
  id: string;
  companyId: string;
  name: string;
  path: string;
  content: string | null;
  type: string | null;
  size: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  isActive: boolean;
  uploadedById: string;
  key: string;
  bucketName: string;
  link: string;
  documentType: string;
  fileType: string;
  fromStaff: boolean;

  constructor(partial: Partial<DocumentEntity>) {
    Object.assign(this, partial);
  }
  
}
