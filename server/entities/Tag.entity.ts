import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("Tag")
export class Tag {
  @PrimaryGeneratedColumn({ type: "int4", comment: "고유번호" })
  seq!: number;

  @Column({ type: "text", nullable: false, comment: "태그명" })
  name!: string;
}
