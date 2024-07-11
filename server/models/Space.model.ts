export interface SpaceInterface {
  UID: string;
  space_profile_seq: number;
  space_name: string;
  space_manager: string;
  space_public: boolean;
  space_users: any;
}

export class SpaceModel implements SpaceInterface {
  UID: string;
  space_profile_seq: number;
  space_name: string;
  space_manager: string;
  space_public: boolean;
  space_users: any;

  constructor(space: SpaceInterface) {
    this.UID = space.UID;
    this.space_profile_seq = space.space_profile_seq;
    this.space_name = space.space_name;
    this.space_manager = space.space_manager;
    this.space_public = space.space_public;
    this.space_users = space.space_users;
  }
}
