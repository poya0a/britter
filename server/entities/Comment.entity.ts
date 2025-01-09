import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Emps } from "./Emps.entity";
import { Post } from "./Post.entity";
import { File } from "./File.entity";

@Entity("comment")
export class Comment {
  @PrimaryColumn({ type: "text", nullable: false, comment: "고유번호" })
  seq!: string;

  @Column({ type: "int", nullable: true, comment: "상위 댓글 고유번호" })
  p_seq?: number;

  @Column({ type: "text", nullable: false, comment: "작성자 고유번호" })
  "UID"!: string;

  @Column({ type: "text", nullable: false, comment: "게시글 고유번호" })
  postSeq!: string;

  @Column({ type: "int4", nullable: false, comment: "작성자 프로필 이미지 고유번호" })
  user_profile_seq!: number;

  @Column({ type: "text", nullable: false, comment: "작성자 아이디" })
  user_id!: string;

  @Column({ type: "text", nullable: false, comment: "작성자 이름" })
  user_name!: string;

  @Column({ type: "text", nullable: false, comment: "내용" })
  content!: string;

  @Column({
    type: "timestamp",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
    comment: "생성일",
  })
  create_date!: Date;

  @Column({ type: "timestamp", nullable: true, comment: "수정일" })
  modify_date?: Date;

  @Column({ type: "int", nullable: false, default: 0, comment: "좋아요 개수" })
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
