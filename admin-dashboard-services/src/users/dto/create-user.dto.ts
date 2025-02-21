import { IsString, IsEmail, IsBoolean, IsOptional, IsArray, IsMongoId, IsNumber } from 'class-validator';
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

  @IsArray()
  @IsOptional() // Optional field for postIds array
  @IsMongoId({ each: true }) // Ensures each element in the array is a valid ObjectId
  postIds?: Types.ObjectId[];

  @IsBoolean()
  @IsOptional() // Optional field for isActive
  isActive?: boolean;

  @IsString()
  @IsOptional() // Optional field for fcm_token
  fcm_token?: string;

  @IsNumber()
  @IsOptional() // Optional field for latitude
  latitude?: number;

  @IsNumber()
  @IsOptional() // Optional field for longitude
  longitude?: number;
}