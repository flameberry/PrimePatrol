import { WorkerActivity } from 'src/worker/entities/worker-activity.entity';
import { Worker } from 'src/worker/entities/worker.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'posts' })
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column({ default: 'pending' })
  status: string;

  @ManyToMany(() => Worker)
  @JoinTable({
    name: 'post_workers',
    joinColumn: { name: 'post_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'worker_id', referencedColumnName: 'id' }
  })
  assignedWorkers: Worker[];

  @OneToMany(() => WorkerActivity, activity => activity.post)
  workerActivities: WorkerActivity[];

  @Column({ type: 'bytea', nullable: true })  // Ensure image is stored as binary data (Buffer)
  image: Buffer;
}
