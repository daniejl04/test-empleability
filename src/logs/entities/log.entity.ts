import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LogDocument = Log & Document;

@Schema()
export class Log {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  totalRecords: number;

  @Prop({ required: true })
  processedRecords: number;

  @Prop({ required: true })
  timestamp: Date;

  @Prop({ required: true, unique: true })
  fileHash: string;
}


export const LogSchema = SchemaFactory.createForClass(Log);