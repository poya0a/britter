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

@Entity("emps")
export class Emps {
  @PrimaryColumn({ type: "text", nullable: false, comment: "고유번호" })
  "UID"!: string;

  @Column({ type: "int", nullable: false, comment: "프로필 이미지 고유번호" })
  user_profile_seq!: number;

  @Column({ type: "int", nullable: true, comment: "키 고유번호" })
  private_seq?: number | null;

  @Column({ type: "text", nullable: false, comment: "아이디" })
  user_id!: string;

  @Column({ type: "text", nullable: false, comment: "비밀번호" })
  user_pw!: string;

  @Column({ type: "text", nullable: false, comment: "이름" })
  user_name!: string;

  @Column({ type: "text", nullable: false, comment: "전화번호" })
  user_hp!: string;

  @Column({ type: "int", nullable: true, comment: "인증 고유번호" })
  user_certification?: number | null;

  @Column({ type: "text", nullable: true, comment: "이메일" })
  user_email?: string;

  @Column({ type: "text", nullable: true, comment: "생년월일" })
  user_birth?: string;

  @Column({ type: "boolean", nullable: false, comment: "공개 여부" })
  user_public!: boolean;

  @Column({ type: "int", nullable: false, comment: "멤버십 레벨" })
  user_level!: number;

  @Column({
    type: "timestamp with time zone",
    nullable: false,
    default: () => "now()",
    comment: "생성일",
  })
  create_date!: Date;

  @Column({ type: "text", nullable: true, comment: "상태 이모지" })
  status_emoji?: string;

  @Column({ type: "text", nullable: true, comment: "상태 메시지" })
  status_message?: string;

  @Column({ type: "int", nullable: false, default: [], array: true, comment: "동의한 이용약관 고유번호 목록" })
  terms!: number[];

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
