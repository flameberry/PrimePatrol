import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { WorkerService } from './worker.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';

@ApiTags('Workers')
@Controller('workers')
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

  // HTTP-based create worker operation
  @Post()
  @ApiOperation({ summary: 'Create a new worker' })
  @ApiBody({ type: CreateWorkerDto })
  @ApiResponse({ status: 201, description: 'Worker created successfully' })
  async create(@Body() createWorkerDto: CreateWorkerDto) {
    return this.workerService.create(createWorkerDto);
  }

  // Microservice-based find all workers
  @MessagePattern('findAllWorker')
  @Get()
  @ApiOperation({ summary: 'Get all workers' })
  @ApiResponse({ status: 200, description: 'Returns all workers' })
  findAll() {
    return this.workerService.findAll();
  }

  // Microservice-based find worker by ID
  @MessagePattern('findOneWorker')
  @Get(':id')
  @ApiOperation({ summary: 'Find a worker by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Returns the worker details' })
  findOne(@Param('id') id: number) {
    return this.workerService.findOne(id);
  }

  // HTTP-based update worker status
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update worker status' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ schema: { properties: { status: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Worker status updated' })
  updateStatus(@Param('id') id: number, @Body() updateWorkerDto: UpdateWorkerDto) {
    return this.workerService.updateStatus(id, updateWorkerDto.status);
  }

  // HTTP-based remove worker
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a worker by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Worker deleted successfully' })
  remove(@Param('id') id: number) {
    return this.workerService.remove(id);
  }
}
