import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl?: string;
  private readonly isR2: boolean;
  private readonly accountId?: string;
  private readonly region: string;

  constructor(private readonly config: ConfigService) {
    // Support both AWS S3 and Cloudflare R2 envs for flexibility.
    const accessKeyId = this.config.get<string>('S3_ACCESS_KEY_ID') || this.config.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey =
      this.config.get<string>('S3_SECRET_ACCESS_KEY') || this.config.get<string>('R2_SECRET_ACCESS_KEY');
    this.region = this.config.get<string>('S3_REGION') || this.config.get<string>('R2_REGION') || 'us-east-1';
    this.bucket =
      this.config.get<string>('S3_BUCKET') ||
      this.config.get<string>('R2_BUCKET') ||
      (this.config.get<string>('R2_BUCKET_NAME') as string);

    const endpoint = this.config.get<string>('S3_ENDPOINT');

    // R2 specifics (S3-compatible)
    this.accountId = this.config.get<string>('R2_ACCOUNT_ID') || undefined;
    this.isR2 = !!this.accountId && !endpoint; // if explicit S3 endpoint not set and account ID exists, assume R2

    this.publicBaseUrl = this.config.get<string>('S3_PUBLIC_BASE_URL') || this.config.get<string>('R2_PUBLIC_BASE_URL');

    if (!accessKeyId || !secretAccessKey || !this.bucket) {
      throw new Error(
        'Missing S3/R2 configuration. Ensure access keys and bucket are set (S3_* or R2_* envs).',
      );
    }

    this.s3 = new S3Client({
      region: this.region,
      endpoint: endpoint || (this.isR2 ? `https://${this.accountId}.r2.cloudflarestorage.com` : undefined),
      forcePathStyle: !!(endpoint || this.isR2), // path-style for custom endpoints/R2
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  async uploadObject(params: { key: string; body: Buffer; contentType?: string }): Promise<string> {
    const { key, body, contentType } = params;
    await this.s3.send(
      new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: body, ContentType: contentType }),
    );

    // Prefer explicit public base URL if provided (custom domain/CDN)
    if (this.publicBaseUrl) {
      return `${this.publicBaseUrl.replace(/\/$/, '')}/${key}`;
    }

    // Fallbacks for common providers
    if (this.isR2) {
      // Note: This endpoint URL is not always public unless bucket is public.
      return `https://${this.accountId}.r2.cloudflarestorage.com/${this.bucket}/${key}`;
    }

    // Default AWS S3-style URL
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async deleteObject(key: string): Promise<void> {
    if (!key) return;
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}

