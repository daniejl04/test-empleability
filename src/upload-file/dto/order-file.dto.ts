import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum Order {
  ASC = 'asc',
  DESC = 'desc',
}

export class OrderFileDto {
  @ApiProperty({
    description: 'The column to sort by',
    type: String,
    example: 'name',
  })
  @IsString()
  column: string;

  @ApiProperty({
    description: 'The order of sorting',
    enum: Order,
    example: 'asc',
  })
  @IsEnum(Order)
  order: Order;
}
