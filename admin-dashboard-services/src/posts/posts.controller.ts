import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { AssignWorkersDto } from 'src/worker/dto/assign-workers.dto';
import { CreateWorkerActivityDto } from 'src/worker/dto/worker-activity.dto';

@ApiTags('posts')
@Controller('api/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ 
    status: 201, 
    description: 'The post has been successfully created.',
    type: CreatePostDto
  })
  @ApiBody({ 
    type: CreatePostDto,
    description: 'Post creation payload'
  })
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all posts with their assigned workers and activities.',
    isArray: true
  })
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a post by ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the post',
    type: Number
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the post with assigned workers and activities.'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Post not found'
  })
  findOne(@Param('id') id: number) {
    return this.postsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a post' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the post to update',
    type: Number
  })
  @ApiBody({ 
    type: UpdatePostDto,
    description: 'Post update payload'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'The post has been successfully updated.'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Post not found'
  })
  update(@Param('id') id: number, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the post to delete',
    type: Number
  })
  @ApiResponse({ 
    status: 200, 
    description: 'The post has been successfully deleted.'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Post not found'
  })
  remove(@Param('id') id: number) {
    return this.postsService.remove(id);
  }

  @Post(':id/workers')
  @ApiOperation({ summary: 'Assign workers to a post' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the post',
    type: Number
  })
  @ApiBody({ 
    type: AssignWorkersDto,
    description: 'Worker IDs to assign to the post'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Workers have been successfully assigned to the post.'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Post or worker(s) not found'
  })
  assignWorkers(
    @Param('id') id: number,
    @Body() assignWorkersDto: AssignWorkersDto
  ) {
    return this.postsService.assignWorkers(id, assignWorkersDto);
  }

  @Post(':id/activities')
  @ApiOperation({ summary: 'Log worker activity on a post' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the post',
    type: Number
  })
  @ApiBody({ 
    type: CreateWorkerActivityDto,
    description: 'Worker activity details'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'The activity has been successfully logged.'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Post or worker not found'
  })
  logActivity(
    @Param('id') id: number,
    @Body() activityDto: CreateWorkerActivityDto
  ) {
    return this.postsService.logWorkerActivity(id, activityDto);
  }

  @Get(':id/activities')
  @ApiOperation({ summary: 'Get all activities for a post' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the post',
    type: Number
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns all activities for the post.',
    isArray: true
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Post not found'
  })
  getActivities(@Param('id') id: number) {
    return this.postsService.getWorkerActivities(id);
  }
}