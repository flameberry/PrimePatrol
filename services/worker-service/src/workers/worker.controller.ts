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
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Worker } from './schemas/worker.schema';

@ApiTags('Workers')
@Controller('api/v1/workers')
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

  @MessagePattern({ cmd: 'verify-workers' })
  async verifyWorkers(@Payload() data: { workerIds: string[] }) {
    // Logic to check if workers exist in DB
    return true; // or false if workers do not exist
  }

  @MessagePattern({ cmd: 'verify-worker' })
  async verifyWorker(@Payload() data: { workerId: string }) {
    // Logic to check if a single worker exists
    return true; // or false if worker does not exist
  }

  @Post()
  @ApiOperation({ summary: 'Create a new worker' })
  @ApiBody({ type: CreateWorkerDto })
  @ApiResponse({ status: 201, description: 'Worker created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createWorkerDto: CreateWorkerDto) {
    return this.workerService.create(createWorkerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all workers' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of all workers',
    type: [Worker],
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll(): Promise<Worker[]> {
    return this.workerService.findAll();
  }


  @Get('findByIds')
  @ApiOperation({ summary: 'Find workers by IDs' })
  @ApiQuery({
    name: 'ids',
    required: true,
    description: 'Comma-separated list of worker IDs',
    example: '67b5b9f2ff4e5d1436086f51,67b5b9e5ff4e5d1436086f4f',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the list of workers',
    isArray: true,
  })
  @ApiResponse({ status: 400, description: 'Invalid worker IDs' })
  @ApiResponse({ status: 404, description: 'One or more workers not found' })
  async findByIds(@Query('ids') ids: string) {
    const workerIds = ids.split(',');
    return this.workerService.findWorkersByIds(workerIds);
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
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
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
    const assignedPostIds = body.assignedPosts.map(
      (postId) => new Types.ObjectId(postId),
    );
    return this.workerService.updateAssignedPosts(id, assignedPostIds);
  }

  @Patch(':id/assign-post')
  @ApiOperation({
    summary: 'Assign a post to a worker and update their status',
  })
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
  @ApiResponse({
    status: 200,
    description: 'Worker assignment and status updated',
  })
  @ApiResponse({ status: 404, description: 'Worker not found' })
  async assignPostAndUpdateStatus(
    @Param('id') id: string,
    @Body() body: { assignedPosts: string[]; status: string },
  ) {
    // Convert string IDs to mongoose.Types.ObjectId
    const assignedPostIds = body.assignedPosts.map(
      (postId) => new Types.ObjectId(postId),
    );
    return this.workerService.updateWorkerAssignment(
      id,
      assignedPostIds,
      body.status,
    );
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
