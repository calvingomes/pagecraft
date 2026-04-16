"use client";

import type { FC } from "react";
import { MobileMapActions } from "./Actions/MobileMapActions";
import { MobileImageActions } from "./Actions/MobileImageActions";
import { MobileAppearanceActions } from "./Actions/MobileAppearanceActions";
import type { MobileActionProps, MobileActionRegistryMapping } from "@/types/builder";

/**
 * Mapping of block types to their specific mobile toolbar action components.
 */
export const MobileActionRegistry: MobileActionRegistryMapping = {
  text: MobileAppearanceActions as FC<MobileActionProps>,
  link: MobileAppearanceActions as FC<MobileActionProps>,
  image: MobileImageActions as FC<MobileActionProps>,
  map: MobileMapActions as FC<MobileActionProps>,
  sectionTitle: MobileAppearanceActions as FC<MobileActionProps>,
};
