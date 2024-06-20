import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { File } from "./File.entity";
import { Tag } from "./Tag.entity";
import { Emps } from "./Emps.entity";

@Entity("Post")
export class Post {
  @PrimaryGeneratedColumn()
  seq!: number;

  @Column({ type: "int", nullable: true })
  p_seq?: number;

  @Column({ type: "varchar", nullable: false })
  UID!: string;

  @Column({ type: "int", nullable: true })
  file_seq?: number;

  @Column({ type: "int", nullable: true })
  tag_seq?: number;

  @Column({ type: "varchar", nullable: false })
  title!: string;

  @Column({ type: "text", nullable: false })
  content!: string;

  @Column({
    type: "datetime",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
    comment: "생성일",
  })
  create_date: Date;

  @Column({ type: "datetime", nullable: false })
  modify_date?: Date;

  @ManyToOne(() => File, { onDelete: "CASCADE" })
  @JoinColumn({ name: "file_seq" })
  file?: File;

  @ManyToOne(() => Emps, { onDelete: "CASCADE" })
  // @JoinColumn({ name: "UID" })
  user!: string;

  @ManyToOne(() => Tag, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tag_seq" })
  tag?: Tag;
}
