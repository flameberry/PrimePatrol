import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkerDto {
  @ApiProperty({
    description: 'The name of the worker',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'The role of the worker',
    example: 'Laborer',
  })
  role: string;

  @ApiProperty({
    description: 'The email of the worker',
    example: 'johndoe@example.com',
  })
  email: string;
  
  @ApiProperty({
    description: 'The contact number of the worker',
    example: '1234567890',
  })
  contactNumber: string;
}
