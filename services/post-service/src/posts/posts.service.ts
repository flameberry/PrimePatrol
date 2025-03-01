import {
  Injectable,
  NotFoundException,
  Inject,
  BadRequestException,
  ServiceUnavailableException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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

      // Use HTTP call to update user's posts instead of microservice
      try {
        const userServiceHost = process.env.USER_SERVICE_HOST || 'localhost';
        const userServicePort = process.env.USER_SERVICE_PORT || 3000;
        const userServiceUrl = `http://${userServiceHost}:${userServicePort}/api/v1/users/${createPostDto.userId}`;

        // Make PUT request to update user's postIds array
        const response = await axios.put(userServiceUrl, {
          postIds: [savedPost._id.toString()], // Add the new post ID to user's posts
        });

        if (response.status !== 200 && response.status !== 201) {
          console.warn(
            `User update response: ${response.status}`,
            response.data,
          );
        }
      } catch (error) {
        console.error(
          'User service communication error:',
          error.response?.data || error.message,
        );
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
      const workerServiceHost = process.env.WORKER_SERVICE_HOST || 'localhost';
      const workerServicePort = process.env.WORKER_SERVICE_PORT || 3001;
      const workerServiceUrl = `http://${workerServiceHost}:${workerServicePort}/api/v1/workers/findByIds`;

      const response = await axios.get(workerServiceUrl, {
        params: { ids: workerIds.join(',') },
      });

      if (!response.data || response.data.length !== workerIds.length) {
        throw new NotFoundException('Some workers not found');
      }
    } catch (error) {
      console.error(
        'Error fetching workers:',
        error.response?.data || error.message,
      );
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
    try {
      // Log operation start for debugging
      console.log(
        `[logWorkerActivity] Starting to log activity for post ${postId} by worker ${activityDto.workerId}`,
      );

      // Validate postId format
      if (!this.isValidObjectId(postId)) {
        console.error(`[logWorkerActivity] Invalid post ID format: ${postId}`);
        throw new BadRequestException('Invalid post ID format');
      }

      // Validate workerId format
      if (!this.isValidObjectId(activityDto.workerId)) {
        console.error(
          `[logWorkerActivity] Invalid worker ID format: ${activityDto.workerId}`,
        );
        throw new BadRequestException('Invalid worker ID format');
      }

      // Verify post exists
      const post = await this.postModel.findById(postId);
      if (!post) {
        console.error(`[logWorkerActivity] Post not found with ID: ${postId}`);
        throw new NotFoundException(`Post with ID ${postId} not found`);
      }

      // Verify worker exists
      const worker = await this.workerModel.findById(activityDto.workerId);
      if (!worker) {
        console.error(
          `[logWorkerActivity] Worker not found with ID: ${activityDto.workerId}`,
        );
        throw new NotFoundException(
          `Worker with ID ${activityDto.workerId} not found`,
        );
      }

      // Create and save the activity with validation
      const activity = new this.workerActivityModel({
        post: postId,
        worker: activityDto.workerId,
        action: activityDto.action,
        description: activityDto.description || '', // Handle optional description
        timestamp: new Date(), // Add explicit timestamp
      });

      // Validate activity before saving
      try {
        await activity.validate();
      } catch (validationError) {
        console.error(
          '[logWorkerActivity] Activity validation error:',
          validationError,
        );
        throw new BadRequestException(
          'Invalid activity data: ' + validationError.message,
        );
      }

      // Save the activity and explicitly type it as WorkerActivityDocument
      const savedActivity: WorkerActivityDocument = await activity.save();
      console.log(
        `[logWorkerActivity] Activity saved with ID: ${savedActivity._id}`,
      );

      // Update worker's activities array
      worker.activities.push(savedActivity._id as Types.ObjectId);
      await worker.save();

      // Populate the worker's activities and return the updated worker
      const updatedWorker = await this.workerModel
        .findById(activityDto.workerId)
        .populate('activities') // Populate the activities
        .exec();

      if (!updatedWorker) {
        console.error(
          `[logWorkerActivity] Worker not found after update: ${activityDto.workerId}`,
        );
        throw new NotFoundException(
          `Worker with ID ${activityDto.workerId} not found`,
        );
      }

      console.log(
        `[logWorkerActivity] Worker updated successfully:`,
        updatedWorker,
      );
      return updatedWorker;
    } catch (error) {
      // Centralized error handling
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ServiceUnavailableException
      ) {
        console.error(`[logWorkerActivity] Known error: ${error.message}`);
        throw error; // Re-throw known exceptions
      }

      console.error('[logWorkerActivity] Unexpected error:', error);
      throw new InternalServerErrorException(
        'Failed to log worker activity: unexpected error',
      );
    }
  }

  // Helper method to validate ObjectId format
  private isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
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
    if (!post) throw new NotFoundException('Post not found');

    // Delete associated activities
    await this.workerActivityModel.deleteMany({ post: id });

    // Notify worker service about post removal via HTTP
    try {
      const workerServiceHost = process.env.WORKER_SERVICE_HOST || 'localhost';
      const workerServicePort = process.env.WORKER_SERVICE_PORT || 3001;
      const workerServiceUrl = `http://${workerServiceHost}:${workerServicePort}/api/v1/workers/remove-post-assignment`;

      await axios.post(workerServiceUrl, { postId: id });
    } catch (error) {
      console.error(
        'Worker service notification error:',
        error.response?.data || error.message,
      );
      // Continue even if worker service notification fails
    }

    // Notify user service about post removal via HTTP
    try {
      const userServiceHost = process.env.USER_SERVICE_HOST || 'localhost';
      const userServicePort = process.env.USER_SERVICE_PORT || 3000;
      const userServiceUrl = `http://${userServiceHost}:${userServicePort}/api/v1/users/remove-post/${id}`;

      await axios.post(userServiceUrl, { postId: id });
    } catch (error) {
      console.error(
        'User service notification error:',
        error.response?.data || error.message,
      );
      // Continue even if user service notification fails
    }

    return { message: 'Post removed successfully' };
  }
}
