import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Response,
  Query,
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
@Controller('files') // Define el ruta base para este controlador.
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  // Endpoint para cargar y procesar un archivo CSV.
  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // Usa FileInterceptor para manejar archivos cargados.
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
    @UploadedFile() file: Express.Multer.File, // Obtiene el archivo cargado.
    @Response() res: Res, // Obtiene la respuesta para enviar de vuelta al cliente.
  ) {
    try {
      const result = await this.filesService.processCsv(file); // Procesa el archivo.
      res.setHeader('count', result.length); // Establece el encabezado 'count' con el total de registros.
      res.json(result); // Envía el archivo procesado en formato JSON.
    } catch (error) {
      // Maneja errores y envía una respuesta de error.
      res.status(500).json({
        message: 'Error processing the file',
        error: error.message,
      });
    }
  }

  // Endpoint para eliminar registros duplicados.
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
    @Body() removeDuplicatesDto: RemoveDuplicatesDto, // Usa el DTO para validar la solicitud.
    @Response() res: Res,
  ) {
    try {
      const result = await this.filesService.processCsv(file); // Procesa el archivo.
      const uniqueResults = this.filesService.removeDuplicates(result); // Elimina duplicados.
      res.setHeader('count', uniqueResults.length); // Establece el count.
      res.json(uniqueResults); // Envía los resultados únicos en formato JSON.
    } catch (error) {
      res.status(500).json({
        message: 'Error processing the file',
        error: error.message,
      });
    }
  }

  // Endpoint para validar el formato del archivo.
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
    @Body() validateFormatDto: ValidateFormatDto, // Usa el DTO para validar la solicitud.
    @Response() res: Res,
  ) {
    try {
      const result = await this.filesService.processCsv(file); // Procesa el archivo.
      const validatedResults = this.filesService.validateFormat(result); // Valida el formato.
      res.setHeader('count', validatedResults.length); // Establece el count.
      res.json(validatedResults); // Envía los resultados validados en formato JSON.
    } catch (error) {
      res.status(500).json({
        message: 'Error processing the file',
        error: error.message,
      });
    }
  }

  // Endpoint para ordenar registros.
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
    @Body() orderFileDto: OrderFileDto, // Usa el DTO para validar la solicitud.
    @Response() res: Res,
  ) {
    const { column, order } = orderFileDto; // Desestructura los valores del DTO.
    try {
      const result = await this.filesService.processCsv(file); // Procesa el archivo.
      const orderedResults = this.filesService.orderBy(result, column, order); // Ordena los resultados.
      res.setHeader('count', orderedResults.length); // Establece el count.
      res.json(orderedResults); // Envía los resultados ordenados en formato JSON.
    } catch (error) {
      res.status(500).json({
        message: 'Error processing the file',
        error: error.message,
      });
    }
  }
}
