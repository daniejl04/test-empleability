import { Module } from '@nestjs/common';
import { FilesController } from './upload-file.controller';
import { FilesService } from './upload-file.service';
import { LogsModule } from 'src/logs/logs.module'; // Asegúrate de que esta ruta sea correcta
import { CloudStorageModule } from 'src/cloud-storage/cloud-storage.module';

@Module({
  imports: [LogsModule, CloudStorageModule], // Solo importa el módulo que contiene el servicio
  controllers: [FilesController],
  providers: [FilesService], // No incluyas LogService aquí
  // No es necesario exportar LogService desde UploadFileModule si ya está en LogsModule
})
export class UploadFileModule {}
