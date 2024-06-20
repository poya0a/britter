import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Emps } from "./Emps.entity";

@Entity("Certification")
export class Certification {
  @PrimaryGeneratedColumn()
  seq: number;

  @Column({ type: "varchar", nullable: true, comment: "고유번호" })
  UID: string;

  @Column({ type: "varchar", nullable: false, comment: "전화번호" })
  user_hp: string;

  @Column({
    name: "certification_number",
    type: "varchar",
    nullable: false,
    comment: "인증번호",
  })
  certification_number: string;

  @Column({
    type: "datetime",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
    comment: "생성일",
  })
  create_date: Date;

  @Column({ type: "datetime", nullable: true, comment: "수정일" })
  modify_date?: Date;

  @ManyToOne(() => Emps, (emps) => emps.certifications)
  @JoinColumn({ name: "UID" })
  emps: Emps;
}
