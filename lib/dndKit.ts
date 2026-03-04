import { closestCenter, CollisionDetection } from "@dnd-kit/core";

/**
 * A custom collision detection strategy that snaps to the droppable
 * closest to the cursor position, rather than the center of the dragged item.
 *
 * This makes dragging feel more precise, especially for large items or when
 * the user grabs an item by its edge.
 */
export const snapToCursor: CollisionDetection = (args) => {
  const { pointerCoordinates } = args;

  // If no pointer coordinates (e.g. keyboard drag), fallback to default
  if (!pointerCoordinates) {
    return closestCenter(args);
  }

  // Create a tiny rect centered at the pointer
  const cursorRect = {
    top: pointerCoordinates.y,
    bottom: pointerCoordinates.y + 1,
    left: pointerCoordinates.x,
    right: pointerCoordinates.x + 1,
    width: 1,
    height: 1,
  };

  return closestCenter({
    ...args,
    collisionRect: cursorRect,
  });
};
