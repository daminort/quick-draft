import {
  RULER_BAR_THICKNESS as THICKNESS,
  RULER_BAR_MAJOR_TICK_TARGET_PX as MAJOR_TICK_TARGET_PX,
  RULER_BAR_MINOR_TICKS_PER_MAJOR as MINOR_TICKS_PER_MAJOR,
  RULER_BAR_BG_COLOR as BG_COLOR,
  RULER_BAR_BORDER_COLOR as BORDER_COLOR,
  RULER_BAR_MINOR_TICK_COLOR as MINOR_TICK_COLOR,
  RULER_BAR_MAJOR_TICK_COLOR as MAJOR_TICK_COLOR,
  RULER_BAR_LABEL_COLOR as LABEL_COLOR,
  RULER_BAR_FONT_SIZE as FONT_SIZE,
  RULER_BAR_GUIDE_COLOR as GUIDE_COLOR,
  RULER_BAR_GUIDE_OPACITY as GUIDE_OPACITY,
} from '~/constants/ruler'

type LengthUnit = 'mm' | 'cm' | 'm'

interface CanvasRulersProps {
  width: number
  height: number
  scale: number
  offsetX: number
  offsetY: number
  documentScale: number
  documentUnits: LengthUnit
  cursor?: { x: number; y: number } | null
}

interface Tick {
  screenPos: number
  isMajor: boolean
  label: string
}

/** Rounds `rawStep` up to the nearest "nice" 1-2-5 * 10^n number, standard for ruler/axis ticks. */
function niceStep(rawStep: number): number {
  if (!(rawStep > 0)) return 1
  const exponent = Math.floor(Math.log10(rawStep))
  const fraction = rawStep / 10 ** exponent
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10
  return niceFraction * 10 ** exponent
}

function formatTickLabel(value: number): string {
  return (Math.round(value * 100) / 100).toString()
}

function computeTicks(
  lengthPx: number,
  scale: number,
  offset: number,
  documentScale: number,
): Tick[] {
  const pixelsPerReal = scale / documentScale || 1
  const majorStep = niceStep(MAJOR_TICK_TARGET_PX / pixelsPerReal)
  const minorStep = majorStep / MINOR_TICKS_PER_MAJOR

  const realStart = ((0 - offset) / scale) * documentScale
  const realEnd = ((lengthPx - offset) / scale) * documentScale

  const firstIndex = Math.floor(realStart / minorStep)
  const lastIndex = Math.ceil(realEnd / minorStep)

  const ticks: Tick[] = []
  for (let i = firstIndex; i <= lastIndex; i++) {
    const realValue = i * minorStep
    const screenPos = offset + (realValue / documentScale) * scale
    if (screenPos < 0 || screenPos > lengthPx) continue
    const isMajor = i % MINOR_TICKS_PER_MAJOR === 0
    ticks.push({ screenPos, isMajor, label: isMajor ? formatTickLabel(realValue) : '' })
  }
  return ticks
}

export function CanvasRulers({
  width,
  height,
  scale,
  offsetX,
  offsetY,
  documentScale,
  documentUnits,
  cursor,
}: CanvasRulersProps) {
  const horizontalLength = Math.max(0, width - THICKNESS)
  const horizontalTicks = computeTicks(horizontalLength, scale, offsetX - THICKNESS, documentScale)
  const verticalTicks = computeTicks(height, scale, offsetY, documentScale)

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {cursor && (
        <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
          <line
            x1={cursor.x}
            x2={cursor.x}
            y1={0}
            y2={cursor.y}
            stroke={GUIDE_COLOR}
            strokeOpacity={GUIDE_OPACITY}
            strokeWidth={1}
          />
          <line
            x1={0}
            x2={cursor.x}
            y1={cursor.y}
            y2={cursor.y}
            stroke={GUIDE_COLOR}
            strokeOpacity={GUIDE_OPACITY}
            strokeWidth={1}
          />
        </svg>
      )}
      <svg
        width={horizontalLength}
        height={THICKNESS}
        style={{
          position: 'absolute',
          top: 0,
          left: THICKNESS,
          background: BG_COLOR,
          borderBottom: `1px solid ${BORDER_COLOR}`,
        }}
      >
        {horizontalTicks.map((tick, i) => (
          <line
            key={i}
            x1={tick.screenPos}
            x2={tick.screenPos}
            y1={tick.isMajor ? THICKNESS - 10 : THICKNESS - 5}
            y2={THICKNESS}
            stroke={tick.isMajor ? MAJOR_TICK_COLOR : MINOR_TICK_COLOR}
            strokeWidth={1}
          />
        ))}
        {horizontalTicks
          .filter((tick) => tick.isMajor)
          .map((tick, i) => (
            <text
              key={i}
              x={tick.screenPos + 3}
              y={THICKNESS - 11}
              fontSize={FONT_SIZE}
              fill={LABEL_COLOR}
            >
              {tick.label}
            </text>
          ))}
      </svg>

      <svg
        width={THICKNESS}
        height={height}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          background: BG_COLOR,
          borderRight: `1px solid ${BORDER_COLOR}`,
        }}
      >
        {verticalTicks.map((tick, i) => (
          <line
            key={i}
            x1={0}
            x2={tick.isMajor ? 10 : 5}
            y1={tick.screenPos}
            y2={tick.screenPos}
            stroke={tick.isMajor ? MAJOR_TICK_COLOR : MINOR_TICK_COLOR}
            strokeWidth={1}
          />
        ))}
        {verticalTicks
          .filter((tick) => tick.isMajor)
          .map((tick, i) => (
            <text
              key={i}
              x={THICKNESS / 2}
              y={tick.screenPos - 3}
              fontSize={FONT_SIZE}
              fill={LABEL_COLOR}
              textAnchor="middle"
              transform={`rotate(-90 ${THICKNESS / 2} ${tick.screenPos - 3})`}
            >
              {tick.label}
            </text>
          ))}
        <text
          x={THICKNESS / 2}
          y={THICKNESS / 2}
          fontSize={FONT_SIZE}
          fill={LABEL_COLOR}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {documentUnits}
        </text>
      </svg>
    </div>
  )
}
