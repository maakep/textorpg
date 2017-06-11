export type Item = {
  name: string,
  value: number
};

export type Coordinates = {
  x: number,
  y: number,
}

export type Location = { 
  coordinates: Coordinates,
  items?: Item[],
  isblocker?: boolean
}