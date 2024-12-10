import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Comment } from "./Comment.entity";
import { File } from "./File.entity";
import { Post } from "./Post.entity";
import { Private } from "./Private.entity";

@Entity("Emps")
export class Emps {
  @PrimaryColumn()
  UID!: string;

  @Column({ type: "int", nullable: false })
  user_profile_seq!: number;

  @Column({ type: "int", nullable: true })
  private_seq?: number | null;

  @Column({ type: "varchar", nullable: false })
  user_id!: string;

  @Column({ type: "varchar", nullable: false })
  user_pw!: string;

  @Column({ type: "varchar", nullable: false })
  user_name!: string;

  @Column({ type: "varchar", nullable: false })
  user_hp!: string;

  @Column({ type: "int", nullable: true })
  user_certification?: number | null;

  @Column({ type: "varchar", nullable: true })
  user_email?: string;

  @Column({ type: "varchar", nullable: true })
  user_birth?: string;

  @Column({ type: "boolean", nullable: false })
  user_public!: boolean;

  @Column({ type: "int", nullable: false })
  user_level!: number;

  @Column({
    type: "datetime",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
    comment: "생성일",
  })
  create_date: Date;

  @Column({ type: "varchar", nullable: true })
  status_emoji?: string;

  @Column({ type: "varchar", nullable: true })
  status_message?: string;

  @Column({ type: "varchar", nullable: false })
  terms!: string;

  @OneToMany(() => Comment, (comment) => comment.user)
  comments?: Comment[];

  @OneToMany(() => Post, (post) => post.user)
  posts?: Post[];

  @ManyToOne(() => File, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_profile_seq" })
  userProfile!: File;

  @ManyToOne(() => Private, { onDelete: "CASCADE" })
  @JoinColumn({ name: "private_seq" })
  private!: Private;
}
