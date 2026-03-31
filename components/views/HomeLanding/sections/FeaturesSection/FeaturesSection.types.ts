export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  mediaType: "image" | "video";
  mediaSrc: string;
  mediaAlt: string;
}

export interface FeatureCardProps {
  feature: FeatureItem;
  index: number;
  stickyTop: number;
  scale: number;
}
