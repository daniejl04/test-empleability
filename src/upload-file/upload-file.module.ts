import { Module } from '@nestjs/common';
import { UploadFileService } from './upload-file.service';
import { FilesController } from './upload-file.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadFileLog, UploadFileLogSchema } from './entities/upload-file.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UploadFileLog.name, schema: UploadFileLogSchema },
    ]),
  ],
  controllers: [FilesController],
  providers: [UploadFileService],
})
export class UploadFileModule {}
