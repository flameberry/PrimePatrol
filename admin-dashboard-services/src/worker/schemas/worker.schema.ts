import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { WorkerActivity } from './worker.activity.schema';

export type WorkerDocument = Worker & Document;

@Schema({ timestamps: true })
export class Worker {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  employeeId: string;

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'WorkerActivity' }])
  activities: WorkerActivity[];

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Post' }])
  assignedPosts: MongooseSchema.Types.ObjectId[];
}

export const WorkerSchema = SchemaFactory.createForClass(Worker);