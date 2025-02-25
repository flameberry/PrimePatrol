import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Post } from './schemas/post.schema';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { User } from '../users/schemas/user.schema';
import { WorkerActivity } from '../worker/schemas/worker.activity.schema';
import { Worker } from '../worker/schemas/worker.schema';

describe('PostsService', () => {
  let service: PostsService;
  let postModel: Model<Post>;
  let workerModel: Model<Worker>;
  let workerActivityModel: Model<WorkerActivity>;
  let userModel: Model<User>;
  let s3Client: any;

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      const config = {
        'AWS_ACCESS_KEY_ID': 'test-access-key',
        'AWS_SECRET_ACCESS_KEY': 'test-secret-key',
        'AWS_S3_REGION': 'us-east-1'
      };
      return config[key];
    }),
    getOrThrow: jest.fn().mockImplementation((key: string) => {
      const config = {
        'AWS_ACCESS_KEY_ID': 'test-access-key',
        'AWS_SECRET_ACCESS_KEY': 'test-secret-key',
        'AWS_S3_REGION': 'us-east-1'
      };
      if (!config[key]) {
        throw new Error(`Configuration key ${key} not found`);
      }
      return config[key];
    })
  };

  beforeEach(async () => {
    // Create a proper mock for Post model
    const PostModel = function(this: any, data: any) {
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue(this);
    } as any;
    
    PostModel.prototype.save = jest.fn();
    PostModel.countDocuments = jest.fn();
    PostModel.find = jest.fn();
    PostModel.findById = jest.fn();
    PostModel.findByIdAndUpdate = jest.fn();
    PostModel.findByIdAndDelete = jest.fn();
    PostModel.updateMany = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getModelToken(Post.name),
          useValue: PostModel,
        },
        {
          provide: getModelToken(Worker.name),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            updateMany: jest.fn(),
          },
        },
        {
          provide: getModelToken(WorkerActivity.name),
          useValue: {
            prototype: {
              save: jest.fn(),
            },
            find: jest.fn(),
            create: jest.fn(),
            deleteMany: jest.fn(),
          },
        },
        {
          provide: getModelToken(User.name),
          useValue: {
            findByIdAndUpdate: jest.fn(),
            updateMany: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    postModel = module.get<Model<Post>>(getModelToken(Post.name));
    workerModel = module.get<Model<Worker>>(getModelToken(Worker.name));
    workerActivityModel = module.get<Model<WorkerActivity>>(getModelToken(WorkerActivity.name));
    userModel = module.get<Model<User>>(getModelToken(User.name));
    s3Client = (service as any).s3Client;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a post with an image URL', async () => {
      const createPostDto = new CreatePostDto();
      createPostDto.userId = 'user123';
      createPostDto.title = 'Test Post';
      createPostDto.content = 'Test Content';
      createPostDto.status = 'pending';

      const file = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 1024,
        destination: '/tmp',
        filename: 'test.jpg',
        path: '/tmp/test.jpg',
        stream: null as any,
      };

      const expectedImageUrl = `https://smartwater-application.s3.${mockConfigService.get('AWS_S3_REGION')}.amazonaws.com/test.jpg`;
      
      const savedPost = {
        _id: 'post123',
        ...createPostDto,
        imageUrl: expectedImageUrl,
      };

      // Mock the S3 upload
      (s3Client.send as jest.Mock).mockResolvedValueOnce({});
      
      // Mock user update
      jest.spyOn(userModel, 'findByIdAndUpdate')
        .mockResolvedValueOnce({ _id: 'user123' } as any);

      // Mock post save
      jest.spyOn(postModel.prototype, 'save')
        .mockResolvedValueOnce(savedPost);

      const result = await service.create(createPostDto, file);

      expect(result).toEqual(savedPost);
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        createPostDto.userId,
        { $push: { postIds: savedPost._id } },
        { new: true }
      );
    });

    it('should throw NotFoundException if user is not found', async () => {
      const createPostDto = new CreatePostDto();
      createPostDto.userId = 'user123';
      
      const file = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 1024,
        destination: '/tmp',
        filename: 'test.jpg',
        path: '/tmp/test.jpg',
        stream: null as any,
      };

      // Mock the S3 upload
      (s3Client.send as jest.Mock).mockResolvedValueOnce({});

      // Mock post save
      jest.spyOn(postModel.prototype, 'save')
        .mockResolvedValueOnce({ _id: 'post123' });

      // Mock user not found
      jest.spyOn(userModel, 'findByIdAndUpdate')
        .mockResolvedValueOnce(null);

      await expect(service.create(createPostDto, file))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('getPostStats', () => {
    it('should return post statistics', async () => {
      jest.spyOn(postModel, 'countDocuments').mockResolvedValueOnce(10).mockResolvedValueOnce(5).mockResolvedValueOnce(3);

      const result = await service.getPostStats();

      expect(result).toEqual({ totalPosts: 10, activePosts: 5, resolvedPosts: 3 });
    });
  });

  describe('findAll', () => {
    it('should return all posts', async () => {
      const posts = [{ _id: 'post123', title: 'Test Post', content: 'Test Content' }];
      jest.spyOn(postModel, 'find').mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(posts),
      } as any);

      const result = await service.findAll();

      expect(result).toEqual(posts);
    });
  });

  describe('findOne', () => {
    it('should return a post by ID', async () => {
      const post = { _id: 'post123', title: 'Test Post', content: 'Test Content' };
      jest.spyOn(postModel, 'findById').mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(post),
      } as any);

      const result = await service.findOne('post123');

      expect(result).toEqual(post);
    });

    it('should throw NotFoundException if post is not found', async () => {
      jest.spyOn(postModel, 'findById').mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(service.findOne('post123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('assignWorkers', () => {
    it('should assign workers to a post', async () => {
      const workerIds = ['worker123', 'worker456'];
      const workers = [{ _id: 'worker123' }, { _id: 'worker456' }];
      const post = { _id: 'post123', assignedWorkers: workerIds };

      jest.spyOn(workerModel, 'find').mockResolvedValueOnce(workers);
      jest.spyOn(postModel, 'findByIdAndUpdate').mockResolvedValueOnce(post);

      const result = await service.assignWorkers('post123', { workerIds });

      expect(result).toEqual(post);
    });

    it('should throw NotFoundException if some workers are not found', async () => {
      const workerIds = ['worker123', 'worker456'];
      jest.spyOn(workerModel, 'find').mockResolvedValueOnce([{ _id: 'worker123' }]);

      await expect(service.assignWorkers('post123', { workerIds })).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if post is not found', async () => {
      const workerIds = ['worker123', 'worker456'];
      const workers = [{ _id: 'worker123' }, { _id: 'worker456' }];

      jest.spyOn(workerModel, 'find').mockResolvedValueOnce(workers);
      jest.spyOn(postModel, 'findByIdAndUpdate').mockResolvedValueOnce(null);

      await expect(service.assignWorkers('post123', { workerIds })).rejects.toThrow(NotFoundException);
    });
  });

  describe('logWorkerActivity', () => {
    it('should log a worker activity', async () => {
      const activityDto = { workerId: 'worker123', action: 'Test Action', description: 'Test Description' };
      const post = { _id: 'post123' };
      const worker = { _id: 'worker123' };
      const activity = { _id: 'activity123', ...activityDto };

      jest.spyOn(postModel, 'findById').mockResolvedValueOnce(post);
      jest.spyOn(workerModel, 'findById').mockResolvedValueOnce(worker);
      jest.spyOn(workerActivityModel, 'create').mockResolvedValueOnce(activity as never);
      jest.spyOn(postModel, 'findByIdAndUpdate').mockResolvedValueOnce(post);
      jest.spyOn(workerModel, 'findByIdAndUpdate').mockResolvedValueOnce(worker);

      const result = await service.logWorkerActivity('post123', activityDto);

      expect(result).toEqual(activity);
    });

    it('should throw NotFoundException if post or worker is not found', async () => {
      const activityDto = { workerId: 'worker123', action: 'Test Action', description: 'Test Description' };
      jest.spyOn(postModel, 'findById').mockResolvedValueOnce(null);
      jest.spyOn(workerModel, 'findById').mockResolvedValueOnce(null);

      await expect(service.logWorkerActivity('post123', activityDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getWorkerActivities', () => {
    it('should return worker activities for a post', async () => {
      const activities = [{ _id: 'activity123', action: 'Test Action' }];
      jest.spyOn(workerActivityModel, 'find').mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(activities),
      } as any);

      const result = await service.getWorkerActivities('post123');

      expect(result).toEqual(activities);
    });

    it('should throw NotFoundException if post is not found', async () => {
      jest.spyOn(workerActivityModel, 'find').mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce([]),
      } as any);
      jest.spyOn(postModel, 'findById').mockResolvedValueOnce(null);

      await expect(service.getWorkerActivities('post123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      const updatePostDto = { title: 'Updated Post' };
      const post = { _id: 'post123', title: 'Updated Post' };

      jest.spyOn(postModel, 'findByIdAndUpdate').mockResolvedValueOnce(post);

      const result = await service.update('post123', updatePostDto);

      expect(result).toEqual(post);
    });

    it('should throw NotFoundException if post is not found', async () => {
      const updatePostDto = { title: 'Updated Post' };
      jest.spyOn(postModel, 'findByIdAndUpdate').mockResolvedValueOnce(null);

      await expect(service.update('post123', updatePostDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a post', async () => {
      const post = { _id: 'post123' };
      jest.spyOn(postModel, 'findByIdAndDelete').mockResolvedValueOnce(post);
      jest.spyOn(workerActivityModel, 'deleteMany').mockResolvedValueOnce({} as never);
      jest.spyOn(workerModel, 'updateMany').mockResolvedValueOnce({} as never);
      jest.spyOn(userModel, 'updateMany').mockResolvedValueOnce({} as never);

      const result = await service.remove('post123');

      expect(result).toEqual({ message: 'Post removed successfully' });
    });

    it('should throw NotFoundException if post is not found', async () => {
      jest.spyOn(postModel, 'findByIdAndDelete').mockResolvedValueOnce(null);

      await expect(service.remove('post123')).rejects.toThrow(NotFoundException);
    });
  });
});