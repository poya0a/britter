export interface SpaceListInterface {
  UID: string;
  space: any;
}

export class SpaceListModel implements SpaceListInterface {
  UID: string;
  space: any;

  constructor(space: SpaceListInterface) {
    this.UID = space.UID;
    this.space = space.space;
  }
}
