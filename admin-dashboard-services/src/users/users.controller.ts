import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';

@Controller('users')
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
          name: "John Doe",
          email: "johndoe@example.com",
          password: "password123",
        },
        description: "Example of a new user to be created"
      }
    }
  })
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
          password: 'password123'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'janesmith@example.com',
          password: 'password456'
        }
      ]
    }
  })
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the user to retrieve' })
  @ApiResponse({
    status: 200,
    description: 'Returns the user by ID',
    schema: {
      example: {
        id: '1',
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'password123'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the user to update' })
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      update: {
        value: {
          name: 'John Doe Updated',
          email: 'johnupdated@example.com',
          password: 'newpassword123'
        },
        description: "Example of user update payload"
      }
    }
  })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the user to delete' })
  @ApiResponse({ status: 200, description: 'User removed successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
