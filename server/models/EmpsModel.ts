import { CommentModel } from "./CommentModel";
import { PostModel } from "./PostModel";
import { FileModel } from "./FileModel";

export interface EmpsInterface {
  UID: string;
  user_profile_seq: number;
  user_id: string;
  user_pw: string;
  user_name: string;
  user_hp: string;
  user_email?: string;
  user_birth?: number;
  create_date: Date;
  status_emoji?: string;
  status_message?: string;
  comments?: CommentModel[];
  posts?: PostModel[];
  userProfile?: FileModel;
}

export class EmpsModel implements EmpsInterface {
  UID: string;
  user_profile_seq: number;
  user_id: string;
  user_pw: string;
  user_name: string;
  user_hp: string;
  user_email?: string;
  user_birth?: number;
  create_date: Date;
  status_emoji?: string;
  status_message?: string;
  comments?: CommentModel[];
  posts?: PostModel[];
  userProfile?: FileModel;

  constructor(emps: EmpsInterface) {
    this.UID = emps.UID;
    this.user_profile_seq = emps.user_profile_seq;
    this.user_id = emps.user_id;
    this.user_pw = emps.user_pw;
    this.user_name = emps.user_name;
    this.user_hp = emps.user_hp;
    this.user_email = emps.user_email;
    this.user_birth = emps.user_birth;
    this.create_date = emps.create_date;
    this.status_emoji = emps.status_emoji;
    this.status_message = emps.status_message;
    this.comments = emps.comments;
    this.posts = emps.posts;
    this.userProfile = emps.userProfile;
  }
}
