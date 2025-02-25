import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post, PostSchema } from './schemas/post.schema';
import { Worker, WorkerSchema } from '../worker/schemas/worker.schema';
import { WorkerActivity, WorkerActivitySchema } from '../worker/schemas/worker.activity.schema';
import { UsersModule } from '../users/users.module'; // Import the UsersModule

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Worker.name, schema: WorkerSchema },
      { name: WorkerActivity.name, schema: WorkerActivitySchema },
    ]),
    UsersModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
