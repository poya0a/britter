import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("Tag")
export class Tag {
  @PrimaryGeneratedColumn()
  seq!: number;

  @Column({ type: "varchar", nullable: false })
  name!: string;
}
