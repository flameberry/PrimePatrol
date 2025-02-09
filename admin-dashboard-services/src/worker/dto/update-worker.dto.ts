import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkerDto } from './create-worker.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateWorkerDto extends PartialType(CreateWorkerDto) {
  @ApiProperty({ example: 1, description: 'Worker ID' })
  id: number;

  @ApiProperty({ example: 'active', description: 'Status of the worker' })
  status?: string;
}
