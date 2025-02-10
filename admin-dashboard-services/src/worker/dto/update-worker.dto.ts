import { PartialType } from '@nestjs/swagger';
import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateWorkerDto } from './create-worker.dto';

export class UpdateWorkerDto extends PartialType(CreateWorkerDto) {
  @ApiProperty({
    description: 'The current status of the worker',
    enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE'],
    example: 'ACTIVE'
  })
  @IsString()
  @IsEnum(['ACTIVE', 'INACTIVE', 'ON_LEAVE'])
  status: string;
}