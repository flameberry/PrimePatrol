import { Injectable, NotFoundException, RequestTimeoutException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { Worker, WorkerDocument } from '../worker/schemas/worker.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AssignWorkersDto } from '../worker/dto/assign-workers.dto';
import { CreateWorkerActivityDto } from '../worker/dto/worker-activity.dto';
import { WorkerActivity, WorkerActivityDocument } from 'src/worker/schemas/worker.activity.schema';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Worker.name) private workerModel: Model<WorkerDocument>,
    @InjectModel(WorkerActivity.name) private workerActivityModel: Model<WorkerActivityDocument>
  ) {}

  async create(createPostDto: CreatePostDto, imageUrl: string) {
    const TIMEOUT_LIMIT = 30000;
    
    const post = new this.postModel({
      ...createPostDto,
    imageUrl, // Save imageUrl here
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new RequestTimeoutException()), TIMEOUT_LIMIT)
    );

    try {
      return await Promise.race([post.save(), timeoutPromise]);
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    const posts = await this.postModel
      .find()
      .populate('assignedWorkers')
      .populate('workerActivities')
      .exec();

    return posts.map(post => {
      if (post.imageUrl) {
        return {
          ...post.toObject(),
          imageUrl: `data:image/png;base64,${post.imageUrl}`,
        };
      }
      return post;
    });
  }

  async findOne(id: string) {
    const post = await this.postModel
      .findById(id)
      .populate('assignedWorkers')
      .populate('workerActivities')
      .exec();
    
    if (!post) throw new NotFoundException();

    if (post.imageUrl) {
      return {
        ...post.toObject(),
        imageUrl: `data:image/png;base64,${post.imageUrl}`,
      };
    }

    return post;
  }

  async assignWorkers(postId: string, { workerIds }: AssignWorkersDto) {
    const workers = await this.workerModel.find({ _id: { $in: workerIds } });
    if (workers.length !== workerIds.length) {
      throw new NotFoundException('Some workers not found');
    }

    const post = await this.postModel.findByIdAndUpdate(
      postId,
      { $set: { assignedWorkers: workerIds } },
      { new: true }
    ).populate('assignedWorkers');

    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async logWorkerActivity(postId: string, activityDto: CreateWorkerActivityDto) {
    const [post, worker] = await Promise.all([
      this.postModel.findById(postId),
      this.workerModel.findById(activityDto.workerId)
    ]);

    if (!post || !worker) {
      throw new NotFoundException('Post or worker not found');
    }

    const activity = new this.workerActivityModel({
      post: postId,
      worker: activityDto.workerId,
      action: activityDto.action,
      description: activityDto.description
    });

    const savedActivity = await activity.save();
    
    await Promise.all([
      this.postModel.findByIdAndUpdate(postId, {
        $push: { workerActivities: savedActivity._id }
      }),
      this.workerModel.findByIdAndUpdate(activityDto.workerId, {
        $push: { activities: savedActivity._id }
      })
    ]);

    return savedActivity;
  }

  async getWorkerActivities(postId: string) {
    const activities = await this.workerActivityModel
      .find({ post: postId })
      .populate('worker')
      .sort({ createdAt: -1 })
      .exec();

    if (!activities.length) {
      const post = await this.postModel.findById(postId);
      if (!post) throw new NotFoundException('Post not found');
    }

    return activities;
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    const post = await this.postModel
      .findByIdAndUpdate(id, updatePostDto, { new: true })
      .populate('assignedWorkers')
      .populate('workerActivities');

    if (!post) throw new NotFoundException();
    return post;
  }

  async remove(id: string) {
    const post = await this.postModel.findByIdAndDelete(id);
    if (!post) throw new NotFoundException();
    
    await Promise.all([
      this.workerActivityModel.deleteMany({ post: id }),
      this.workerModel.updateMany(
        { assignedPosts: id },
        { $pull: { assignedPosts: id } }
      )
    ]);

    return { message: 'Post removed successfully' };
  }
}
