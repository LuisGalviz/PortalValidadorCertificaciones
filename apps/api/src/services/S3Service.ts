import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config/index.js';

const s3Client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

export class S3Service {
  async getSignedUrl(key: string, expiresIn = 3300): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: config.aws.s3Bucket,
      Key: key,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
  }

  async uploadFile(
    key: string,
    body: Buffer | Uint8Array | Blob | string,
    contentType: string
  ): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: config.aws.s3Bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    await s3Client.send(command);
  }
}

export const s3Service = new S3Service();
