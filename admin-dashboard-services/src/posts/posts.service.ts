import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { WorkerActivity } from 'src/worker/entities/worker-activity.entity';
import { AssignWorkersDto } from 'src/worker/dto/assign-workers.dto';
import { CreateWorkerActivityDto } from 'src/worker/dto/worker-activity.dto';
import { Worker } from 'src/worker/entities/worker.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(Worker)
    private readonly workerRepository: Repository<Worker>,
    @InjectRepository(WorkerActivity)
    private readonly workerActivityRepository: Repository<WorkerActivity>
  ) {}

  async create(createPostDto: CreatePostDto) {
    const post = this.postsRepository.create(createPostDto);
    return await this.postsRepository.save(post);
  }

  async findAll() {
    return await this.postsRepository.find({
      relations: ['assignedWorkers', 'workerActivities']
    });
  }

  async findOne(id: number) {
    return await this.postsRepository.findOne({
      where: { id },
      relations: ['assignedWorkers', 'workerActivities']
    });
  }

  async assignWorkers(postId: number, assignWorkersDto: AssignWorkersDto) {
    const post = await this.findOne(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Find the workers and handle the case where some workers don't exist
    const workers = await this.workerRepository.findByIds(assignWorkersDto.workerIds);
    if (workers.length !== assignWorkersDto.workerIds.length) {
      throw new NotFoundException('Some workers not found');
    }

    post.assignedWorkers = workers;
    return await this.postsRepository.save(post);
  }

  async logWorkerActivity(postId: number, activityDto: CreateWorkerActivityDto) {
    const post = await this.findOne(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const worker = await this.workerRepository.findOne({
      where: { id: activityDto.workerId }
    });
    if (!worker) {
      throw new NotFoundException('Worker not found');
    }

    const activity = this.workerActivityRepository.create({
      post, // Explicitly referencing the post
      worker, // Explicitly referencing the worker
      action: activityDto.action,
      description: activityDto.description
    });

    return await this.workerActivityRepository.save(activity);
  }

  async getWorkerActivities(postId: number) {
    const post = await this.findOne(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return await this.workerActivityRepository.find({
      where: { post: { id: postId } },
      relations: ['worker'],
      order: { timestamp: 'DESC' }
    });
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const post = await this.findOne(id);
    if (!post) {
      throw new NotFoundException();
    }

    Object.assign(post, updatePostDto);
    return await this.postsRepository.save(post);
  }

  async remove(id: number) {
    const post = await this.findOne(id);
    if (!post) {
      throw new NotFoundException();
    }

    return await this.postsRepository.remove(post);
  }
}
