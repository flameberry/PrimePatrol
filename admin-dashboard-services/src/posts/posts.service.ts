import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { Worker, WorkerDocument } from '../worker/schemas/worker.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { WorkerActivity, WorkerActivityDocument } from 'src/worker/schemas/worker.activity.schema';
import { User } from 'src/users/schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { AssignWorkersDto } from 'src/worker/dto/assign-workers.dto';
import { CreateWorkerActivityDto } from 'src/worker/dto/worker-activity.dto';

@Injectable()
export class PostsService {
  private readonly s3Client: S3Client;

  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Worker.name) private workerModel: Model<WorkerDocument>,
    @InjectModel(WorkerActivity.name) private workerActivityModel: Model<WorkerActivityDocument>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly configService: ConfigService,
  ) {
    this.s3Client = new S3Client({
      region: this.configService.getOrThrow('AWS_S3_REGION'),
    });
  }

  async create(createPostDto: CreatePostDto, file: Express.Multer.File) {
    try {
      let imageUrl = null;

      if (file) {
        // Generate unique filename
        const fileName = `${Date.now()}-${file.originalname}`;
        
        // Upload to S3
        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: 'smartwater-application',
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
          })
        );

        // Generate S3 URL
        imageUrl = `https://smartwater-application.s3.${this.configService.get('AWS_S3_REGION')}.amazonaws.com/${fileName}`;
      }

      // Create the post document with S3 URL
      const createdPost = new this.postModel({
        ...createPostDto,
        imageUrl: imageUrl, // Store the S3 URL instead of local file path
      });
      
      // Save the post
      const savedPost = await createdPost.save();
      
      // Update user's posts
      const updatedUser = await this.userModel.findByIdAndUpdate(
        createPostDto.userId,
        { $push: { postIds: savedPost._id } },
        { new: true }
      );

      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${createPostDto.userId} not found`);
      }

      return savedPost;
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
      ),
      this.userModel.updateMany( // Remove post ID from users
        { postIds: id },
        { $pull: { postIds: id } }
      )
    ]);
  
    return { message: 'Post removed successfully' };
  }
  
}
