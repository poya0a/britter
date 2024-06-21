import { EmpsModel } from "./Emps.model";

export interface PrivateInterface {
  seq: number;
  device_id: string;
  private_key: string;
  user?: EmpsModel;
}

export class PrivateModel implements PrivateInterface {
  seq: number;
  device_id: string;
  private_key: string;
  user?: EmpsModel;

  constructor(tag: PrivateInterface) {
    this.seq = tag.seq;
    this.device_id = tag.device_id;
    this.private_key = tag.private_key;
    this.user = tag.user;
  }
}
