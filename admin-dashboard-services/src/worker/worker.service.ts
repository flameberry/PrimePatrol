import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { Worker } from './entities/worker.entity';

@Injectable()
export class WorkerService {
  constructor(
    @InjectRepository(Worker)
    private readonly workerRepository: Repository<Worker>
  ) {}

  async create(createWorkerDto: CreateWorkerDto) {
    try {
      const worker = this.workerRepository.create(createWorkerDto);
      return await this.workerRepository.save(worker);
    } catch (error) {
      console.error('Error creating worker:', error);
      throw new InternalServerErrorException('Failed to create worker');
    }
  }

  async findAll() {
    try {
      // Using the repository's find method with relations instead of queryBuilder
      return await this.workerRepository.find({
        relations: {
          assignedPosts: true
        }
      });
    } catch (error) {
      console.error('Error fetching all workers:', error);
      throw new InternalServerErrorException('Failed to fetch workers');
    }
  }

  async findOne(id: number) {
    try {
      const worker = await this.workerRepository.findOne({
        where: { id },
        relations: {
          assignedPosts: true
        }
      });
      
      if (!worker) {
        throw new NotFoundException(`Worker with ID ${id} not found`);
      }
      return worker;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching worker:', error);
      throw new InternalServerErrorException('Failed to fetch worker');
    }
  }

  async updateStatus(id: number, status: string) {
    try {
      const worker = await this.findOne(id);
      worker.status = status;
      return await this.workerRepository.save(worker);
    } catch (error) {
      console.error('Error updating worker status:', error);
      throw new InternalServerErrorException('Failed to update worker status');
    }
  }

  async remove(id: number) {
    try {
      const result = await this.workerRepository.delete(id);
      
      if (result.affected === 0) {
        throw new NotFoundException(`Worker with ID ${id} not found`);
      }
      
      return { message: 'Worker removed successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error removing worker:', error);
      throw new InternalServerErrorException('Failed to remove worker');
    }
  }
}