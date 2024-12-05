import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity("Notifications")
export class Notifications {
  @PrimaryColumn({ type: "varchar", length: 255, comment: "고유번호" })
  UID: string;

  @Column({ type: "varchar", length: 255, comment: "받는 사람" })
  recipient_uid: string;

  @Column({ type: "varchar", length: 255, comment: "보낸 사람" })
  sender_uid: string;

  @Column({ type: "varchar", length: 255, comment: "종류" })
  notify_type: string;

  @Column({
    type: "datetime",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
    comment: "생성일",
  })
  create_date: Date;
}
