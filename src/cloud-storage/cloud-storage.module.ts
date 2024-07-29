import { Module } from '@nestjs/common';
import { CloudStorageService } from './cloud-storage.service';
import { CloudStorageController } from './cloud-storage.controller';

@Module({
  controllers: [CloudStorageController],
  providers: [CloudStorageService],
})
export class CloudStorageModule {}
