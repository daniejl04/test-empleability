import { Module } from '@nestjs/common';
import { CloudStorageService } from './cloud-storage.service';

@Module({
  providers: [CloudStorageService],
  exports: [CloudStorageService], // Exporta el servicio para usarlo en otros módulos
})
export class CloudStorageModule {}
