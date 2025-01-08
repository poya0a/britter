import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("File")
export class File {
  @PrimaryGeneratedColumn({ type: "int", comment: "고유번호" })
  seq!: number;

  @Column({ type: "bytea", nullable: false, comment: "파일" })
  file!: Buffer;

  @Column({ type: "text", nullable: false, comment: "이름" })
  file_name!: string;

  @Column({ type: "text", nullable: false, comment: "경로" })
  file_path!: string;

  @Column({ type: "text", nullable: false, comment: "크기" })
  file_size!: string;

  @Column({ type: "text", nullable: false, comment: "확장자" })
  file_extension!: string;
}
