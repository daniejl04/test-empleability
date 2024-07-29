import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class FileData extends Document {

  @Prop({ unique: true })
  id: number;

  @Prop({ required: true })
  fileInit: string;

  @Prop({ required: true })
  fileEnd: string;

  @Prop()
  idLogs: number;

}

const UploadFileLogSchema = SchemaFactory.createForClass(FileData);


export { UploadFileLogSchema };
