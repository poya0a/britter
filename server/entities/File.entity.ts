import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("File")
export class File {
  @PrimaryGeneratedColumn()
  seq!: number;

  @Column({ type: "longblob", nullable: false })
  file!: Buffer;

  @Column({ type: "varchar", nullable: false })
  file_name!: string;

  @Column({ type: "varchar", nullable: false })
  file_path!: string;

  @Column({ type: "varchar", nullable: false })
  file_size!: string;

  @Column({ type: "varchar", nullable: false })
  file_extension!: string;
}
