// log.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LogService } from './logs.service';
import { Log, LogSchema } from './entities/log.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: Log.name, schema: LogSchema }])],
  providers: [LogService],
  exports: [LogService],
})
export class LogsModule {}
