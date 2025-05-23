import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { AssignWorkersDto } from '../worker/dto/assign-workers.dto';
import { CreateWorkerActivityDto } from '../worker/dto/worker-activity.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { memoryStorage } from 'multer';
import { Types } from 'mongoose';

@Controller('api/v1/posts')
@ApiTags('Posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(), // Use memory storage instead of disk storage
    })
  )
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.postsService.create(createPostDto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts' })
  @ApiResponse({
    status: 200,
    description: 'Returns all posts with their assigned workers and activities.',
    isArray: true,
  })
  findAll() {
    return this.postsService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get statistics on posts' })
  @ApiResponse({
    status: 200,
    description: 'Returns total, active, and resolved post counts.',
  })
  async getPostStats() {
    return this.postsService.getPostStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a post by ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the post',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the post with assigned workers and activities.',
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  findOne(@Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }
    return this.postsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a post' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the post to update',
    type: String,
  })
  @ApiBody({ type: UpdatePostDto, description: 'Post update payload' })
  @ApiResponse({
    status: 200,
    description: 'The post has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the post to delete',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The post has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }

  @Post(':id/workers')
  @ApiOperation({ summary: 'Assign workers to a post' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the post',
    type: String,
  })
  @ApiBody({
    type: AssignWorkersDto,
    description: 'Worker IDs to assign to the post',
  })
  @ApiResponse({
    status: 200,
    description: 'Workers have been successfully assigned to the post.',
  })
  @ApiResponse({ status: 404, description: 'Post or worker(s) not found' })
  assignWorkers(@Param('id') id: string, @Body() assignWorkersDto: AssignWorkersDto) {
    return this.postsService.assignWorkers(id, assignWorkersDto);
  }

  @Post(':id/activities')
  @ApiOperation({ summary: 'Log worker activity on a post' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the post',
    type: String,
  })
  @ApiBody({
    type: CreateWorkerActivityDto,
    description: 'Worker activity details',
  })
  @ApiResponse({
    status: 201,
    description: 'The activity has been successfully logged.',
  })
  @ApiResponse({ status: 404, description: 'Post or worker not found' })
  logActivity(@Param('id') id: string, @Body() activityDto: CreateWorkerActivityDto) {
    return this.postsService.logWorkerActivity(id, activityDto);
  }

  @Get(':id/activities')
  @ApiOperation({ summary: 'Get all activities for a post' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the post',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all activities for the post.',
    isArray: true,
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  getActivities(@Param('id') id: string) {
    return this.postsService.getWorkerActivities(id);
  }
}