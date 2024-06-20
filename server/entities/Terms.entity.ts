import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("Terms")
export class Terms {
  @PrimaryGeneratedColumn()
  seq!: number;

  @Column({ type: "varchar", nullable: false })
  title!: string;

  @Column({ type: "text", nullable: false })
  content!: string;

  @Column({ type: "boolean", nullable: false })
  required!: boolean;

  @Column({ type: "boolean", nullable: false })
  in_used!: boolean;

  @Column({
    type: "datetime",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
    comment: "생성일",
  })
  create_date: Date;
}
