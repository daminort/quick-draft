/** Minimum allowed canvas zoom scale. Used in: stores/useViewStore.ts, components/canvas/tools/useCanvasZoom.ts, components/canvas/ZoomControl.tsx */
export const MIN_SCALE = 0.1

/** Maximum allowed canvas zoom scale. Used in: stores/useViewStore.ts, components/canvas/tools/useCanvasZoom.ts, components/canvas/ZoomControl.tsx */
export const MAX_SCALE = 5

/** Zoom multiplier applied per ctrl+wheel tick. Used in: components/canvas/tools/useCanvasZoom.ts */
export const WHEEL_SCALE_BY = 1.05

/** Zoom multiplier applied per zoom in/out button click. Used in: components/canvas/tools/useCanvasZoom.ts */
export const BUTTON_SCALE_BY = 1.2

/** Mouse button code that triggers canvas panning (middle button). Used in: components/canvas/tools/useCanvasPan.ts */
export const MIDDLE_MOUSE_BUTTON = 1

/** Default snap tolerance in screen pixels, before dividing by zoom scale. Used in: stores/useUIStore.ts, lib/snap.ts */
export const SNAP_TOLERANCE_PX = 8

/** Below this screen-space drag distance, a marquee mousedown+mouseup is treated as a plain click. Used in: components/canvas/tools/useSelectTool.ts */
export const MARQUEE_CLICK_THRESHOLD_PX = 3

/** Invisible hit-test padding around thin shapes (lines/arcs/guides/dimensions) so they're easier to click. Used in: components/canvas/shapes/LineShape.tsx, ArcShape.tsx, GuideShape.tsx, DimensionShape.tsx */
export const HIT_STROKE_WIDTH = 12

/** Color of the snap-alignment indicator lines/point drawn while dragging. Used in: components/canvas/CanvasStage.tsx */
export const SNAP_INDICATOR_COLOR = '#ff3b8d'

/** Size (px) of the small square marking an active snap point. Used in: components/canvas/CanvasStage.tsx */
export const SNAP_POINT_SIZE = 5

/** Stroke color of the rubber-band selection marquee. Used in: components/canvas/CanvasStage.tsx */
export const MARQUEE_STROKE_COLOR = '#2563eb'

/** Fill color of the rubber-band selection marquee. Used in: components/canvas/CanvasStage.tsx */
export const MARQUEE_FILL_COLOR = 'rgba(37, 99, 235, 0.1)'

/** Visual breathing room (screen px, not zoom-scaled) inside the dashed box shown when editing text in-place. Used in: components/canvas/TextEditOverlay.tsx */
export const TEXT_EDIT_OVERLAY_PADDING_PX = 4
