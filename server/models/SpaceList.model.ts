export interface SpaceListInterface {
  "UID": string;
  space: string[] | null[];
}

export class SpaceListModel implements SpaceListInterface {
  "UID": string;
  space: string[] | null[];

  constructor(space: SpaceListInterface) {
    this.UID = space.UID;
    this.space = space.space;
  }
}
