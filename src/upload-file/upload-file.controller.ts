import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Response,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response as Res } from 'express';
import { FilesService } from './upload-file.service';
import { RemoveDuplicatesDto } from './dto/remove-duplicates.dto';
import { ValidateFormatDto } from './dto/validate-format.dto';
import { OrderFileDto } from './dto/order-file.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

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
      type: 'array',
      items: { type: 'object' },
    },
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Response() res: Res,
  ) {
    try {
      const result = await this.filesService.processCsv(file);
      res.setHeader('count', result.length);
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
    @Response() res: Res,
  ) {
    try {
      const result = await this.filesService.processCsv(file);
      const uniqueResults = this.filesService.removeDuplicates(result);
      res.setHeader('count', uniqueResults.length);
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
    @Response() res: Res,
  ) {
    try {
      const result = await this.filesService.processCsv(file);
      const validatedResults = this.filesService.validateFormat(result);
      res.setHeader('count', validatedResults.length);
      res.json(validatedResults);
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
    @Response() res: Res,
  ) {
    const { column, order } = orderFileDto;
    try {
      const result = await this.filesService.processCsv(file);
      const orderedResults = this.filesService.orderBy(result, column, order);
      res.setHeader('count', orderedResults.length);
      res.json(orderedResults);
    } catch (error) {
      res.status(500).json({
        message: 'Error processing the file',
        error: error.message,
      });
    }
  }
}
