/** Color of dimension lines, extension lines, arrowheads and labels. Used in: components/canvas/shapes/DimensionShape.tsx, render/svg/renderDocumentToSvg.ts */
export const DIMENSION_COLOR = '#ff7272'

/** Stroke width for dimension lines/extension lines/arrows. Used in: components/canvas/shapes/DimensionShape.tsx, render/svg/renderDocumentToSvg.ts */
export const DIMENSION_STROKE_WIDTH = 1

/** Size (px) of dimension line arrowheads. Used in: components/canvas/shapes/DimensionShape.tsx, render/svg/renderDocumentToSvg.ts */
export const ARROW_SIZE = 6

/** SVG <marker> id for the dimension arrowhead, referenced by url(#...). Used in: render/svg/renderDocumentToSvg.ts */
export const ARROW_MARKER_ID = 'quickdraft-dimension-arrow'

/** Font size for dimension length labels (also reused by the ruler tool's live-length label). Used in: lib/dimension.ts, components/canvas/shapes/DimensionShape.tsx, components/canvas/RulerOverlay.tsx, render/svg/renderDocumentToSvg.ts */
export const DIMENSION_LABEL_FONT_SIZE = 12

/** Conversion factors from each supported length unit to millimeters. Used in: lib/dimension.ts */
export const UNIT_TO_MM: Record<'mm' | 'cm' | 'm', number> = { mm: 1, cm: 10, m: 1000 }

/** Gap between a measured point and the start of its extension line. Used in: lib/dimension.ts */
export const EXTENSION_GAP = 5

/** How far an extension line overshoots past the dimension line, per drafting convention. Used in: lib/dimension.ts */
export const EXTENSION_OVERSHOOT = 5

/** Gap between a horizontal dimension line and its label. Used in: lib/dimension.ts */
export const LABEL_GAP_HORIZONTAL = 10

/** Gap between a vertical dimension line and its label. Used in: lib/dimension.ts */
export const LABEL_GAP_VERTICAL = 10

/** Gap between a dimension line and its leader connector when the label had to move outside the line. Used in: lib/dimension.ts */
export const LEADER_GAP = 4

/** Minimum padding required around a dimension label before it's pushed onto a leader instead of centered on the line. Used in: lib/dimension.ts */
export const TEXT_PADDING = 6

/** Estimated character width, as a multiple of font size, for the italic dimension/ruler label font. Used in: lib/dimension.ts, components/canvas/RulerOverlay.tsx */
export const DIMENSION_TEXT_CHAR_WIDTH_RATIO = 0.62

/** Tolerance for detecting whether a point lies on a shape's edge (collinearity/containment checks). Used in: lib/dimension.ts */
export const EDGE_EPSILON = 1e-6

/** Coordinate-match tolerance for resolving a dimension endpoint to a shape's bindable point. Used in: lib/dimensionBinding.ts */
export const BINDING_EPSILON = 1e-6
