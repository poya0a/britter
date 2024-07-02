import { CommentModel } from "./Comment.model";
import { EmpsModel } from "./Emps.model";
import { TagModel } from "./Tag.model";

export interface PostInterface {
  seq: string;
  p_seq?: string;
  UID: string;
  tag_seq?: number;
  title: string;
  content: string;
  create_date: Date;
  modify_date?: Date;
  comments?: CommentModel[];
  user?: EmpsModel;
  tag?: TagModel;
}

export class PostModel implements PostInterface {
  seq: string;
  p_seq?: string;
  UID: string;
  tag_seq?: number;
  title: string;
  content: string;
  create_date: Date;
  modify_date?: Date;
  comments?: CommentModel[];
  user?: EmpsModel;
  tag?: TagModel;

  constructor(post: PostInterface) {
    this.seq = post.seq;
    this.p_seq = post.p_seq;
    this.UID = post.UID;
    this.tag_seq = post.tag_seq;
    this.title = post.title;
    this.content = post.content;
    this.create_date = post.create_date;
    this.modify_date = post.modify_date;
    this.comments = post.comments;
    this.user = post.user;
    this.tag = post.tag;
  }
}
