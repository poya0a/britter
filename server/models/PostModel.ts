import { CommentModel } from "./CommentModel";
import { EmpsModel } from "./EmpsModel";
import { FileModel } from "./FileModel";
import { TagModel } from "./TagModel";

export interface PostInterface {
  seq: number;
  p_seq?: number;
  UID: string;
  file_seq?: number;
  tag_seq?: number;
  title: string;
  content: string;
  create_date: Date;
  modify_date?: Date;
  comments?: CommentModel[];
  user?: EmpsModel;
  file?: FileModel;
  tag?: TagModel;
}

export class PostModel implements PostInterface {
  seq: number;
  p_seq?: number;
  UID: string;
  file_seq?: number;
  tag_seq?: number;
  title: string;
  content: string;
  create_date: Date;
  modify_date?: Date;
  comments?: CommentModel[];
  user?: EmpsModel;
  file?: FileModel;
  tag?: TagModel;

  constructor(post: PostInterface) {
    this.seq = post.seq;
    this.p_seq = post.p_seq;
    this.UID = post.UID;
    this.file_seq = post.file_seq;
    this.tag_seq = post.tag_seq;
    this.title = post.title;
    this.content = post.content;
    this.create_date = post.create_date;
    this.modify_date = post.modify_date;
    this.comments = post.comments;
    this.user = post.user;
    this.file = post.file;
    this.tag = post.tag;
  }
}
