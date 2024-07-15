import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity("SpaceList")
export class SpaceList {
  @PrimaryColumn({ type: "varchar", length: 255, comment: "고유번호" })
  UID!: string;

  @Column({
    type: "json",
    nullable: false,
    comment: "사용자가 속한 공간 리스트",
  })
  space!: string[];
}
