import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity("Message")
export class Message {
  @PrimaryColumn({ type: "text", comment: "고유번호" })
  UID: string;

  @Column({ type: "text", comment: "받는 사람" })
  recipient_uid: string;

  @Column({ type: "text", comment: "보낸 사람" })
  sender_uid: string;

  @Column({ type: "text", comment: "메시지" })
  message: string;

  @Column({ type: "boolean", default: false, comment: "확인 여부" })
  confirm: boolean;

  @Column({
    type: "timestamp",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
    comment: "생성일",
  })
  create_date: Date;
}
