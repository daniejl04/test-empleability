
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as csv from 'csv-parser';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CloudStorageService } from 'src/cloud-storage/cloud-storage.service';
import { LogService } from 'src/logs/logs.service';


@ApiTags('files')
@Injectable()
export class FilesService {
  constructor(
    private readonly logService: LogService,
    private readonly cloudStorageService: CloudStorageService,
  ) {}


  @ApiOperation({ summary: 'Process a CSV file' })
  @ApiResponse({
    status: 200,
    description: 'Successfully processed the CSV file',
    schema: {
      type: 'array',
      items: { type: 'object' },
    },
  })
  async processCsv(file: Express.Multer.File): Promise<any> {

    const fileBuffer = fs.readFileSync(file.path);
    
    const fileHash = this.cloudStorageService.generateFileKey(
      fileBuffer,
      file.originalname,
    );

    const existingLog = await this.logService.findLogByHash(fileHash);
    if (existingLog) {
      // If a log exists, return the stored file from cloud storage.
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

      
          const jsonContent = Buffer.from(JSON.stringify(validatedResults));
          const fileUrl = await this.cloudStorageService.uploadFile(
            fileHash,
            jsonContent,
            'application/json',
          );

          fs.unlinkSync(file.path);


          resolve(validatedResults); 

        })
        .on('error', (error) => {
          reject(error); 
        });
    });
  }


  @ApiOperation({ summary: 'Remove duplicate records' })
  @ApiResponse({
    status: 200,
    description: 'Successfully removed duplicates from the data',
    type: [Object],
  })
  removeDuplicates(data: any[]): any[] {
    // Create a unique set from the records.
    const uniqueSet = new Set(data.map((item) => JSON.stringify(item)));
    return Array.from(uniqueSet).map((item) => JSON.parse(item)); 
  }



  @ApiOperation({ summary: 'Validate the format of records' })
  @ApiResponse({
    status: 200,
    description: 'Successfully validated the format of the records',
    type: [Object],
  })
  validateFormat(data: any[]): any[] {
    return data.filter(record => {

      return Object.values(record).every(value => value !== null && value !== '');
    });
  }


  @ApiOperation({ summary: 'Order records by a specific column' })
  @ApiResponse({
    status: 200,
    description: 'Successfully ordered the records',
    type: [Object],
  })
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
