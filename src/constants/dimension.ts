export const DEFAULT_DIMENSION_COLOR = '#ff7272';

export const DIMENSION_STROKE_WIDTH = 1;

export const ARROW_SIZE = 6;

/** Referenced by `url(#...)` from the SVG `<marker>` element it names. */
export const ARROW_MARKER_ID = 'quickdraft-dimension-arrow';

/** Also reused by the ruler tool's live-length label. */
export const DIMENSION_LABEL_FONT_SIZE = 12;

export const UNIT_TO_MM: Record<'mm' | 'cm' | 'm', number> = { mm: 1, cm: 10, m: 1000 };

export const EXTENSION_GAP = 5;

/** Per standard drafting convention. */
export const EXTENSION_OVERSHOOT = 5;

export const LABEL_GAP_HORIZONTAL = 10;

export const LABEL_GAP_VERTICAL = 10;

export const LEADER_GAP = 4;

/** Below this padding, the label is pushed onto a leader instead of staying centered on the line. */
export const TEXT_PADDING = 6;

/** Approximates the italic dimension/ruler label font's width without measuring actual glyphs. */
export const DIMENSION_TEXT_CHAR_WIDTH_RATIO = 0.62;

/** Floating-point tolerance for collinearity/containment checks when detecting whether a point lies
 * on a shape's edge. */
export const EDGE_EPSILON = 1e-6;

/** Floating-point tolerance for resolving a dimension endpoint to a shape's bindable point. */
export const BINDING_EPSILON = 1e-6;
