const DEFAULT_DIMENSION_COLOR = '#ff7272';

const DIMENSION_STROKE_WIDTH = 1;

const ARROW_SIZE = 6;

/** Referenced by `url(#...)` from the SVG `<marker>` element it names. */
const ARROW_MARKER_ID = 'quickdraft-dimension-arrow';

/** Also reused by the ruler tool's live-length label. */
const DIMENSION_LABEL_FONT_SIZE = 12;

const UNIT_TO_MM: Record<'mm' | 'cm' | 'm', number> = { mm: 1, cm: 10, m: 1000 };

const EXTENSION_GAP = 5;

/** Per standard drafting convention. */
const EXTENSION_OVERSHOOT = 5;

const LABEL_GAP_HORIZONTAL = 10;

const LABEL_GAP_VERTICAL = 10;

const LEADER_GAP = 4;

/** Below this padding, the label is pushed onto a leader instead of staying centered on the line. */
const TEXT_PADDING = 6;

/** Approximates the italic dimension/ruler label font's width without measuring actual glyphs. */
const DIMENSION_TEXT_CHAR_WIDTH_RATIO = 0.62;

/** Floating-point tolerance for collinearity/containment checks when detecting whether a point lies
 * on a shape's edge. */
const EDGE_EPSILON = 1e-6;

/** Floating-point tolerance for resolving a dimension endpoint to a shape's bindable point. */
const BINDING_EPSILON = 1e-6;

export {
  DEFAULT_DIMENSION_COLOR,
  DIMENSION_STROKE_WIDTH,
  ARROW_SIZE,
  ARROW_MARKER_ID,
  DIMENSION_LABEL_FONT_SIZE,
  UNIT_TO_MM,
  EXTENSION_GAP,
  EXTENSION_OVERSHOOT,
  LABEL_GAP_HORIZONTAL,
  LABEL_GAP_VERTICAL,
  LEADER_GAP,
  TEXT_PADDING,
  DIMENSION_TEXT_CHAR_WIDTH_RATIO,
  EDGE_EPSILON,
  BINDING_EPSILON,
};
