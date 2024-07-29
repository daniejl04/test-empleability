import { Module } from '@nestjs/common';
import { FilesController } from './upload-file.controller';
import { FilesService } from './upload-file.service';
import { LogsModule } from 'src/logs/logs.module'; 
import { CloudStorageModule } from 'src/cloud-storage/cloud-storage.module';

@Module({
  imports: [LogsModule, CloudStorageModule],
  controllers: [FilesController],
  providers: [FilesService], 

})
export class UploadFileModule {}
