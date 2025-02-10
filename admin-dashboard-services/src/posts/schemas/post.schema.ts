import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Worker } from 'src/worker/schemas/worker.schema';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  imageUrl: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Worker' }] })
  assignedWorkers: Worker[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'WorkerActivity' }] })
  workerActivities: Types.ObjectId[];
}

export const PostSchema = SchemaFactory.createForClass(Post);