import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type WorkerDocument = Worker & Document;

@Schema({ timestamps: true })
export class Worker {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  employeeId: string;

  @Prop({ required: true, default: 'inactive' })
  status: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'WorkerActivity' }] })
  activities: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Post' }] })
  assignedPosts: Types.ObjectId[];
}

export const WorkerSchema = SchemaFactory.createForClass(Worker);