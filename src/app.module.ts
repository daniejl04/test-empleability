import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadFileModule } from './upload-file/upload-file.module';
//import { LogsModule } from './logs/logs.module';
import { PersistenceModule } from './persistence/persistence.module';
import { ConfigModule } from '@nestjs/config';
import { CloudStorageModule } from './cloud-storage/cloud-storage.module';
import dbConfig from './persistence/db-config';


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [dbConfig],
      isGlobal: true,
    }),
    PersistenceModule,
    UploadFileModule, 
    //LogsModule, 
    CloudStorageModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
