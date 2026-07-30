import type { TStyle } from '~/types/document';

const SELECTED_COLOR = '#1d4ed8';

const GUIDE_COLOR = 'rgba(59, 130, 246, 0.6)';

const GUIDE_DASH = [4, 4];

/** Large enough to always cover the visible canvas, since a guide has no natural start/end. */
const GUIDE_REACH = 100000;

const DEFAULT_SHAPE_STYLE: TStyle = { stroke: '#1a1a1a', strokeWidth: 1 };

const DEFAULT_TEXT_COLOR = '#1a1a1a';

const DEFAULT_TEXT_FONT_FAMILY = 'Arial';

const DEFAULT_TEXT_FONT_SIZE = 16;

const DEFAULT_TEXT_CONTENT = 'Text';

const DEFAULT_TEXT_ALIGN = 'left';

/** Just short of a full circle so a newly drawn arc renders as a closed-looking ring by default. */
const DEFAULT_ARC_END_ANGLE = 359.999;

const DEFAULT_DIMENSION_AXIS = 'horizontal';

/** Approximates a plain text shape's bounding box without measuring actual glyphs. */
const TEXT_CHAR_WIDTH_RATIO = 0.6;

/** Half-extent (document units) of the bounding box synthesized for an infinite guide line — large
 * enough that it's never mistaken for the marquee-selection edge. */
const GUIDE_SPAN = 1e6;

export {
  SELECTED_COLOR,
  GUIDE_COLOR,
  GUIDE_DASH,
  GUIDE_REACH,
  DEFAULT_SHAPE_STYLE,
  DEFAULT_TEXT_COLOR,
  DEFAULT_TEXT_FONT_FAMILY,
  DEFAULT_TEXT_FONT_SIZE,
  DEFAULT_TEXT_CONTENT,
  DEFAULT_TEXT_ALIGN,
  DEFAULT_ARC_END_ANGLE,
  DEFAULT_DIMENSION_AXIS,
  TEXT_CHAR_WIDTH_RATIO,
  GUIDE_SPAN,
};
