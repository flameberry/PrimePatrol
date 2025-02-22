import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { Worker, WorkerDocument } from './schemas/worker.schema';
import { Schema as MongooseSchema } from 'mongoose';


@Injectable()
export class WorkerService {
  constructor(
    @InjectModel(Worker.name) private workerModel: Model<WorkerDocument>,
  ) {}

  async create(createWorkerDto: CreateWorkerDto): Promise<Worker> {
    const createdWorker = new this.workerModel(createWorkerDto);
    return createdWorker.save();
  }

  async findAll(): Promise<Worker[]> {
    return this.workerModel.find()
      .populate('activities') // Only populate activities if needed
      .exec();
  }
  
  async findWorkersByIds(ids: string[]): Promise<Worker[]> {
    return this.workerModel.find({ _id: { $in: ids } })
      .populate('activities') // Only populate activities if needed
      .exec();
  }

  async findOne(id: string): Promise<Worker> {
    const worker = await this.workerModel.findById(id)
      .populate('activities') // Only populate activities if needed
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
      { new: true },
    )
      .populate('activities')
      .populate('assignedPosts')
      .exec();

    if (!updatedWorker) {
      throw new NotFoundException(`Worker with ID ${id} not found`);
    }
    return updatedWorker;
  }

  async updateAssignedPosts(id: string, assignedPosts: Types.ObjectId[]): Promise<Worker> {
    const updatedWorker = await this.workerModel.findByIdAndUpdate(
      id,
      { $set: { assignedPosts } }, // Update the assignedPosts array
      { new: true },
    )
      .populate('activities') // Only populate activities if needed
      .exec();

    if (!updatedWorker) {
      throw new NotFoundException(`Worker with ID ${id} not found`);
    }
    return updatedWorker;
  }

  async updateWorkerAssignment(
    id: string,
    assignedPosts: Types.ObjectId[],
    status: string,
  ): Promise<Worker> {
    const updatedWorker = await this.workerModel.findByIdAndUpdate(
      id,
      {
        $set: { assignedPosts, status }, // Update both assignedPosts and status
      },
      { new: true },
    )
      .populate('activities') // Only populate activities if needed
      .exec();

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