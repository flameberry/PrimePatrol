import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { WorkerService } from './worker.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';

@ApiTags('Workers')
@Controller('workers')
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new worker' })
  @ApiBody({ type: CreateWorkerDto })
  @ApiResponse({ status: 201, description: 'Worker created successfully' })
  async create(@Body() createWorkerDto: CreateWorkerDto) {
    return this.workerService.create(createWorkerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all workers' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns all workers',
    isArray: true
  })
  findAll() {
    return this.workerService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a worker by ID' })
  @ApiParam({ 
    name: 'id', 
    type: String,
    description: 'MongoDB ObjectId of the worker'
  })
  @ApiResponse({ status: 200, description: 'Returns the worker details' })
  @ApiResponse({ status: 404, description: 'Worker not found' })
  findOne(@Param('id') id: string) {
    return this.workerService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update worker status' })
  @ApiParam({ 
    name: 'id', 
    type: String,
    description: 'MongoDB ObjectId of the worker'
  })
  @ApiBody({ 
    schema: { 
      properties: { 
        status: { 
          type: 'string',
          enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE'] // Add your status options here
        } 
      } 
    } 
  })
  @ApiResponse({ status: 200, description: 'Worker status updated' })
  @ApiResponse({ status: 404, description: 'Worker not found' })
  updateStatus(@Param('id') id: string, @Body() updateWorkerDto: UpdateWorkerDto) {
    return this.workerService.updateStatus(id, updateWorkerDto.status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a worker by ID' })
  @ApiParam({ 
    name: 'id', 
    type: String,
    description: 'MongoDB ObjectId of the worker'
  })
  @ApiResponse({ status: 200, description: 'Worker deleted successfully' })
  @ApiResponse({ status: 404, description: 'Worker not found' })
  remove(@Param('id') id: string) {
    return this.workerService.remove(id);
  }
}