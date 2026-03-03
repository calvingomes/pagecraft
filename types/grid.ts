export type GridLayout = {
  x: number;
  y: number;
};

export type GridRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type PlacedRect = GridRect & {
  id: string;
};
