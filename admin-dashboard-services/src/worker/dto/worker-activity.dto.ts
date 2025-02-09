import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateWorkerActivityDto {
  @ApiProperty({
    description: 'ID of the worker performing the activity',
    example: 1
  })
  @IsNumber()
  workerId: number;

  @ApiProperty({
    description: 'Type of action performed',
    example: 'started_work',
    enum: ['started_work', 'completed_work', 'added_comment', 'updated_status']
  })
  @IsString()
  action: string;

  @ApiProperty({
    description: 'Additional details about the activity',
    example: 'Started initial assessment of the water leak',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;
}