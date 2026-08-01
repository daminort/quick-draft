import type { TTool } from '~/stores/toolStore';

import type { TArcPhase, TDimensionPhase } from '~/components/canvas/tools/useDrawingTool';

type TResolveHintTextParams = {
  activeTool: TTool;
  arcPhase: TArcPhase | null;
  dimensionPhase: TDimensionPhase | null;
  hasDimensionDraft: boolean;
  hasRulerStart: boolean;
  hasMoveAnchors: boolean;
  hasMovePreview: boolean;
};

function resolveHintText(params: TResolveHintTextParams): string | null {
  const {
    activeTool,
    arcPhase,
    dimensionPhase,
    hasDimensionDraft,
    hasRulerStart,
    hasMoveAnchors,
    hasMovePreview,
  } = params;

  if (activeTool === 'arc') {
    if (arcPhase === 'radius') {
      return 'Arc: move to set the radius, then click';
    }
    if (arcPhase === 'angle') {
      return 'Arc: move to set the sweep, then click to finish';
    }
    return 'Arc: click to set the center';
  }

  if (activeTool === 'dimension') {
    if (hasDimensionDraft) {
      return 'Dimension: drag to set direction and offset, release to finish';
    }
    if (dimensionPhase === 'second-point') {
      return 'Dimension: click the second point';
    }
    return 'Dimension: click the first point';
  }

  if (activeTool === 'ruler') {
    return hasRulerStart
      ? 'Ruler: click to set the end point — hold Shift to lock, or type a number + Enter'
      : 'Ruler: click to set the start point';
  }

  if (activeTool === 'move') {
    if (hasMovePreview) {
      return 'Move: click to place the shape';
    }
    if (hasMoveAnchors) {
      return 'Move: click an anchor point on the shape';
    }
    return 'Move: select a shape first';
  }

  return null;
}

export { resolveHintText };
