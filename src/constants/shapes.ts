import type { TStyle } from '~/types/document';

export const SELECTED_COLOR = '#1d4ed8';

export const GUIDE_COLOR = 'rgba(59, 130, 246, 0.6)';

export const GUIDE_DASH = [4, 4];

/** Large enough to always cover the visible canvas, since a guide has no natural start/end. */
export const GUIDE_REACH = 100000;

export const DEFAULT_SHAPE_STYLE: TStyle = { stroke: '#1a1a1a', strokeWidth: 1 };

export const DEFAULT_TEXT_COLOR = '#1a1a1a';

export const DEFAULT_TEXT_FONT_FAMILY = 'Arial';

export const DEFAULT_TEXT_FONT_SIZE = 16;

export const DEFAULT_TEXT_CONTENT = 'Text';

export const DEFAULT_TEXT_ALIGN = 'left';

/** Just short of a full circle so a newly drawn arc renders as a closed-looking ring by default. */
export const DEFAULT_ARC_END_ANGLE = 359.999;

export const DEFAULT_DIMENSION_AXIS = 'horizontal';

/** Approximates a plain text shape's bounding box without measuring actual glyphs. */
export const TEXT_CHAR_WIDTH_RATIO = 0.6;

/** Half-extent (document units) of the bounding box synthesized for an infinite guide line — large
 * enough that it's never mistaken for the marquee-selection edge. */
export const GUIDE_SPAN = 1e6;
