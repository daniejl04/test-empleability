import { IsNotEmpty, IsString } from 'class-validator';

export class ValidateFormatDto {
  @IsNotEmpty()
  @IsString()
  columnName: string; // Name of the column to validate format
}
