import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkerDto {
  @ApiProperty({
    description: 'The name of the worker',
    example: 'John Doe'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Unique employee ID of the worker',
    example: 'EMP001'
  })
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({
    description: 'Unique employee ID of the worker',
    example: 'inactive'
  })
  @IsString()
  @IsNotEmpty()
  status: string;
}