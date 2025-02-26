import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkerActivityDto {
  @ApiProperty({
    description: 'ID of the worker performing the activity',
  })
  @IsString()
  @IsNotEmpty()
  workerId: string;

  @ApiProperty({
    description: 'Type of action performed',
  })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({
    description: 'Additional details about the activity',
    required: false,
  })
  @IsString()
  description?: string;
}