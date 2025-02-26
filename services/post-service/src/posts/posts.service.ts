import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { Worker, WorkerDocument } from './schemas/worker.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import {
  WorkerActivity,
  WorkerActivityDocument,
} from './schemas/worker.activity.schema';
import { User, UserDocument } from './schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { AssignWorkersDto } from './dto/assign-workers.dto';
import { CreateWorkerActivityDto } from './dto/worker-activity.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import axios from 'axios';

@Injectable()
export class PostsService {
  private readonly s3Client: S3Client;

  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Worker.name) private workerModel: Model<WorkerDocument>,
    @InjectModel(WorkerActivity.name)
    private workerActivityModel: Model<WorkerActivityDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
    @Inject('USER_SERVICE') private userServiceClient: ClientProxy,
    @Inject('WORKER_SERVICE') private workerServiceClient: ClientProxy,
  ) {
    this.s3Client = new S3Client({
      region: this.configService.getOrThrow('AWS_S3_REGION'),
      credentials: {
        accessKeyId: this.configService.getOrThrow('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async getPostStats() {
    const totalPosts = await this.postModel.countDocuments();
    const activePosts = await this.postModel.countDocuments({
      status: 'Active',
    });
    const resolvedPosts = await this.postModel.countDocuments({
      status: 'resolved',
    });

    return { totalPosts, activePosts, resolvedPosts };
  }

  async create(createPostDto: CreatePostDto, file: Express.Multer.File) {
    try {
      let imageUrl = null;

      if (file) {
        // Generate unique filename
        const fileName = `${Date.now()}-${file.originalname}`;

        // Upload to S3
        try {
          await this.s3Client.send(
            new PutObjectCommand({
              Bucket: 'smartwater-application',
              Key: fileName,
              Body: file.buffer,
              ContentType: file.mimetype,
            }),
          );

          // Generate S3 URL
          imageUrl = `https://smartwater-application.s3.${this.configService.get('AWS_S3_REGION')}.amazonaws.com/${fileName}`;
        } catch (s3Error) {
          console.error('S3 Upload Error:', s3Error);
          throw new Error(`S3 Upload failed: ${s3Error.message}`);
        }
      }

      // Create the post document with S3 URL
      const createdPost = new this.postModel({
        ...createPostDto,
        imageUrl: imageUrl,
      });

      // Save the post
      const savedPost = await createdPost.save();

      // Use microservice client to update user's posts
      try {
        const userUpdated = await firstValueFrom(
          this.userServiceClient.send(
            { cmd: 'update-user-posts' },
            { userId: createPostDto.userId, postId: savedPost._id },
          ),
        );

        if (!userUpdated) {
          throw new NotFoundException(
            `User with ID ${createPostDto.userId} not found`,
          );
        }
      } catch (error) {
        console.error('User service communication error:', error);
        // Still return the post even if user service communication fails
      }

      return savedPost;
    } catch (error) {
      console.error('Post creation error:', error);
      throw error;
    }
  }

  async findAll() {
    const posts = await this.postModel
      .find()
      .populate('assignedWorkers')
      .populate('workerActivities')
      .exec();

    return posts;
  }

  async findOne(id: string) {
    const post = await this.postModel
      .findById(id)
      .populate('assignedWorkers')
      .populate('workerActivities')
      .exec();

    if (!post) throw new NotFoundException();

    return post;
  }

  async assignWorkers(postId: string, { workerIds }: AssignWorkersDto) {
    // Verify the post exists
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');
  
    // Fetch workers from the worker service API
    try {
      const response = await axios.get(
        'http://localhost:3001/api/v1/workers/findByIds',
        { params: { ids: workerIds.join(',') } }, // Pass workerIds as query parameters
      );
  
      if (!response.data || response.data.length !== workerIds.length) {
        throw new NotFoundException('Some workers not found');
      }
    } catch (error) {
      console.error('Error fetching workers:', error.response?.data || error.message);
      throw new NotFoundException('Could not verify workers');
    }
  
    // Update post with worker IDs
    const updatedPost = await this.postModel
      .findByIdAndUpdate(
        postId,
        { $addToSet: { assignedWorkers: { $each: workerIds } } }, // Add workerIds to the array
        { new: true },
      )
      .populate('assignedWorkers');
  
    return updatedPost;
  }

  async logWorkerActivity(
    postId: string,
    activityDto: CreateWorkerActivityDto,
  ) {
    // Verify post exists
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    // Verify worker through worker service
    try {
      const workerExists = await firstValueFrom(
        this.workerServiceClient.send(
          { cmd: 'verify-worker' },
          { workerId: activityDto.workerId },
        ),
      );

      if (!workerExists) {
        throw new NotFoundException('Worker not found');
      }
    } catch (error) {
      console.error('Worker service communication error:', error);
      throw new NotFoundException('Could not verify worker');
    }

    // Create and save the activity
    const activity = new this.workerActivityModel({
      post: postId,
      worker: activityDto.workerId,
      action: activityDto.action,
      description: activityDto.description,
    });

    const savedActivity = await activity.save();

    // Update post with activity reference
    await this.postModel.findByIdAndUpdate(postId, {
      $push: { workerActivities: savedActivity._id },
    });

    // Notify worker service about the activity
    try {
      await firstValueFrom(
        this.workerServiceClient.send(
          { cmd: 'log-worker-activity' },
          {
            workerId: activityDto.workerId,
            activityId: savedActivity._id,
          },
        ),
      );
    } catch (error) {
      console.error('Worker service notification error:', error);
      // Continue even if worker service notification fails
    }

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

    // Delete associated activities
    await this.workerActivityModel.deleteMany({ post: id });

    // Notify worker service about post removal
    try {
      await firstValueFrom(
        this.workerServiceClient.send(
          { cmd: 'remove-post-assignment' },
          { postId: id },
        ),
      );
    } catch (error) {
      console.error('Worker service notification error:', error);
      // Continue even if worker service notification fails
    }

    // Notify user service about post removal
    try {
      await firstValueFrom(
        this.userServiceClient.send(
          { cmd: 'remove-post-from-users' },
          { postId: id },
        ),
      );
    } catch (error) {
      console.error('User service notification error:', error);
      // Continue even if user service notification fails
    }

    return { message: 'Post removed successfully' };
  }
}
