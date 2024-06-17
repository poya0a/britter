import { EmpsModel } from "./EmpsModel";
import { PostModel } from "./PostModel";
import { FileModel } from "./FileModel";

export interface CommentInterface {
  seq: number;
  p_seq?: number;
  UID: string;
  postSeq: number;
  user_profile_seq: number;
  file_seq?: number;
  user_id: string;
  user_name: string;
  content: string;
  create_date: Date;
  modify_date?: Date;
  like_count: number;
  post: PostModel;
  user: EmpsModel;
  userProfile: FileModel;
  file?: FileModel;
}

export class CommentModel implements CommentInterface {
  seq: number;
  p_seq?: number;
  UID: string;
  postSeq: number;
  user_profile_seq: number;
  file_seq?: number;
  user_id: string;
  user_name: string;
  content: string;
  create_date: Date;
  modify_date?: Date;
  like_count: number;
  post: PostModel;
  user: EmpsModel;
  userProfile: FileModel;
  file?: FileModel;

  constructor(comment: CommentInterface) {
    this.seq = comment.seq;
    this.p_seq = comment.p_seq;
    this.UID = comment.UID;
    this.postSeq = comment.postSeq;
    this.user_profile_seq = comment.user_profile_seq;
    this.file_seq = comment.file_seq;
    this.user_id = comment.user_id;
    this.user_name = comment.user_name;
    this.content = comment.content;
    this.create_date = comment.create_date;
    this.modify_date = comment.modify_date;
    this.like_count = comment.like_count;
    this.post = comment.post;
    this.user = comment.user;
    this.userProfile = comment.userProfile;
    this.file = comment.file;
  }
}
