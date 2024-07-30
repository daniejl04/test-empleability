import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as csv from 'csv-parser';
import { CloudStorageService } from 'src/cloud-storage/cloud-storage.service';
import { LogService } from 'src/logs/logs.service';
import { ProcessFileResponse } from './dto/proces-files-response';

@Injectable()
export class FilesService {
  constructor(
    private readonly logService: LogService,
    private readonly cloudStorageService: CloudStorageService,
  ) {}
  async processCsv(file: Express.Multer.File): Promise<ProcessFileResponse> {
    const fileBuffer = fs.readFileSync(file.path);
    const fileHash = this.cloudStorageService.generateFileKey(
      fileBuffer,
      file.originalname,
    );
  
    const existingLog = await this.logService.findLogByHash(fileHash);
    if (existingLog) {
      const fileUrl = await this.cloudStorageService.getFile(fileHash);
      return {
        fileUrl,
        data: [], // Data is empty as we are returning an existing file
      };
    }
  
    const results: any[] = [];
  
    try {
      const result = await new Promise<ProcessFileResponse>((resolve, reject) => {
        fs.createReadStream(file.path)
          .pipe(csv())
          .on('data', (data) => {
            results.push(data);
            console.log('Data row:', data); // Registro de depuración para cada fila
          })
          .on('end', async () => {
            console.log('CSV processing complete');
            console.log('Results:', results); // Registro de depuración para los resultados
  
            if (results.length === 0) {
              reject(new Error('No data found in CSV file'));
              return;
            }
  
            const uniqueResults = this.removeDuplicates(results);
            console.log('Unique Results:', uniqueResults); // Registro de depuración para resultados únicos
  
            const validatedResults = this.validateFormat(uniqueResults);
            console.log('Validated Results:', validatedResults); // Registro de depuración para resultados validados
  
            const jsonContent = JSON.stringify(validatedResults, null, 2); // Pretty print JSON
            const fileHash = this.cloudStorageService.generateFileKey(
              Buffer.from(jsonContent),
              file.originalname,
            );
  
            try {
              await this.logService.logRequest(
                file.originalname,
                results.length,
                validatedResults.length,
                fileHash,
              );
  
              const fileUrl = await this.cloudStorageService.uploadFile(
                fileHash,
                Buffer.from(jsonContent),
                'application/json',
              );
  
              fs.unlinkSync(file.path); // Clean up file
  
              resolve({
                fileUrl,
                data: validatedResults,
              });
            } catch (logError) {
              reject(new Error(`Logging error: ${logError.message}`));
            }
          })
          .on('error', (error) => {
            reject(new Error(`Error reading CSV file: ${error.message}`));
          });
      });
  
      return result;
    } catch (error) {
      console.error('Error processing file:', error);
      throw error; // Re-throw the error to be handled by the controller
    }
  }
  
  
  removeDuplicates(data: any[]): any[] {
    const uniqueSet = new Set(data.map((item) => JSON.stringify(item)));
    const uniqueArray = Array.from(uniqueSet).map((item) => JSON.parse(item));
    console.log('After removing duplicates:', uniqueArray); // Registro de depuración
    return uniqueArray;
  }
  
  validateFormat(data: any[]): any[] {
    const validatedArray = data.filter((record) => {
      return Object.values(record).every((value) => value !== null && value !== '');
    });
    console.log('After format validation:', validatedArray); // Registro de depuración
    return validatedArray;
  }
  

  orderBy(data: any[], column: string, order: 'asc' | 'desc'): any[] {
    return data.sort((a, b) => {
      const aValue = a[column];
      const bValue = b[column];

      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1;
      } else if (aValue > bValue) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
}