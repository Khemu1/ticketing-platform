import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tickets } from './ticket.entity';
import { BookingStatus } from '../types';

@Entity('bookings')
export class Bookings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: true })
  user_id: string;

  @Column('uuid', { nullable: true })
  event_id: string;

  @Column('enum', { enum: BookingStatus })
  status: BookingStatus;

  @Column('timestamptz')
  date: Date;

  @Column({ default: 1 })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total_amount: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => Tickets, (ticket) => ticket.booking)
  tickets: Tickets[];
}
