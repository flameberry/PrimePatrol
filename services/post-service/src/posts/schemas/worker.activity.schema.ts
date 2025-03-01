import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type WorkerActivityDocument = WorkerActivity & Document;

@Schema({ timestamps: true })
export class WorkerActivity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Worker', required: true })
  worker: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Post', required: true })
  post: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  action: string;

  @Prop()
  description: string;
}

export const WorkerActivitySchema =
  SchemaFactory.createForClass(WorkerActivity);
