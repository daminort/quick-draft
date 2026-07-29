// RulerOverlay: the live measurement line drawn on the canvas by the ruler tool.

/** Stroke color of the ruler tool's measurement line. Used in: components/canvas/RulerOverlay.tsx */
export const RULER_OVERLAY_COLOR = '#0f766e';

/** Dash pattern for the ruler tool's measurement line. Used in: components/canvas/RulerOverlay.tsx */
export const RULER_OVERLAY_DASH = [6, 4];

/** Stroke width for the ruler tool's measurement line. Used in: components/canvas/RulerOverlay.tsx */
export const RULER_OVERLAY_STROKE_WIDTH = 1;

/** Gap between the ruler line and its length label. Used in: components/canvas/RulerOverlay.tsx */
export const RULER_OVERLAY_LABEL_GAP = 8;

/** Padding around the ruler tool's editable length label background. Used in: components/canvas/RulerOverlay.tsx */
export const RULER_OVERLAY_LABEL_PADDING = 4;

/** Background color of the ruler tool's label while the length is being typed in manually. Used in: components/canvas/RulerOverlay.tsx */
export const RULER_OVERLAY_BG = '#0f766e';

/** Text color of the ruler tool's label while the length is being typed in manually. Used in: components/canvas/RulerOverlay.tsx */
export const RULER_OVERLAY_TEXT_COLOR = '#ffffff';

// RulerBar: the fixed horizontal/vertical ruler strips along the canvas edges.

/** Width/height (px) of the ruler bars running along the canvas edges. Used in: components/canvas/RulerBar.tsx */
export const RULER_BAR_THICKNESS = 20;

/** Target on-screen pixel spacing between major tick marks (actual spacing is rounded to a "nice" 1-2-5 step). Used in: components/canvas/RulerBar.tsx */
export const RULER_BAR_MAJOR_TICK_TARGET_PX = 80;

/** Number of minor ticks per major tick. Used in: components/canvas/RulerBar.tsx */
export const RULER_BAR_MINOR_TICKS_PER_MAJOR = 5;

/** Background color of the ruler bars. Used in: components/canvas/RulerBar.tsx */
export const RULER_BAR_BG_COLOR = '#fafafa';

/** Border color of the ruler bars. Used in: components/canvas/RulerBar.tsx */
export const RULER_BAR_BORDER_COLOR = '#ddd';

/** Color of minor tick marks. Used in: components/canvas/RulerBar.tsx */
export const RULER_BAR_MINOR_TICK_COLOR = '#ccc';

/** Color of major tick marks. Used in: components/canvas/RulerBar.tsx */
export const RULER_BAR_MAJOR_TICK_COLOR = '#888';

/** Color of ruler bar tick labels. Used in: components/canvas/RulerBar.tsx */
export const RULER_BAR_LABEL_COLOR = '#555';

/** Font size for ruler bar tick labels. Used in: components/canvas/RulerBar.tsx */
export const RULER_BAR_FONT_SIZE = 9;

/** Color of the crosshair guide lines projected onto the ruler bars from the cursor. Used in: components/canvas/RulerBar.tsx */
export const RULER_BAR_GUIDE_COLOR = '#999';

/** Opacity of the crosshair guide lines projected onto the ruler bars. Used in: components/canvas/RulerBar.tsx */
export const RULER_BAR_GUIDE_OPACITY = 0.35;
