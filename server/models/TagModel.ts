import { PostModel } from "./PostModel";

export interface TagInterface {
  seq: number;
  name: string;
  posts?: PostModel[];
}

export class TagModel implements TagInterface {
  seq: number;
  name: string;
  posts?: PostModel[];

  constructor(tag: TagInterface) {
    this.seq = tag.seq;
    this.name = tag.name;
    this.posts = tag.posts;
  }
}
