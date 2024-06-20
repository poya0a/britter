import { EmpsModel } from "./Emps.model";
import { PostModel } from "./Post.model";
import { CommentModel } from "./Comment.model";

export interface FileInterface {
  seq: number;
  file: Buffer;
  file_name: string;
  file_path: string;
  file_size: string;
  file_extension: string;
  users?: EmpsModel[];
  posts?: PostModel[];
  comments?: CommentModel[];
}

export class FileModel implements FileInterface {
  seq: number;
  file: Buffer;
  file_name: string;
  file_path: string;
  file_size: string;
  file_extension: string;
  users?: EmpsModel[];
  posts?: PostModel[];
  comments?: CommentModel[];

  constructor(file: FileInterface) {
    this.seq = file.seq;
    this.file = file.file;
    this.file_name = file.file_name;
    this.file_path = file.file_path;
    this.file_size = file.file_size;
    this.file_extension = file.file_extension;
    this.users = file.users;
    this.posts = file.posts;
    this.comments = file.comments;
  }
}
