import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { WorkerModule } from '../worker/worker.module';  // Import WorkerModule
import { Worker } from 'src/worker/entities/worker.entity';  // Import Worker entity
import { WorkerActivity } from 'src/worker/entities/worker-activity.entity';  // Import WorkerActivity entity

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Worker, WorkerActivity]),  // Include Worker and WorkerActivity repositories
    WorkerModule,  // Ensure WorkerModule is imported here
  ],
  providers: [PostsService],
  controllers: [PostsController],
})
export class PostsModule {}
