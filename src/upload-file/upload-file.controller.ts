import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Res,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './upload-file.service';
import { RemoveDuplicatesDto } from './dto/remove-duplicates.dto';
import { ValidateFormatDto } from './dto/validate-format.dto';
import { OrderFileDto } from './dto/order-file.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProcessFileResponse } from './dto/proces-files-response';
import { Response } from 'express';


@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload and process a CSV file' })
  @ApiResponse({
    status: 200,
    description: 'Successfully processed the file',
    schema: {
      type: 'object',
      properties: {
        fileUrl: { type: 'string' },
        data: { type: 'array', items: { type: 'object' } },
      },
    },
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response, // Usa Response de Express aquí
  ) {
    try {
      const result: ProcessFileResponse = await this.filesService.processCsv(file);
      res.setHeader('Content-Type', 'application/json');
      res.json(result);
    } catch (error) {
      res.status(500).json({
        message: 'Error processing the file',
        error: error.message,
      });
    }
  }

  @Post('remove-duplicates')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Remove duplicate records from the CSV file' })
  @ApiResponse({
    status: 200,
    description: 'Successfully removed duplicates',
    type: RemoveDuplicatesDto,
  })
  async removeDuplicates(
    @UploadedFile() file: Express.Multer.File,
    @Body() removeDuplicatesDto: RemoveDuplicatesDto,
    @Res() res: Response, // Usa Response de Express aquí
  ) {
    try {
      const { data } = await this.filesService.processCsv(file);
      const uniqueResults = this.filesService.removeDuplicates(data);
      res.setHeader('count', uniqueResults.length.toString()); // Convertir a string para el header
      res.json(uniqueResults);
    } catch (error) {
      res.status(500).json({
        message: 'Error processing the file',
        error: error.message,
      });
    }
  }

  @Post('validate-format')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Validate the format of records in the CSV file' })
  @ApiResponse({
    status: 200,
    description: 'Successfully validated the format',
    type: ValidateFormatDto,
  })
  async validateFormat(
    @UploadedFile() file: Express.Multer.File,
    @Body() validateFormatDto: ValidateFormatDto,
    @Res() res: Response, // Usa Response de Express aquí
  ) {
    try {
      const { data } = await this.filesService.processCsv(file);
      const finalResults = this.filesService.validateFormat(data);
      res.setHeader('count', finalResults.length.toString()); // Convertir a string para el header
      res.json(finalResults);
    } catch (error) {
      res.status(500).json({
        message: 'Error processing the file',
        error: error.message,
      });
    }
  }

  @Post('order')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Order records in the CSV file' })
  @ApiResponse({
    status: 200,
    description: 'Successfully ordered the records',
    type: OrderFileDto,
  })
  async orderFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() orderFileDto: OrderFileDto,
    @Res() res: Response, // Usa Response de Express aquí
  ) {
    const { column, order } = orderFileDto;
    try {
      const { data } = await this.filesService.processCsv(file);
      const orderedResults = this.filesService.orderBy(data, column, order);
      res.setHeader('count', orderedResults.length.toString()); // Convertir a string para el header
      res.json(orderedResults);
    } catch (error) {
      res.status(500).json({
        message: 'Error processing the file',
        error: error.message,
      });
    }
  }
}
