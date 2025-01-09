import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity("notifications")
export class Notifications {
  @PrimaryColumn({ type: "text", nullable: false, comment: "고유번호" })
  "UID"!: string;

  @Column({ type: "text", nullable: false, comment: "수신 고유번호" })
  recipient_uid!: string;

  @Column({ type: "text", nullable: false, comment: "발신 고유번호" })
  sender_uid!: string;

  @Column({ type: "text", nullable: false, comment: "종류" })
  notify_type!: string;

  @Column({
    type: "timestamp",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
    comment: "생성일",
  })
  create_date!: Date;
}
