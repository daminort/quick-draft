import type { TViewBounds } from '~/components/canvas/shapes/ShapeInteraction';

/** Size (px) of a component library thumbnail preview. Used in: components/panels/ComponentLibrary.tsx */
export const COMPONENT_PREVIEW_SIZE = 64;

/** Padding (px) inside a component library thumbnail preview. Used in: components/panels/ComponentLibrary.tsx */
export const COMPONENT_PREVIEW_PADDING = 6;

/** Effectively-unbounded view bounds passed to shape renderers that draw off the interactive canvas (library thumbnails, nested component instances), so nothing gets clipped. Used in: components/panels/ComponentLibrary.tsx, components/canvas/shapes/ComponentInstanceShape.tsx */
export const LARGE_VIEW_BOUNDS: TViewBounds = { left: -1e5, top: -1e5, right: 1e5, bottom: 1e5 };
