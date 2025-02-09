import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreatePostDto {
	@ApiProperty({
	  description: 'The title of the post',
	  example: 'Water Leak in Building A'
	})
	@IsString()
	@IsNotEmpty()
	title: string;
  
	@ApiProperty({
	  description: 'The content of the post',
	  example: 'Major water leak detected in the basement of Building A'
	})
	@IsString()
	@IsNotEmpty()
	content: string;
  }