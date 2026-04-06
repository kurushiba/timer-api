import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class UserSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 25 })
  focusDuration: number;

  @Column({ default: 5 })
  shortBreakDuration: number;

  @Column({ default: 15 })
  longBreakDuration: number;

  @Column({ default: 4 })
  sessionsBeforeLongBreak: number;

  @Column({ default: false })
  autoStartNext: boolean;

  @Column({ default: true })
  soundEnabled: boolean;

  @Column({ default: 'default' })
  soundType: string;

  @ManyToOne(() => User)
  user: User;

  @Column({ unique: true })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
