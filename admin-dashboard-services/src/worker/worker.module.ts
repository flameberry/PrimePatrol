import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkerService } from './worker.service';
import { WorkerController } from './worker.controller';
import { Worker } from './entities/worker.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Worker])], // Register Worker entity
  controllers: [WorkerController],
  providers: [WorkerService],
  exports: [WorkerService],
})
export class WorkerModule {}
