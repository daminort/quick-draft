import type { TDocument, TShape } from '~/types/document';

import { PAGE_MARGIN_MM, EMPTY_PAGE_SIZE_MM } from '~/constants/print';
import {
  DIMENSION_LABEL_FONT_SIZE,
  DEFAULT_DIMENSION_COLOR,
  DIMENSION_STROKE_WIDTH,
  ARROW_SIZE,
  ARROW_MARKER_ID,
} from '~/constants/dimension';

import { computeArcPath } from '~/lib/arcPath';
import { computeDimensionGeometry, convertLength, formatDimensionLabel } from '~/lib/dimension';
import { getUnionBounds } from '~/lib/bounds';
import { flattenComponentInstance } from '~/lib/shapeTransform';

export type TRenderSvgOptions = {
  showDimensionUnit?: boolean;
  dimensionColor?: string;
};

type TRenderContext = {
  document: TDocument;
  showDimensionUnit: boolean;
  dimensionColor: string;
  /** Converts a raw document-space value (length, radius, font size, ...) to mm. */
  mm: (value: number) => number;
  offsetXMm: number;
  offsetYMm: number;
};

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function round(value: number): number {
  return Number.isFinite(value) ? Math.round(value * 1000) / 1000 : 0;
}

function renderShape(shape: TShape, ctx: TRenderContext): string {
  const X = (v: number) => round(ctx.mm(v) + ctx.offsetXMm);
  const Y = (v: number) => round(ctx.mm(v) + ctx.offsetYMm);
  const L = (v: number) => round(ctx.mm(v));

  switch (shape.type) {
    case 'line': {
      const dash = shape.style.dash?.map(L).join(',');
      return `<line x1="${X(shape.x1)}" y1="${Y(shape.y1)}" x2="${X(shape.x2)}" y2="${Y(shape.y2)}" stroke="${shape.style.stroke}" stroke-width="${L(shape.style.strokeWidth)}"${dash ? ` stroke-dasharray="${dash}"` : ''} />`;
    }
    case 'rect': {
      const x = X(shape.x);
      const y = Y(shape.y);
      const dash = shape.style.dash?.map(L).join(',');
      const transform = shape.rotation
        ? ` transform="rotate(${round(shape.rotation)} ${x} ${y})"`
        : '';
      const fillOpacity =
        shape.style.fill !== undefined ? (shape.style.fillOpacity ?? 1) : undefined;
      return `<rect x="${x}" y="${y}" width="${L(shape.w)}" height="${L(shape.h)}" stroke="${shape.style.stroke}" stroke-width="${L(shape.style.strokeWidth)}" fill="${shape.style.fill ?? 'none'}"${fillOpacity !== undefined ? ` fill-opacity="${fillOpacity}"` : ''}${dash ? ` stroke-dasharray="${dash}"` : ''}${transform} />`;
    }
    case 'circle': {
      const dash = shape.style.dash?.map(L).join(',');
      const fillOpacity =
        shape.style.fill !== undefined ? (shape.style.fillOpacity ?? 1) : undefined;
      return `<circle cx="${X(shape.cx)}" cy="${Y(shape.cy)}" r="${L(shape.r)}" stroke="${shape.style.stroke}" stroke-width="${L(shape.style.strokeWidth)}" fill="${shape.style.fill ?? 'none'}"${fillOpacity !== undefined ? ` fill-opacity="${fillOpacity}"` : ''}${dash ? ` stroke-dasharray="${dash}"` : ''} />`;
    }
    case 'arc': {
      const path = computeArcPath(
        X(shape.cx),
        Y(shape.cy),
        L(shape.r),
        shape.startAngle,
        shape.endAngle,
      );
      const dash = shape.style.dash?.map(L).join(',');
      const fillOpacity =
        shape.style.fill !== undefined ? (shape.style.fillOpacity ?? 1) : undefined;
      return `<path d="${path}" stroke="${shape.style.stroke}" stroke-width="${L(shape.style.strokeWidth)}" fill="${shape.style.fill ?? 'none'}"${fillOpacity !== undefined ? ` fill-opacity="${fillOpacity}"` : ''}${dash ? ` stroke-dasharray="${dash}"` : ''} />`;
    }
    case 'text': {
      return `<text x="${X(shape.x)}" y="${Y(shape.y)}" font-family="${escapeXml(shape.fontFamily)}" font-size="${L(shape.fontSize)}" font-weight="${shape.bold ? 'bold' : 'normal'}" font-style="${shape.italic ? 'italic' : 'normal'}" fill="${shape.fill}" dominant-baseline="hanging">${escapeXml(shape.text)}</text>`;
    }
    case 'dimension': {
      const geometry = computeDimensionGeometry(
        shape.x1,
        shape.y1,
        shape.x2,
        shape.y2,
        shape.axis,
        shape.offset,
        ctx.document.scale,
        ctx.document.units,
        shape.unit,
        ctx.showDimensionUnit,
        ctx.document.shapes,
      );
      if (!geometry) {
        return '';
      }

      const strokeW = L(DIMENSION_STROKE_WIDTH);
      const fontSize = L(DIMENSION_LABEL_FONT_SIZE);
      const labelText = escapeXml(
        formatDimensionLabel(geometry.length, shape.unit, ctx.showDimensionUnit),
      );
      const textAnchor = geometry.label.align === 'center' ? 'middle' : geometry.label.align;
      const dominantBaseline = geometry.label.baseline === 'top' ? 'hanging' : 'text-after-edge';

      const parts = [
        `<line x1="${X(geometry.arrowLine.x1)}" y1="${Y(geometry.arrowLine.y1)}" x2="${X(geometry.arrowLine.x2)}" y2="${Y(geometry.arrowLine.y2)}" stroke="${ctx.dimensionColor}" stroke-width="${strokeW}" marker-start="url(#${ARROW_MARKER_ID})" marker-end="url(#${ARROW_MARKER_ID})" />`,
      ];
      if (geometry.extensionA) {
        parts.push(
          `<line x1="${X(geometry.extensionA.x1)}" y1="${Y(geometry.extensionA.y1)}" x2="${X(geometry.extensionA.x2)}" y2="${Y(geometry.extensionA.y2)}" stroke="${ctx.dimensionColor}" stroke-width="${strokeW}" />`,
        );
      }
      if (geometry.extensionB) {
        parts.push(
          `<line x1="${X(geometry.extensionB.x1)}" y1="${Y(geometry.extensionB.y1)}" x2="${X(geometry.extensionB.x2)}" y2="${Y(geometry.extensionB.y2)}" stroke="${ctx.dimensionColor}" stroke-width="${strokeW}" />`,
        );
      }
      if (geometry.leader) {
        parts.push(
          `<line x1="${X(geometry.leader.x1)}" y1="${Y(geometry.leader.y1)}" x2="${X(geometry.leader.x2)}" y2="${Y(geometry.leader.y2)}" stroke="${ctx.dimensionColor}" stroke-width="${strokeW}" />`,
        );
      }
      parts.push(
        `<text x="${X(geometry.label.x)}" y="${Y(geometry.label.y)}" font-size="${fontSize}" font-style="italic" fill="${ctx.dimensionColor}" text-anchor="${textAnchor}" dominant-baseline="${dominantBaseline}">${labelText}</text>`,
      );
      return parts.join('');
    }
    case 'guide':
      // Guides only exist in the editor — never printed/exported.
      return '';
    case 'component-instance': {
      const componentDef = ctx.document.components[shape.componentId];
      if (!componentDef) {
        return '';
      }
      return flattenComponentInstance(shape, componentDef)
        .map(flattened => renderShape(flattened, ctx))
        .join('');
    }
    default:
      return '';
  }
}

/**
 * Renders a document to a standalone SVG string sized in real physical millimeters, derived from
 * `document.scale`/`document.units` — printing it at 100% ("actual size") reproduces the drawing
 * at true scale. Guides are never included; they're an editor-only aid.
 *
 * The page is sized to fit the full content — from the top-left corner of the top-left-most shape
 * to the bottom-right corner of the bottom-right-most one, plus a margin — rather than a fixed
 * paper size, so nothing is ever clipped regardless of how large or spread out the drawing is.
 */
export function renderDocumentToSvg(document: TDocument, options: TRenderSvgOptions = {}): string {
  const showDimensionUnit = options.showDimensionUnit ?? false;
  const dimensionColor = options.dimensionColor ?? DEFAULT_DIMENSION_COLOR;
  const printableShapes = document.shapes.filter(shape => shape.type !== 'guide');
  const bounds = getUnionBounds(printableShapes, document.components);

  const mm = (value: number) => convertLength(value, document.scale, document.units, 'mm');

  const page = bounds
    ? {
        width: mm(bounds.x2 - bounds.x1) + PAGE_MARGIN_MM * 2,
        height: mm(bounds.y2 - bounds.y1) + PAGE_MARGIN_MM * 2,
      }
    : EMPTY_PAGE_SIZE_MM;

  const offsetXMm = PAGE_MARGIN_MM - (bounds ? mm(bounds.x1) : 0);
  const offsetYMm = PAGE_MARGIN_MM - (bounds ? mm(bounds.y1) : 0);

  const ctx: TRenderContext = {
    document,
    showDimensionUnit,
    dimensionColor,
    mm,
    offsetXMm,
    offsetYMm,
  };
  const body = printableShapes.map(shape => renderShape(shape, ctx)).join('\n');

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${page.width}mm" height="${page.height}mm" viewBox="0 0 ${page.width} ${page.height}">`,
    `<defs><marker id="${ARROW_MARKER_ID}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="${ARROW_SIZE}" markerHeight="${ARROW_SIZE}" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="${dimensionColor}" /></marker></defs>`,
    `<rect x="0" y="0" width="${page.width}" height="${page.height}" fill="#ffffff" />`,
    body,
    `</svg>`,
  ].join('\n');
}
