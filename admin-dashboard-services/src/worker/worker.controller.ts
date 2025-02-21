import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { WorkerService } from './worker.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import mongoose from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { Types } from 'mongoose'; // Import Types from mongoose



@ApiTags('Workers')
@Controller('workers')
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new worker' })
  @ApiBody({ type: CreateWorkerDto })
  @ApiResponse({ status: 201, description: 'Worker created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createWorkerDto: CreateWorkerDto) {
    return this.workerService.create(createWorkerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all workers or workers by IDs' })
  @ApiQuery({
    name: 'ids',
    required: false,
    description: 'Comma-separated list of worker IDs',
    example: '67b5b9f2ff4e5d1436086f51,67b5b9e5ff4e5d1436086f4f',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all workers or workers by IDs',
    isArray: true,
  })
  async findAll(@Query('ids') ids?: string) {
    if (ids) {
      const workerIds = ids.split(',');
      return this.workerService.findWorkersByIds(workerIds);
    }
    return this.workerService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a worker by ID' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'MongoDB ObjectId of the worker',
    example: '67b5b9f2ff4e5d1436086f51',
  })
  @ApiResponse({ status: 200, description: 'Returns the worker details' })
  @ApiResponse({ status: 404, description: 'Worker not found' })
  async findOne(@Param('id') id: string) {
    return this.workerService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update worker status' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'MongoDB ObjectId of the worker',
    example: '67b5b9f2ff4e5d1436086f51',
  })
  @ApiBody({
    schema: {
      properties: {
        status: {
          type: 'string',
          enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE'], // Add your status options here
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Worker status updated' })
  @ApiResponse({ status: 404, description: 'Worker not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.workerService.updateStatus(id, status);
  }

  @Patch(':id/assigned-posts')
  @ApiOperation({ summary: 'Update worker assigned posts' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'MongoDB ObjectId of the worker',
    example: '67b5b9f2ff4e5d1436086f51',
  })
  @ApiBody({
    schema: {
      properties: {
        assignedPosts: {
          type: 'array',
          items: {
            type: 'string',
          },
          example: ['67b79d806bb869d943773a52'], // Array of post IDs
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Worker assigned posts updated' })
  @ApiResponse({ status: 404, description: 'Worker not found' })
  async updateAssignedPosts(
    @Param('id') id: string,
    @Body() body: { assignedPosts: string[] }, // Array of post IDs as strings
  ) {
    // Convert string IDs to mongoose.Types.ObjectId
    const assignedPostIds = body.assignedPosts.map(postId => new Types.ObjectId(postId));
    return this.workerService.updateAssignedPosts(id, assignedPostIds);
  }

  @Patch(':id/assign-post')
@ApiOperation({ summary: 'Assign a post to a worker and update their status' })
@ApiParam({
  name: 'id',
  type: String,
  description: 'MongoDB ObjectId of the worker',
  example: '67b5b9f2ff4e5d1436086f51',
})
@ApiBody({
  schema: {
    properties: {
      assignedPosts: {
        type: 'array',
        items: {
          type: 'string',
        },
        example: ['67b79d806bb869d943773a52'], // Array of post IDs
      },
      status: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE'], // Add your status options here
      },
    },
  },
})
@ApiResponse({ status: 200, description: 'Worker assignment and status updated' })
@ApiResponse({ status: 404, description: 'Worker not found' })
async assignPostAndUpdateStatus(
  @Param('id') id: string,
  @Body() body: { assignedPosts: string[]; status: string },
) {
  // Convert string IDs to mongoose.Types.ObjectId
  const assignedPostIds = body.assignedPosts.map(postId => new Types.ObjectId(postId));
  return this.workerService.updateWorkerAssignment(id, assignedPostIds, body.status);
}


  @Delete(':id')
  @ApiOperation({ summary: 'Delete a worker by ID' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'MongoDB ObjectId of the worker',
    example: '67b5b9f2ff4e5d1436086f51',
  })
  @ApiResponse({ status: 200, description: 'Worker deleted successfully' })
  @ApiResponse({ status: 404, description: 'Worker not found' })
  async remove(@Param('id') id: string) {
    return this.workerService.remove(id);
  }
}