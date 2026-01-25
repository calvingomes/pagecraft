export type TextBlock = {
  id: string;
  type: "text";
  order: number;
  data: {
    text: string;
  };
};

export type LinkBlock = {
  id: string;
  type: "link";
  order: number;
  data: {
    label: string;
    url: string;
  };
};

export type Block = TextBlock | LinkBlock;
