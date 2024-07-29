import { Injectable } from '@nestjs/common';
import { Log, LogDocument } from './entities/log.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class LogService {
  constructor(@InjectModel(Log.name) private logModel: Model<LogDocument>) {}

  async logRequest(
    filename: string,
    totalRecords: number,
    processedRecords: number,
    fileHash: string,
  ): Promise<Log> {
    const newLog = new this.logModel({
      filename,
      totalRecords,
      processedRecords,
      timestamp: new Date(),
      fileHash,
    });

    return newLog.save();
  }

  async findLogByHash(fileHash: string): Promise<Log> {
    return this.logModel.findOne({ fileHash }).exec();
  }
}
