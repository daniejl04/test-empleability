import { LogService } from 'src/logs/logs.service';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as csv from 'csv-parser';
import { CloudStorageService } from 'src/cloud-storage/cloud-storage.service';


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
      const storedFileUrl = await this.cloudStorageService.getFile(fileHash);
      return { url: storedFileUrl };
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
            file.originalname, // filename
            results.length, // totalRecords
            validatedResults.length, // processedRecords
            fileHash, // fileHash
          );

          // Convertir a JSON y subir a la nube
          const jsonContent = Buffer.from(JSON.stringify(validatedResults));
          const fileUrl = await this.cloudStorageService.uploadFile(
            fileHash,
            jsonContent,
            'application/json',
          );

          fs.unlinkSync(file.path); // Eliminar archivo después de procesar

          resolve({ url: fileUrl });
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  private removeDuplicates(data: any[]): any[] {
    const uniqueSet = new Set(data.map((item) => JSON.stringify(item)));
    return Array.from(uniqueSet).map((item) => JSON.parse(item));
  }

  private validateFormat(data: any[]): any[] {
    // Aquí puedes definir la validación del formato según tus necesidades
    // Por ejemplo, asegurarte de que cada objeto tenga todas las propiedades necesarias
    return data.filter((row) => {
      // Asegúrate de que cada columna tenga datos (esto es solo un ejemplo)
      return Object.values(row).every((value) => value !== '' && value != null);
    });
  }
}
