export const MIN_SCALE = 0.1;

export const MAX_SCALE = 5;

export const WHEEL_SCALE_BY = 1.05;

export const BUTTON_SCALE_BY = 1.2;

/** DOM `MouseEvent.button` code for the middle button. */
export const MIDDLE_MOUSE_BUTTON = 1;

/** Screen pixels, before dividing by zoom scale. */
export const SNAP_TOLERANCE_PX = 8;

/** Below this screen-space drag distance, a marquee mousedown+mouseup is treated as a plain click
 * rather than a zero-size selection. */
export const MARQUEE_CLICK_THRESHOLD_PX = 3;

/** Invisible hit-test padding around thin shapes (lines/arcs/guides/dimensions) so they're easier to click. */
export const HIT_STROKE_WIDTH = 12;

export const SNAP_INDICATOR_COLOR = '#ff3b8d';

export const SNAP_POINT_SIZE = 5;

export const MARQUEE_STROKE_COLOR = '#2563eb';

export const MARQUEE_FILL_COLOR = 'rgba(37, 99, 235, 0.1)';

/** Screen px, not zoom-scaled — stays constant regardless of canvas zoom level. */
export const TEXT_EDIT_OVERLAY_PADDING_PX = 4;
