import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("Private")
export class Private {
  @PrimaryGeneratedColumn()
  seq!: number;

  @Column({ type: "text", nullable: false })
  device_id!: string;

  @Column({ type: "text", nullable: false })
  private_key!: string;
}
