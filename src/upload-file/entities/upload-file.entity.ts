import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import * as mongoose from "mongoose";
const AutoIncrement = require('mongoose-sequence')(mongoose);

@Schema()
export class UploadFileLog extends Document {

  @Prop({ unique: true })
  id: number;

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

const UploadFileLogSchema = SchemaFactory.createForClass(UploadFileLog);

UploadFileLogSchema.plugin(AutoIncrement, { inc_field: 'id' });

export { UploadFileLogSchema };

