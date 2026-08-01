const MIN_SCALE = 0.1;

const MAX_SCALE = 5;

const WHEEL_SCALE_BY = 1.05;

const BUTTON_SCALE_BY = 1.2;

/** DOM `MouseEvent.button` code for the middle button. */
const MIDDLE_MOUSE_BUTTON = 1;

/** Screen pixels, before dividing by zoom scale. */
const SNAP_TOLERANCE_PX = 8;

/** Below this screen-space drag distance, a marquee mousedown+mouseup is treated as a plain click
 * rather than a zero-size selection. */
const MARQUEE_CLICK_THRESHOLD_PX = 3;

/** Invisible hit-test padding around thin shapes (lines/arcs/guides/dimensions) so they're easier to click. */
const HIT_STROKE_WIDTH = 12;

const SNAP_INDICATOR_COLOR = '#ff3b8d';

const SNAP_POINT_SIZE = 5;

const MARQUEE_STROKE_COLOR = '#2563eb';

const MARQUEE_FILL_COLOR = 'rgba(37, 99, 235, 0.1)';

/** Screen px, not zoom-scaled — stays constant regardless of canvas zoom level. */
const EDIT_OVERLAY_PADDING_PX = 4;

export {
  MIN_SCALE,
  MAX_SCALE,
  WHEEL_SCALE_BY,
  BUTTON_SCALE_BY,
  MIDDLE_MOUSE_BUTTON,
  SNAP_TOLERANCE_PX,
  MARQUEE_CLICK_THRESHOLD_PX,
  HIT_STROKE_WIDTH,
  SNAP_INDICATOR_COLOR,
  SNAP_POINT_SIZE,
  MARQUEE_STROKE_COLOR,
  MARQUEE_FILL_COLOR,
  EDIT_OVERLAY_PADDING_PX,
};
