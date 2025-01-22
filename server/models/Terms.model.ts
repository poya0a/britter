export interface TermsInterface {
  seq: number;
  title: string;
  content: string;
  required: boolean;
  in_used: boolean;
  create_date: Date;
}

export class TermsModel implements TermsInterface {
  seq: number;
  title: string;
  content: string;
  required: boolean;
  in_used: boolean;
  create_date: Date;

  constructor(tag: TermsInterface) {
    this.seq = tag.seq;
    this.title = tag.title;
    this.content = tag.content;
    this.required = tag.required;
    this.in_used = tag.in_used;
    this.create_date = tag.create_date;
  }
}
