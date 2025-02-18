import { IsString, IsEmail, IsBoolean, IsOptional, IsArray, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional() // Optional field for firebaseId
  firebaseId?: string;

  @IsString()
  password: string;

  @IsBoolean()
  @IsOptional() // Optional field for isActive
  isActive?: boolean;

  @IsArray()
  @IsOptional() // Optional field for postIds array
  @IsMongoId({ each: true }) // Ensures each element in the array is a valid ObjectId
  postIds?: Types.ObjectId[];
}
