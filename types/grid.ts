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

export type LayoutById = Record<string, GridLayout | undefined>;

export type CompactResult = {
  blocks: import("@/types/editor").Block[];
  changedIds: Set<string>;
};
