import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity("SpaceList")
export class SpaceList {
  @PrimaryColumn({ type: "text", comment: "사용자 고유번호" })
  UID!: string;

  @Column({
    type: "text",
    nullable: false,
    default: [],
    array: true, 
    comment: "사용자가 속한 공간 목록",
  })
  space!: string[];
}
