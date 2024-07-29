import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadFileModule } from './upload-file/upload-file.module';
import { LogsModule } from './logs/logs.module';

@Module({
  imports: [UploadFileModule, LogsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
