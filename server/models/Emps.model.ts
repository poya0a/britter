import { CommentModel } from "./Comment.model";
import { PostModel } from "./Post.model";
import { FileModel } from "./File.model";
import { PrivateModel } from "./Private.model";

export interface EmpsInterface {
  UID: string;
  user_profile_seq: number;
  private_seq?: number | null;
  user_id: string;
  user_pw: string;
  user_name: string;
  user_hp: string;
  user_certification: number;
  user_email?: string;
  user_nick_name: string;
  user_birth?: string;
  user_public: boolean;
  create_date: Date;
  status_emoji?: string;
  status_message?: string;
  terms: string;
  comments?: CommentModel[];
  posts?: PostModel[];
  userProfile?: FileModel;
  privateSeq?: PrivateModel;
}

export class EmpsModel implements EmpsInterface {
  UID: string;
  user_profile_seq: number;
  private_seq?: number | null;
  user_id: string;
  user_pw: string;
  user_name: string;
  user_hp: string;
  user_certification: number;
  user_email?: string;
  user_nick_name: string;
  user_birth?: string;
  user_public: boolean;
  create_date: Date;
  status_emoji?: string;
  status_message?: string;
  terms: string;
  comments?: CommentModel[];
  posts?: PostModel[];
  userProfile?: FileModel;
  privateSeq?: PrivateModel;

  constructor(emps: EmpsInterface) {
    this.UID = emps.UID;
    this.user_profile_seq = emps.user_profile_seq;
    this.private_seq = emps.private_seq;
    this.user_id = emps.user_id;
    this.user_pw = emps.user_pw;
    this.user_name = emps.user_name;
    this.user_hp = emps.user_hp;
    this.user_certification = emps.user_certification;
    this.user_email = emps.user_email;
    this.user_nick_name = emps.user_nick_name;
    this.user_birth = emps.user_birth;
    this.user_public = emps.user_public;
    this.create_date = emps.create_date;
    this.status_emoji = emps.status_emoji;
    this.status_message = emps.status_message;
    this.terms = emps.terms;
    this.comments = emps.comments;
    this.posts = emps.posts;
    this.userProfile = emps.userProfile;
    this.privateSeq = emps.privateSeq;
  }
}
