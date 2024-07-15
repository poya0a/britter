export interface SpaceListInterface {
  UID: string;
  space: string[];
}

export class SpaceListModel implements SpaceListInterface {
  UID: string;
  space: string[];

  constructor(space: SpaceListInterface) {
    this.UID = space.UID;
    this.space = space.space;
  }
}
