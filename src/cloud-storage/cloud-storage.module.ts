import { Module } from '@nestjs/common';
import { CloudStorageService } from './cloud-storage.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports:[ConfigModule.forRoot()],
  controllers: [],
  providers: [CloudStorageService],
})
export class CloudStorageModule {}
