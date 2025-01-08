import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity("SpaceList")
export class SpaceList {
  @PrimaryColumn({ type: "text", comment: "사용자 고유번호" })
  UID!: string;

  @Column({
    type: "text",
    nullable: false,
    default: "[]",
    comment: "사용자가 속한 공긴 목록",
  })
  space!: string;
}
