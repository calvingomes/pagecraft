"use client";
/* eslint-disable css-modules/no-unused-class */

import { useState } from "react";
import {
  Search,
  Type,
  Heading,
  Image as ImageIcon,
  Link2,
  Mail,
  MapPin,
  Menu
} from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import * as Toolbar from "@radix-ui/react-toolbar";
import styles from "./WidgetMenu.module.css";
import toolbarStyles from "./Toolbar.module.css";
import { Tooltip } from "@/components/ui/Tooltip/Tooltip";
import type { BlockType } from "@/types/editor";
import type { Widget, WidgetMenuProps } from "./WidgetMenu.types";
import { useEditorContext } from "@/contexts/EditorContext";

const WIDGETS: Widget[] = [
  { id: 'text', title: 'Text', description: 'Add text block', icon: Type },
  { id: 'sectionTitle', title: 'Section Title', description: 'Add a section header', icon: Heading },
  { id: 'image', title: 'Image or Video', description: 'Upload media', icon: ImageIcon },
  { id: 'link', title: 'Website', description: 'Just a link', icon: Link2 },
  { id: 'email', title: 'Email', description: 'Open compose in one tap', icon: Mail, disabled: true },
  { id: 'map', title: 'Map', description: 'Show your location', icon: MapPin, disabled: true },
];

export const WidgetMenu = ({ 
  onAddBlock, 
  onOpenLink, 
  onImageClick 
}: WidgetMenuProps) => {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const editor = useEditorContext();
  const isActualMobile = editor?.isActualMobile ?? false;

  const filteredWidgets = WIDGETS.filter(widget =>
    widget.title.toLowerCase().includes(search.toLowerCase()) ||
    widget.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleWidgetClick = (widgetId: BlockType | 'link' | 'email' | 'map') => {
    if (widgetId === 'email' || widgetId === 'map') return;

    setIsOpen(false);

    if (widgetId === 'link') {
      onOpenLink?.();
    } else if (widgetId === 'image') {
      onImageClick?.();
    } else {
      onAddBlock?.(widgetId as BlockType);
    }
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip content="Add widget" side="top">
        <Popover.Trigger asChild>
          <Toolbar.Button
            className={toolbarStyles.toolButton}
            title=""
            type="button"
            aria-label="Open widget menu"
          >
            <Menu size={20} />
          </Toolbar.Button>
        </Popover.Trigger>
      </Tooltip>

      <Popover.Portal>
        <Popover.Content
          side="top"
          align="center"
          sideOffset={14}
          className={styles.popoverContent}
          data-is-actual-mobile={isActualMobile}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className={styles.searchContainer}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search widgets"
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          <div className={styles.menuSection}>
            <h3 className={styles.sectionHeader}>Common</h3>
            <div className={styles.grid}>
              {filteredWidgets.map((widget) => {
                const Icon = widget.icon;
                return (
                  <div
                    key={widget.id}
                    className={`${styles.widgetCard} ${widget.disabled ? styles.disabled : ""}`}
                    onClick={() => handleWidgetClick(widget.id)}
                  >
                    <div className={styles.iconWrapper}>
                      <Icon size={20} />
                    </div>
                    <div className={styles.widgetInfo}>
                      <span className={styles.widgetTitle}>{widget.title}</span>
                      <span className={styles.widgetDescription}>{widget.description}</span>
                    </div>
                  </div>
            );
              })}
          </div>
        </div>
      </Popover.Content>
    </Popover.Portal>
    </Popover.Root >
  );
};
