import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Bookings } from './booking.entity';

@Entity('tickets')
export class Tickets {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Bookings, (booking) => booking.tickets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'booking_id' })
  booking: Bookings;

  @Column()
  seat_number: string;

  @Column({ nullable: true })
  qr_code: string;

  @CreateDateColumn()
  created_at!: Date;
}
