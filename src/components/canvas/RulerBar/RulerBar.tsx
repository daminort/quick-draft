import type { CSSProperties } from 'react';

import { Box } from '@radix-ui/themes';

import {
  RULER_BAR_THICKNESS as THICKNESS,
  RULER_BAR_MAJOR_TICK_TARGET_PX as MAJOR_TICK_TARGET_PX,
  RULER_BAR_MINOR_TICKS_PER_MAJOR as MINOR_TICKS_PER_MAJOR,
  RULER_BAR_MINOR_TICK_COLOR as MINOR_TICK_COLOR,
  RULER_BAR_MAJOR_TICK_COLOR as MAJOR_TICK_COLOR,
  RULER_BAR_LABEL_COLOR as LABEL_COLOR,
  RULER_BAR_FONT_SIZE as FONT_SIZE,
  RULER_BAR_GUIDE_COLOR as GUIDE_COLOR,
  RULER_BAR_GUIDE_OPACITY as GUIDE_OPACITY,
} from '~/constants/ruler';

import {
  MAJOR_TICK_LENGTH_PX,
  MINOR_TICK_LENGTH_PX,
  TICK_LABEL_OFFSET_PX,
  TICK_LABEL_BASELINE_OFFSET_PX,
} from './assets';
import s from './RulerBar.module.css';

import type { TCanvasRulersProps, TTick } from './RulerBar.props';

/** Rounds `rawStep` up to the nearest "nice" 1-2-5 * 10^n number, standard for ruler/axis ticks. */
function niceStep(rawStep: number): number {
  if (!(rawStep > 0)) {
    return 1;
  }
  const exponent = Math.floor(Math.log10(rawStep));
  const fraction = rawStep / 10 ** exponent;
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return niceFraction * 10 ** exponent;
}

function formatTickLabel(value: number): string {
  return (Math.round(value * 100) / 100).toString();
}

function computeTicks(
  lengthPx: number,
  scale: number,
  offset: number,
  documentScale: number,
): TTick[] {
  const pixelsPerReal = scale / documentScale || 1;
  const majorStep = niceStep(MAJOR_TICK_TARGET_PX / pixelsPerReal);
  const minorStep = majorStep / MINOR_TICKS_PER_MAJOR;

  const realStart = ((0 - offset) / scale) * documentScale;
  const realEnd = ((lengthPx - offset) / scale) * documentScale;

  const firstIndex = Math.floor(realStart / minorStep);
  const lastIndex = Math.ceil(realEnd / minorStep);

  const ticks: TTick[] = [];
  for (let i = firstIndex; i <= lastIndex; i++) {
    const realValue = i * minorStep;
    const screenPos = offset + (realValue / documentScale) * scale;
    if (screenPos < 0 || screenPos > lengthPx) {
      continue;
    }
    const isMajor = i % MINOR_TICKS_PER_MAJOR === 0;
    ticks.push({ screenPos, isMajor, label: isMajor ? formatTickLabel(realValue) : '' });
  }
  return ticks;
}

const CanvasRulers = ({
  width,
  height,
  scale,
  offsetX,
  offsetY,
  documentScale,
  documentUnits,
  cursor,
}: TCanvasRulersProps) => {
  const horizontalLength = Math.max(0, width - THICKNESS);
  const horizontalTicks = computeTicks(horizontalLength, scale, offsetX - THICKNESS, documentScale);
  const verticalTicks = computeTicks(height, scale, offsetY, documentScale);

  const horizontalRulerStyle = { '--ruler-thickness': `${THICKNESS}px` } as CSSProperties;

  return (
    <Box className={s.overlay}>
      {cursor && (
        <svg width={width} height={height} className={s.cursorGuide}>
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
        className={s.horizontalRuler}
        style={horizontalRulerStyle}
      >
        {horizontalTicks.map((tick, i) => {
          const y1 = tick.isMajor
            ? THICKNESS - MAJOR_TICK_LENGTH_PX
            : THICKNESS - MINOR_TICK_LENGTH_PX;
          const stroke = tick.isMajor ? MAJOR_TICK_COLOR : MINOR_TICK_COLOR;
          return (
            <line
              key={i}
              x1={tick.screenPos}
              x2={tick.screenPos}
              y1={y1}
              y2={THICKNESS}
              stroke={stroke}
              strokeWidth={1}
            />
          );
        })}
        {horizontalTicks
          .filter(tick => tick.isMajor)
          .map((tick, i) => (
            <text
              key={i}
              x={tick.screenPos + TICK_LABEL_OFFSET_PX}
              y={THICKNESS - TICK_LABEL_BASELINE_OFFSET_PX}
              fontSize={FONT_SIZE}
              fill={LABEL_COLOR}
            >
              {tick.label}
            </text>
          ))}
      </svg>

      <svg width={THICKNESS} height={height} className={s.verticalRuler}>
        {verticalTicks.map((tick, i) => {
          const x2 = tick.isMajor ? MAJOR_TICK_LENGTH_PX : MINOR_TICK_LENGTH_PX;
          const stroke = tick.isMajor ? MAJOR_TICK_COLOR : MINOR_TICK_COLOR;
          return (
            <line
              key={i}
              x1={0}
              x2={x2}
              y1={tick.screenPos}
              y2={tick.screenPos}
              stroke={stroke}
              strokeWidth={1}
            />
          );
        })}
        {verticalTicks
          .filter(tick => tick.isMajor)
          .map((tick, i) => (
            <text
              key={i}
              x={THICKNESS / 2}
              y={tick.screenPos - TICK_LABEL_OFFSET_PX}
              fontSize={FONT_SIZE}
              fill={LABEL_COLOR}
              textAnchor="middle"
              transform={`rotate(-90 ${THICKNESS / 2} ${tick.screenPos - TICK_LABEL_OFFSET_PX})`}
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
    </Box>
  );
};

export { CanvasRulers };
