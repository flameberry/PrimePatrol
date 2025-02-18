import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsOptional } from "class-validator";

export class CreatePostDto {
  @ApiProperty({
    description: 'The user ID associated with the post',
    example: 'user123',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'The title of the post',
    example: 'Water Leak in Building A',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'The content of the post',
    example: 'Major water leak detected in the basement of Building A',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'The image file (upload via multipart/form-data)',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  image?: Buffer; // Store image as a URL instead of Buffer
}
