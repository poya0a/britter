import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Emps } from "./Emps.entity";
import { Post } from "./Post.entity";
import { File } from "./File.entity";

@Entity("Comment")
export class Comment {
  @PrimaryGeneratedColumn()
  seq!: number;

  @Column({ type: "int", nullable: true })
  p_seq?: number;

  @Column({ type: "varchar", nullable: false })
  UID!: string;

  @Column({ type: "int", nullable: false })
  postSeq!: number;

  @Column({ type: "int", nullable: false })
  user_profile_seq!: number;

  @Column({ type: "int", nullable: true })
  file_seq?: number;

  @Column({ type: "varchar", nullable: false })
  user_id!: string;

  @Column({ type: "varchar", nullable: false })
  user_name!: string;

  @Column({ type: "varchar", nullable: false })
  content!: string;

  @Column({
    type: "datetime",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
    comment: "생성일",
  })
  create_date: Date;

  @Column({ type: "datetime", nullable: true })
  modify_date?: Date;

  @Column({ type: "int", nullable: false, default: 0 })
  like_count!: number;

  @ManyToOne(() => Post, { onDelete: "CASCADE" })
  @JoinColumn({ name: "postSeq" })
  post!: Post;

  @ManyToOne(() => Emps, (emps) => emps.comments, { onDelete: "CASCADE" })
  // @JoinColumn({ name: "UID" })
  user!: string;

  @ManyToOne(() => File, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_profile_seq" })
  userProfile!: File;

  @ManyToOne(() => File, { onDelete: "CASCADE" })
  @JoinColumn({ name: "file_seq" })
  file?: File;
}
