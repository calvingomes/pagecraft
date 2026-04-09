export type NavLink = {
  label: string;
  href: string;
  position?: "left" | "right";
};

export type NavCTA = {
  label: string;
  href: string;
  trackingEvent?: string;
};
