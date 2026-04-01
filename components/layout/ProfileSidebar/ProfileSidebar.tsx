"use client";

import dynamic from "next/dynamic";
import { ProfileSidebarView } from "./ProfileSidebarView";
import type { ProfileSidebarProps } from "./ProfileSidebar.types";

const ProfileSidebarEditor = dynamic(
  () => import("./ProfileSidebarEditor").then((mod) => mod.ProfileSidebarEditor),
  { ssr: false }
);

export const ProfileSidebar = (props: ProfileSidebarProps) => {
  if (props.variant === "view") {
    return (
      <ProfileSidebarView
        username={props.username}
        displayName={props.displayName}
        bioHtml={props.bioHtml}
        avatarUrl={props.avatarUrl}
        avatarShape={props.avatarShape}
      />
    );
  }

  return <ProfileSidebarEditor {...props} />;
};
