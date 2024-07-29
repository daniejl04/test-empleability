import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUploadFileDto {
  @IsNotEmpty()
  @IsString()
  fileName: string; // Name to the uploaded fiile

}
