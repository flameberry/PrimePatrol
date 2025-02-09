import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

export class AssignWorkersDto {
  @ApiProperty({
    description: 'Array of worker IDs to assign to the post',
    example: [1, 2, 3],
    type: [Number]
  })
  @IsArray()
  @IsNumber({}, { each: true })
  workerIds: number[];
}