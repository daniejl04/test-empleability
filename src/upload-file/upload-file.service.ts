import { Injectable } from '@nestjs/common';
import * as csv from 'csv-parser';
import * as fs from 'fs';
import { LogService } from './log.service';
import { CloudStorageService } from './cloud-storage.service';
import { Readable } from 'stream';

@Injectable()
export class ParseCsvService {
  constructor(
    private readonly logService: LogService,
    private readonly cloudStorageService: CloudStorageService,
  ) {}

  async processCsv(file: Express.Multer.File): Promise<any> {
    const fileBuffer = fs.readFileSync(file.path);
    const fileHash = this.cloudStorageService.generateFileKey(
      fileBuffer,
      file.originalname,
    );

    // Verificar si ya se ha procesado antes
    const existingLog = await this.logService.findLogByHash(fileHash);
    if (existingLog) {
      // Retornar archivo almacenado en la nube
      const storedFile = await this.cloudStorageService.getFile(fileHash);
      return storedFile;
    }

    const results = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          const uniqueResults = this.removeDuplicates(results);
          const validatedResults = this.validateFormat(uniqueResults);

          await this.logService.logRequest(
            file.originalname,
            results.length,
            validatedResults.length,
            fileHash,
          );

          // Convertir a JSON y subir a la nube
          const jsonContent = Buffer.from(JSON.stringify(validatedResults));
          await this.cloudStorageService.uploadFile(
            fileHash,
            jsonContent,
            'application/json',
          );

          fs.unlinkSync(file.path); // Eliminar archivo después de procesar

          resolve(validatedResults);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  removeDuplicates(data: any[]): any[] {
    const uniqueSet = new Set(data.map((item) => JSON.stringify(item)));
    return Array.from(uniqueSet).map((item) => JSON.parse(item));
  }

}
