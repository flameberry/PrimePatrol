import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';

@Controller('api/v1/users')
@ApiTags('Users')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      user: {
        value: {
          name: 'John Doe',
          email: 'johndoe@example.com',
          password: 'password123',
          firebaseId: 'firebase-id-123', // Optional
          postIds: [], // Optional
          isActive: true, // Optional
          fcm_token: 'fcm-token-123', // Optional
          latitude: 37.7749, // Optional
          longitude: -122.4194, // Optional
        },
        description: 'Example of a new user to be created',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Returns all users',
    isArray: true,
    schema: {
      example: [
        {
          id: '1',
          name: 'John Doe',
          email: 'johndoe@example.com',
          firebaseId: 'firebase-id-123',
          postIds: [],
          isActive: true,
          fcm_token: 'fcm-token-123',
          latitude: 37.7749,
          longitude: -122.4194,
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'janesmith@example.com',
          firebaseId: 'firebase-id-456',
          postIds: [],
          isActive: true,
          fcm_token: 'fcm-token-456',
          latitude: 34.0522,
          longitude: -118.2437,
        },
      ],
    },
  })
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the user to retrieve',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the user by ID',
    schema: {
      example: {
        id: '1',
        name: 'John Doe',
        email: 'johndoe@example.com',
        firebaseId: 'firebase-id-123',
        postIds: [],
        isActive: true,
        fcm_token: 'fcm-token-123',
        latitude: 37.7749,
        longitude: -122.4194,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Get('/firebase/:firebaseId')
  @ApiOperation({ summary: 'Get a user by FirebaseId' })
  @ApiParam({
    name: 'firebaseId',
    required: true,
    description: 'The firebaseId of the user to retrieve',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Returns the user by FirebaseId' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findByFirebaseId(@Param('firebaseId') firebaseId: string) {
    return this.userService.findByFirebaseId(firebaseId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the user to update',
    type: String,
  })
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      update: {
        value: {
          name: 'John Doe Updated',
          email: 'johnupdated@example.com',
          password: 'newpassword123',
          firebaseId: 'firebase-id-updated', // Optional
          postIds: [], // Optional
          isActive: false, // Optional
          fcm_token: 'fcm-token-updated', // Optional
          latitude: 37.7749, // Optional
          longitude: -122.4194, // Optional
        },
        description: 'Example of user update payload',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Put('update-fcm/:firebaseId')
  @ApiOperation({ summary: 'Update FCM token using FirebaseId' })
  @ApiParam({
    name: 'firebaseId',
    required: true,
    description: 'The FirebaseId of the user',
    type: String,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fcm_token: { type: 'string', example: 'new-fcm-token-456' },
      },
      required: ['fcm_token'],
    },
  })
  @ApiResponse({ status: 200, description: 'FCM token updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateFcmToken(
    @Param('firebaseId') firebaseId: string,
    @Body('fcm_token') fcm_token: string,
  ) {
    return this.userService.updateFcmToken(firebaseId, fcm_token);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the user to delete',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'User removed successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
