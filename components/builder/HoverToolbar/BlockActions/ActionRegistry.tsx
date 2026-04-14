"use client";

import type { FC } from "react";
import { AppearanceActions } from "./AppearanceActions";
import { MapActions } from "./MapActions";
import type { ActionComponentProps, ActionRegistryMapping } from "@/types/builder";

/**
 * Mapping of block types to their specific toolbar action components.
 */
export const ActionRegistry: ActionRegistryMapping = {
  text: AppearanceActions as FC<ActionComponentProps>,
  link: AppearanceActions as FC<ActionComponentProps>,
  image: AppearanceActions as FC<ActionComponentProps>,
  map: MapActions as FC<ActionComponentProps>,
};
