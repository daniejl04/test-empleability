import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Response,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { Response as Res } from 'express';
import { ParseCsvService } from './upload-file.service';

@Controller('files')
export class FilesController {
  constructor(private readonly parseCsvService: ParseCsvService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Response() res: Res,
  ) {
    try {
      // Procesar el archivo usando el servicio
      const result = await this.parseCsvService.processCsv(file);

      // Configurar el encabezado 'count' con el total de registros
      res.setHeader('count', result.length);

      // Enviar el archivo procesado en formato JSON
      res.json(result);
    } catch (error) {
      // Manejar errores y enviar una respuesta de error
      res
        .status(500)
        .json({
          message: 'Error al procesar el archivo',
          error: error.message,
        });
    }
  }
}
