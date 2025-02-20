import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Worker } from 'src/worker/schemas/worker.schema';
import { Users } from 'src/users/schemas/user.schema'

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true })
  PostId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  imageUrl: string;

  @Prop()
  status: string;

  @Prop()
  predictedLabel: string;

  @Prop()
  predictedConfidence : float;

  @Prop()
  upvote : int;

  @Prop()
  downvote : int;


  @Prop({ type: [{ type: Types.ObjectId, ref: 'Worker' }] })
  assignedWorkers: Worker[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'WorkerActivity' }] })
  workerActivities: Types.ObjectId[];

  @Prop({type: [{ type: Types.ObjectId, ref: 'Users' }]})
  Userid : MongooseSchema.Types.ObjectId;
}

export const PostSchema = SchemaFactory.createForClass(Post);