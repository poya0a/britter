import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { File } from "./File.entity";

@Entity("Company")
export class Company {
  @PrimaryColumn()
  company_code!: string;

  @Column({ type: "int", nullable: false })
  company_profile_seq!: number;

  @Column({ type: "varchar", nullable: false })
  company_name!: string;

  @Column({ type: "varchar", nullable: false })
  company_address!: string;

  @ManyToOne(() => File, { onDelete: "CASCADE" })
  @JoinColumn({ name: "company_profile_seq" })
  companyProfile!: File;
}
