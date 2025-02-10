import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Worker, WorkerSchema } from './schemas/worker.schema';
import { WorkerActivity, WorkerActivitySchema } from './schemas/worker.activity.schema';
import { WorkerService } from './worker.service';
import { WorkerController } from './worker.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Worker.name, schema: WorkerSchema },
      { name: WorkerActivity.name, schema: WorkerActivitySchema }
    ]),
  ],
  providers: [WorkerService],
  controllers: [WorkerController],
  exports: [WorkerService],
})
export class WorkerModule {}