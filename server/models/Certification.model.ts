import { EmpsModel } from "./Emps.model";
import { PostModel } from "./Post.model";
import { FileModel } from "./File.model";

export interface CertificationInterface {
  seq: number;
  UID?: string;
  user_hp: string;
  certification_number: number;
  create_date: Date;
  modify_date?: Date;
}

export class CertificationModel implements CertificationInterface {
  seq: number;
  UID?: string;
  user_hp: string;
  certification_number: number;
  create_date: Date;
  modify_date?: Date;

  constructor(certification: CertificationInterface) {
    this.seq = certification.seq;
    this.UID = certification.UID;
    this.user_hp = certification.user_hp;
    this.certification_number = certification.certification_number;
    this.create_date = certification.create_date;
    this.modify_date = certification.modify_date;
  }
}
