import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("terms")
export class Terms {
  @PrimaryGeneratedColumn({ type: "int4", comment: "고유번호" })
  seq!: number;

  @Column({ type: "text", nullable: false, comment: "제목" })
  title!: string;

  @Column({ type: "text", nullable: false, comment: "내용" })
  content!: string;

  @Column({ type: "boolean", nullable: false, comment: "필수 여부" })
  required!: boolean;

  @Column({ type: "boolean", nullable: false, comment: "사용 여부" })
  in_used!: boolean;

  @Column({
    type: "timestamp",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
    comment: "생성일",
  })
  create_date!: Date;
}
