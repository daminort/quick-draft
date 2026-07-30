import type { TViewBounds } from '~/components/canvas/shapes/ShapeInteraction';

export const COMPONENT_PREVIEW_SIZE = 64;

export const COMPONENT_PREVIEW_PADDING = 6;

/** Effectively-unbounded view bounds passed to shape renderers that draw off the interactive canvas
 * (library thumbnails, nested component instances), so nothing gets clipped. */
export const LARGE_VIEW_BOUNDS: TViewBounds = { left: -1e5, top: -1e5, right: 1e5, bottom: 1e5 };

/** Below this, a component instance would render inverted-looking or effectively invisible. */
export const COMPONENT_INSTANCE_MIN_SCALE = 0.01;
