import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Worker } from './worker.schema';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  imageUrl: string;

  @Prop({ default: 'pending' })
  status: string;

  @Prop()
  predictedLabel: string;

  @Prop()
  predictedConfidence: number;

  @Prop({ default: 0 })
  upvote: number;

  @Prop({ default: 0 })
  downvote: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Worker' }] })
  assignedWorkers: Worker[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'WorkerActivity' }] })
  workerActivities: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop()
  latitude: number;

  @Prop()
  longitude: number;
}

export const PostSchema = SchemaFactory.createForClass(Post);
