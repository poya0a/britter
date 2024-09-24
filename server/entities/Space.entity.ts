import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { File } from "./File.entity";

@Entity("Space")
export class Space {
  @PrimaryColumn({ type: "varchar", comment: "고유번호" })
  UID!: string;

  @Column({ type: "int", nullable: true, comment: "이미지" })
  space_profile_seq?: number | null;

  @Column({ type: "varchar", nullable: false, comment: "이름" })
  space_name!: string;

  @Column({ type: "varchar", nullable: false, comment: "대표 uid" })
  space_manager!: string;

  @Column({
    type: "boolean",
    nullable: false,
    default: true,
    comment: "공개 여부",
  })
  space_public!: boolean;

  @Column({
    type: "json",
    nullable: false,
    default: "[]",
    comment: "사용자 uid",
  })
  space_users!: string[];

  @Column({
    type: "json",
    nullable: false,
    default: "[]",
    comment: "초대한 사용자",
  })
  invite_users!: string[];

  @Column({
    type: "json",
    nullable: false,
    default: "[]",
    comment: "가입 요청한 사용자",
  })
  request_users!: string[];

  @Column({
    type: "datetime",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
    comment: "생성일",
  })
  create_date!: Date;

  @ManyToOne(() => File, { onDelete: "CASCADE" })
  @JoinColumn({ name: "space_profile_seq" })
  spaceProfile!: File;
}
