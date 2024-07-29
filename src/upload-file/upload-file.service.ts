import { LogService } from 'src/logs/logs.service';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as csv from 'csv-parser';
import { CloudStorageService } from 'src/cloud-storage/cloud-storage.service';
import { LogService } from './log.service';
import { CloudStorageService } from './cloud-storage.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';


@ApiTags('files')
@Injectable()
export class FilesService {
  constructor(
    private readonly logService: LogService,
    private readonly cloudStorageService: CloudStorageService,
  ) {}

  // Main method to process a CSV file.
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
    // Read the content of the uploaded file into memory.
    const fileBuffer = fs.readFileSync(file.path);
    
    // Generate a unique hash for the file based on its content.
    const fileHash = this.cloudStorageService.generateFileKey(
      fileBuffer,
      file.originalname,
    );

    // Check if the file has been processed before.
    const existingLog = await this.logService.findLogByHash(fileHash);
    if (existingLog) {
      // If a log exists, return the stored file from cloud storage.
      const storedFile = await this.cloudStorageService.getFile(fileHash);
      return storedFile;

    }

    const results = []; // Array to store processed data.
    return new Promise((resolve, reject) => {
      // Read the CSV file and process the data.
      fs.createReadStream(file.path)
        .pipe(csv()) // Use csv-parser to convert CSV to object.
        .on('data', (data) => results.push(data)) // Store each record in the array.
        .on('end', async () => {
          // Remove duplicates and validate the format of the results.
          const uniqueResults = this.removeDuplicates(results);
          const validatedResults = this.validateFormat(uniqueResults);

          // Log the request in the database.
          await this.logService.logRequest(
            file.originalname, // filename
            results.length, // totalRecords
            validatedResults.length, // processedRecords
            fileHash, // fileHash
          );

          // Convert validated results to JSON and upload to cloud storage.
          const jsonContent = Buffer.from(JSON.stringify(validatedResults));
          const fileUrl = await this.cloudStorageService.uploadFile(
            fileHash,
            jsonContent,
            'application/json',
          );

          fs.unlinkSync(file.path); // Delete the temporary file after processing.


          resolve(validatedResults); // Return the processed results.

        })
        .on('error', (error) => {
          reject(error); // Handle errors in reading the file.
        });
    });
  }

  // Method to remove duplicate records from the data.
  @ApiOperation({ summary: 'Remove duplicate records' })
  @ApiResponse({
    status: 200,
    description: 'Successfully removed duplicates from the data',
    type: [Object],
  })
  removeDuplicates(data: any[]): any[] {
    // Create a unique set from the records.
    const uniqueSet = new Set(data.map((item) => JSON.stringify(item)));
    return Array.from(uniqueSet).map((item) => JSON.parse(item)); // Convert back to object.
  }


  // Method to validate that all records have values in all columns.
  @ApiOperation({ summary: 'Validate the format of records' })
  @ApiResponse({
    status: 200,
    description: 'Successfully validated the format of the records',
    type: [Object],
  })
  validateFormat(data: any[]): any[] {
    return data.filter(record => {
      // Filter records that have non-null and non-empty values.
      return Object.values(record).every(value => value !== null && value !== '');
    });
  }

  // Method to sort records by a specific column.
  @ApiOperation({ summary: 'Order records by a specific column' })
  @ApiResponse({
    status: 200,
    description: 'Successfully ordered the records',
    type: [Object],
  })
  orderBy(data: any[], column: string, order: 'asc' | 'desc'): any[] {
    // Sort records based on the value of the specified column.
    return data.sort((a, b) => {
      const aValue = a[column];
      const bValue = b[column];

      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1; // Determine the order.
      } else if (aValue > bValue) {
        return order === 'asc' ? 1 : -1; // Determine the order.
      }
      return 0; // They are equal.
    });
  }
}
