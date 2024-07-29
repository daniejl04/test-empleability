import { Injectable } from '@nestjs/common';
import * as cloudinary from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';

@Injectable()
export class CloudStorageService {
  private cloudinary;

  constructor(private configService: ConfigService) {
    this.cloudinary = cloudinary.v2;
    this.cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(
    key: string,
    content: Buffer,
    contentType: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      this.cloudinary.uploader
        .upload_stream(
          {
            public_id: key,
            resource_type: 'raw', // para archivos que no son imágenes
            unique_filename: true,
            format: contentType.split('/')[1], // usa el formato del tipo de contenido
          },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result.secure_url);
          },
        )
        .end(content);
    });
  }

  async getFile(key: string): Promise<string> {
    // En Cloudinary, la URL del archivo puede ser obtenida usando el `public_id`.
    return `https://res.cloudinary.com/${this.configService.get('CLOUDINARY_CLOUD_NAME')}/raw/upload/${key}`;
  }

  generateFileKey(content: Buffer, filename: string): string {
    const hash = createHash('sha256').update(content).digest('hex');
    return `${hash}-${filename}`;
  }
}
