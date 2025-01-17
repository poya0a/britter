import { EmpsModel } from "./Emps.model";
import { CommentModel } from "./Comment.model";

export interface FileInterface {
  seq: number;
  file_name: string;
  file_size: string;
  file_extension: string;
  users?: EmpsModel[];
  comments?: CommentModel[];
}

export class FileModel implements FileInterface {
  seq: number;
  file_name: string;
  file_size: string;
  file_extension: string;
  users?: EmpsModel[];
  comments?: CommentModel[];

  constructor(file: FileInterface) {
    this.seq = file.seq;
    this.file_name = file.file_name;
    this.file_size = file.file_size;
    this.file_extension = file.file_extension;
    this.users = file.users;
    this.comments = file.comments;
  }
}
