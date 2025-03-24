import { Injectable, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FileManagerService {
  private supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService, private readonly prismaService: PrismaService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY')
    );
  }
  // Bucket yapılandırması
  private readonly buckets = {
    profileImage: 'profile-images',
    messageAttachment: 'message-attachments',
    document: 'documents',
  };

  private readonly folders = {
    supportMessageAttachment: 'support',
    taskMessageAttachment: 'task',
    company: 'company',
    ein: 'ein',
    annual: 'annual',
    boi: 'boi',
    other: 'other',
  };

  /**
   * Dosyayı uygun bucket ve klasöre yükler
   * @param fileType Dosya türü (profileImage, supportMessageAttachment, document vs.)
   * @param file Dosya buffer
   * @param mimeType Dosyanın içeriği
   * @param originalName Orijinal dosya adı
   * @returns Public URL, Dosya Yolu, Bucket Adı
   */
  async uploadFile(fileType: keyof typeof this.folders | 'profileImage', file: Buffer, mimeType: string, originalName: string) {
    let bucket;
    let folderPath = '';

    if (fileType === 'profileImage') {
      bucket = this.buckets.profileImage;
    } else if (['supportMessageAttachment', 'taskMessageAttachment'].includes(fileType)) {
      bucket = this.buckets.messageAttachment;
      folderPath = this.folders[fileType]; // support veya task klasörü
    } else if (['company', 'ein', 'annual', 'boi', 'other'].includes(fileType)) {
      bucket = this.buckets.document;
      folderPath = this.folders[fileType]; // company, ein, annual vb.
    } else {
      throw new BadRequestException('Invalid file type');
    }

    // Dosya yolunu oluştur (Bucket içinde klasör yapısı korunsun)
    const filePath = `${folderPath}/${uuidv4()}_${originalName}`;

    // Supabase'e yükle
    const { data, error } = await this.supabase.storage.from(bucket).upload(filePath, file, {
      contentType: mimeType,
      upsert: true,
    });

    if (error) throw new Error(error.message);

    // Public URL oluştur
    const fileUrl = this.supabase.storage.from(bucket).getPublicUrl(filePath).data.publicUrl;

    return { fileUrl, filePath, bucket };
  }

  /**
   * Supabase'den dosyanın public URL'sini getir
   * @param bucket Bucket adı
   * @param filePath Dosya yolu
   */
  async getFileUrl(bucket: string, filePath: string) {
    return this.supabase.storage.from(bucket).getPublicUrl(filePath).data.publicUrl;
  }

  /**
   * Supabase'den dosyayı sil
   * @param bucket Bucket adı
   * @param filePath Dosya yolu
   */
  async deleteFile(bucket: string, filePath: string) {
    const { error } = await this.supabase.storage.from(bucket).remove([filePath]);
    if (error) throw new Error(error.message);
    return { message: 'File deleted successfully' };
  }
  
}
