import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class R2Service {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl?: string;

  constructor(private readonly config: ConfigService) {
    const accountId = this.config.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = this.config.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('R2_SECRET_ACCESS_KEY');
    const region = this.config.get<string>('R2_REGION') || 'auto';
    // Support both R2_BUCKET and legacy R2_BUCKET_NAME
    const bucket =
      this.config.get<string>('R2_BUCKET') ||
      this.config.get<string>('R2_BUCKET_NAME');
    this.bucket = bucket as string;
    this.publicBaseUrl = this.config.get<string>('R2_PUBLIC_BASE_URL');

    if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
      throw new Error(
        'Missing Cloudflare R2 configuration. Ensure R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET (or R2_BUCKET_NAME) are set.',
      );
    }

    this.s3 = new S3Client({
      region,
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadObject(params: {
    key: string;
    body: Buffer;
    contentType?: string;
    aclPublic?: boolean;
  }): Promise<string> {
    const { key, body, contentType } = params;
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType || 'application/octet-stream',
      }),
    );

    // Prefer explicit public base URL if provided (e.g. custom domain or r2.dev)
    if (this.publicBaseUrl) {
      return `${this.publicBaseUrl.replace(/\/$/, '')}/${key}`;
    }
    // Fallback to S3 endpoint-style URL (may not be public if bucket is private)
    return `https://${this.config.get<string>('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com/${this.bucket}/${key}`;
  }
}
