export interface SpaceInterface {
  UID: string;
  space_profile_seq: number | null;
  space_name: string;
  space_manager: string;
  space_public: boolean;
  space_users: string[];
  invite_users: string[];
  request_users: string[];
  create_date: Date;
}

export class SpaceModel implements SpaceInterface {
  UID: string;
  space_profile_seq: number | null;
  space_name: string;
  space_manager: string;
  space_public: boolean;
  space_users: string[];
  invite_users: string[];
  request_users: string[];
  create_date: Date;

  constructor(space: SpaceInterface) {
    this.UID = space.UID;
    this.space_profile_seq = space.space_profile_seq;
    this.space_name = space.space_name;
    this.space_manager = space.space_manager;
    this.space_public = space.space_public;
    this.space_users = space.space_users;
    this.invite_users = space.invite_users;
    this.request_users = space.request_users;
    this.create_date = space.create_date;
  }
}
