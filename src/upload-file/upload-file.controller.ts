import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Response,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParseCsvService } from './parse-csv.service';
import { Response as Res } from 'express';

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
      const result = await this.parseCsvService.processCsv(file);

      // Configurar el encabezado count y enviar la respuesta JSON
      res.setHeader('count', result.length);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error al procesar el archivo', error });
    }
  }
}
