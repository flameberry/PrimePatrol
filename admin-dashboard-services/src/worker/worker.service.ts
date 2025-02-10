import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { Worker, WorkerDocument } from './schemas/worker.schema';

@Injectable()
export class WorkerService {
  constructor(
    @InjectModel(Worker.name) private workerModel: Model<WorkerDocument>
  ) {}

  async create(createWorkerDto: CreateWorkerDto): Promise<Worker> {
    const createdWorker = new this.workerModel(createWorkerDto);
    return createdWorker.save();
  }

  async findAll(): Promise<Worker[]> {
    return this.workerModel.find()
      .populate('activities')
      .populate('assignedPosts')
      .exec();
  }

  async findOne(id: string): Promise<Worker> {
    const worker = await this.workerModel.findById(id)
      .populate('activities')
      .populate('assignedPosts')
      .exec();
    
    if (!worker) {
      throw new NotFoundException(`Worker with ID ${id} not found`);
    }
    return worker;
  }

  async updateStatus(id: string, status: string): Promise<Worker> {
    const updatedWorker = await this.workerModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).exec();

    if (!updatedWorker) {
      throw new NotFoundException(`Worker with ID ${id} not found`);
    }
    return updatedWorker;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.workerModel.findByIdAndDelete(id).exec();
    
    if (!result) {
      throw new NotFoundException(`Worker with ID ${id} not found`);
    }
    
    return { message: 'Worker deleted successfully' };
  }
}