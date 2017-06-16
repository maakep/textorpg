export type Item = {
  name: string,
  value: number,
};

export type Coordinates = {
  x: number,
  y: number,
}

export type Location = { 
  coordinates: Coordinates,
  items?: Item[],
  isBlocker?: boolean,
  desc?: string,
}

export type Message = {
  coordinates: Coordinates,
  message: string,
}

export type TakeItem = {
  coordinates: Coordinates,
  item: string,
}