import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { FilesController } from './upload-file.controller';
import { FilesService } from './upload-file.service';
import { LogsModule } from 'src/logs/logs.module'; 
import { CloudStorageModule } from 'src/cloud-storage/cloud-storage.module';
import { CloudStorageService } from 'src/cloud-storage/cloud-storage.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    LogsModule, 
    CloudStorageModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService, CloudStorageService], 
})
export class UploadFileModule {}
