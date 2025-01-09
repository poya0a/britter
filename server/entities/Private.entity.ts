import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("private")
export class Private {
  @PrimaryGeneratedColumn({ type: "int", comment: "고유번호" })
  seq!: number;

  @Column({ type: "text", nullable: false, comment: "접속 기기" })
  device_id!: string;

  @Column({ type: "text", nullable: false, comment: "키" })
  private_key!: string;
}
