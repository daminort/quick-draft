import type { TStyle } from '~/types/document';

/** Highlight color for a selected shape's stroke/fill. Used in: components/canvas/shapes/TextShape.tsx, CircleShape.tsx, RectShape.tsx, LineShape.tsx, ArcShape.tsx, GuideShape.tsx, DimensionShape.tsx */
export const SELECTED_COLOR = '#1d4ed8';

/** Color of an unselected guide line. Used in: components/canvas/shapes/GuideShape.tsx */
export const GUIDE_COLOR = 'rgba(59, 130, 246, 0.6)';

/** Dash pattern for guide lines. Used in: components/canvas/shapes/GuideShape.tsx */
export const GUIDE_DASH = [4, 4];

/** How far a guide line extends from its anchor point when rendered (large enough to always cover the visible canvas). Used in: components/canvas/shapes/GuideShape.tsx */
export const GUIDE_REACH = 100000;

/** Default stroke style applied to newly drawn rect/line/circle/arc shapes. Used in: components/canvas/tools/useDrawingTool.ts */
export const DEFAULT_SHAPE_STYLE: TStyle = { stroke: '#1a1a1a', strokeWidth: 1 };

/** Default fill color for newly created text shapes. Used in: components/canvas/tools/useDrawingTool.ts */
export const DEFAULT_TEXT_COLOR = '#1a1a1a';

/** Default font family for newly created text shapes. Used in: components/canvas/tools/useDrawingTool.ts */
export const DEFAULT_TEXT_FONT_FAMILY = 'Arial';

/** Default font size for newly created text shapes. Used in: components/canvas/tools/useDrawingTool.ts */
export const DEFAULT_TEXT_FONT_SIZE = 16;

/** Initial placeholder content for newly created text shapes. Used in: components/canvas/tools/useDrawingTool.ts */
export const DEFAULT_TEXT_CONTENT = 'Text';

/** Default horizontal alignment for newly created text shapes. Used in: components/canvas/tools/useDrawingTool.ts */
export const DEFAULT_TEXT_ALIGN = 'left';

/** Default end angle (degrees) for a newly drawn arc, just short of a full circle so it renders as a closed-looking ring by default. Used in: components/canvas/tools/useDrawingTool.ts */
export const DEFAULT_ARC_END_ANGLE = 359.999;

/** Default axis for a newly created dimension, before the user drags to set orientation. Used in: components/canvas/tools/useDrawingTool.ts */
export const DEFAULT_DIMENSION_AXIS = 'horizontal';

/** Estimated character width, as a multiple of font size, used to approximate a plain text shape's bounding box without measuring actual glyphs. Used in: lib/bounds.ts */
export const TEXT_CHAR_WIDTH_RATIO = 0.6;

/** Half-extent (in document units) of the axis-aligned bounding box synthesized for an infinite guide line, large enough that it's never mistaken for the marquee-selection edge. Used in: lib/bounds.ts */
export const GUIDE_SPAN = 1e6;
