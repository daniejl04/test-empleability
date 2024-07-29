import { Module } from '@nestjs/common';
import { FilesController } from './upload-file.controller';
import { FilesService } from './upload-file.service';


@Module({
  controllers: [FilesController],
  providers: [FilesService],
})
export class UploadFileModule {}
