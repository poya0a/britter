import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Tag } from "./Tag.entity";
import { Emps } from "./Emps.entity";

@Entity("Post")
export class Post {
  @PrimaryGeneratedColumn({ comment: "고유번호" })
  seq!: string;

  @Column({ type: "text", nullable: true, comment: "상위 게시글 고유번호" })
  p_seq?: string;

  @Column({ type: "text", nullable: false, comment: "작성자 고유번호" })
  UID!: string;

  @Column({ type: "integer", nullable: true, comment: "태그 고유번호 목록" })
  tag_seq?: number[];

  @Column({ type: "text", nullable: false, comment: "제목" })
  title!: string;

  @Column({ type: "text", nullable: false, comment: "내용" })
  content!: string;

  @Column({
    type: "timestamp",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
    comment: "생성일",
  })
  create_date: Date;

  @Column({ type: "timestamp", nullable: false, comment: "수정일" })
  modify_date?: Date;

  @Column({ type: "int", nullable: false, comment: "순번" })
  order_number: number;

  @Column({ type: "text", nullable: true, comment: "게시글이 속한 공간 고유번호" })
  space_uid: string;

  @ManyToOne(() => Emps, { onDelete: "CASCADE" })
  @JoinColumn({ name: "UID" })
  user!: string;

  @ManyToOne(() => Tag, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tag_seq" })
  tag?: Tag;
}
