import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("Tag")
export class Tag {
  @PrimaryGeneratedColumn()
  seq!: number;

  @Column({ type: "text", nullable: false })
  name!: string;
}
