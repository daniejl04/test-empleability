import { IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RemoveDuplicatesDto {
  @ApiProperty({
    description: 'Array of field names to check for duplicates',
    type: [String],
    example: ['email', 'username'],
  })
  @IsArray()
  fields: string[];
}
