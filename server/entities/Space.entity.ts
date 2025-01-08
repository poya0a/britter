import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { File } from "./File.entity";

@Entity("Space")
export class Space {
  @PrimaryColumn({ type: "text", comment: "고유번호" })
  UID!: string;

  @Column({ type: "int", nullable: true, comment: "이미지" })
  space_profile_seq?: number | null;

  @Column({ type: "text", nullable: false, comment: "이름" })
  space_name!: string;

  @Column({ type: "text", nullable: false, comment: "대표 uid" })
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

  @Column({ type: "text", nullable: false })
  space_content: string | null;

  @Column({
    type: "timestamp",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
    comment: "생성일",
  })
  create_date!: Date;

  @ManyToOne(() => File, { onDelete: "CASCADE" })
  @JoinColumn({ name: "space_profile_seq" })
  spaceProfile!: File;
}
