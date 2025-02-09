import { Post } from "src/posts/entities/post.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Worker } from "./worker.entity";

@Entity()
export class WorkerActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Post)
  post: Post;

  @ManyToOne(() => Worker)
  worker: Worker;

  @Column()
  action: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  timestamp: Date;
}
