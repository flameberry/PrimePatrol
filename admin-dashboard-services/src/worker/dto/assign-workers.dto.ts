import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignWorkersDto {
  @ApiProperty({
    description: 'Array of worker IDs to assign',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  workerIds: string[];
}