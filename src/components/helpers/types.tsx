export interface IItem {
  name: string;
  value: number;
  use?: () => void;
}

export interface ICoordinates {
  x: number;
  y: number;
}

export interface ILocation {
  coordinates: ICoordinates;
  items?: IItem[];
  isBlocker?: boolean;
  desc?: string;
  spawner?: (a: ILocation) => void;
}

export interface IMessage {
  coordinates?: ICoordinates;
  message: string;
  author?: string;
  messageLevel: MessageLevel;
  time: Date;
}

export class MessageLevel {
  public static Player = "player-message";
  public static System = "system-message";
  public static Server = "server-message";
}

export interface ITakeItem {
  coordinates: ICoordinates;
  item: string;
}
