import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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

  async create(createWorkerDto: CreateWorkerDto) {
    console.log('Creating worker with data:', createWorkerDto); // Log the input
    try {
      // Validate the input
      if (!createWorkerDto.name || !createWorkerDto.employeeId || !createWorkerDto.status) {
        throw new BadRequestException('Missing required fields');
      }
  
      // Create and save the worker
      const worker = new this.workerModel(createWorkerDto);
      const savedWorker = await worker.save();
      console.log('Worker created successfully:', savedWorker); // Log the result
      return savedWorker;
    } catch (error) {
      console.error('Error creating worker:', error); // Log the error
      throw new InternalServerErrorException('Failed to create worker');
    }
  }

  async findAll(): Promise<Worker[]> {
    return this.workerModel.find()
      .populate('activities') // Only populate activities if needed
      .exec();
  }
  
  async findWorkersByIds(ids: string[]): Promise<Worker[]> {
    // Validate that all IDs are valid MongoDB ObjectIds
    const isValidIds = ids.every((id) => Types.ObjectId.isValid(id));
    if (!isValidIds) {
      throw new BadRequestException('One or more worker IDs are invalid');
    }
  
    // Transform string IDs to ObjectIds
    const objectIds = ids.map((id) => new Types.ObjectId(id));
  
    // Query the database
    const workers = await this.workerModel.find({ _id: { $in: objectIds } })
      .populate('activities') // Only populate activities if needed
      .exec();
  
    // Check if all workers were found
    if (workers.length !== ids.length) {
      throw new NotFoundException('One or more workers not found');
    }
  
    return workers;
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