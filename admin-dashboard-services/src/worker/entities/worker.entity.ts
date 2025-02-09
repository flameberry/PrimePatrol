import { Post } from "src/posts/entities/post.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Worker {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: 'available' })
  status: string;

  @ManyToMany(() => Post, post => post.assignedWorkers)
  @JoinTable() // Important: Add JoinTable here
  assignedPosts: Post[];
}
