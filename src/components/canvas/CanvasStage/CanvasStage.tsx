import type { DragEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

import { Stage, Layer, Line, Rect } from 'react-konva';
import { Box } from '@radix-ui/themes';
import {
  ArrowUpToLine,
  ArrowDownFromLine,
  FlipHorizontal2,
  FlipVertical2,
  RulerDimensionLine,
  Trash2,
} from 'lucide-react';

import type { TShapeId } from '~/types/document';

import { COMPONENT_DRAG_MIME_TYPE } from '~/constants/fileIO';
import {
  SNAP_INDICATOR_COLOR,
  SNAP_POINT_SIZE,
  MARQUEE_STROKE_COLOR,
  MARQUEE_FILL_COLOR,
} from '~/constants/canvas';
import { DIMENSION_LABEL_FONT_SIZE } from '~/constants/dimension';
import { SELECTED_COLOR } from '~/constants/shapes';

import { findDimensionResizeTarget } from '~/lib/dimensionBinding';
import { resizeShapeAlongAxis } from '~/lib/shapeTransform';
import { computeDimensionGeometry, convertLengthToInternal, formatLength } from '~/lib/dimension';

import { documentStore, documentSelectors, documentActions } from '~/stores/documentStore';
import { selectionStore, selectionSelectors, selectionActions } from '~/stores/selectionStore';
import { toolStore, toolSelectors, toolActions } from '~/stores/toolStore';
import type { TTool } from '~/stores/toolStore';
import { uiStore, uiSelectors, uiActions } from '~/stores/uiStore';

import { ShapeRenderer } from '~/components/canvas/shapes/ShapeRenderer';
import { TextEditOverlay } from '~/components/canvas/TextEditOverlay';
import { DimensionEditOverlay } from '~/components/canvas/DimensionEditOverlay';
import { SelectionTransformer } from '~/components/canvas/SelectionTransformer';
import { ZoomControl } from '~/components/canvas/ZoomControl';
import { ContextMenu } from '~/components/canvas/ContextMenu';
import { ConfirmDialog } from '~/components/ui/ConfirmDialog';
import { useDrawingTool } from '~/components/canvas/tools/useDrawingTool';
import { useRulerTool } from '~/components/canvas/tools/useRulerTool';
import { RulerOverlay } from '~/components/canvas/RulerOverlay';
import { CanvasRulers } from '~/components/canvas/RulerBar';
import { useSelectTool } from '~/components/canvas/tools/useSelectTool';
import { useCopyPasteTool } from '~/components/canvas/tools/useCopyPasteTool';
import { useCanvasZoom } from '~/components/canvas/tools/useCanvasZoom';
import { useCanvasPan } from '~/components/canvas/tools/useCanvasPan';

import s from './CanvasStage.module.css';

import type Konva from 'konva';

// Keyed by e.code (physical key position), not e.key, so the shortcut still matches when a
// non-Latin keyboard layout (e.g. Cyrillic) is active and e.key would report a different character.
const TOOL_HOTKEYS: Partial<Record<string, TTool>> = {
  KeyG: 'guide',
  KeyL: 'line',
  KeyR: 'rect',
  KeyC: 'circle',
  KeyA: 'arc',
  KeyT: 'text',
  KeyD: 'dimension',
  KeyU: 'ruler',
};

const CanvasStage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const staticLayerRef = useRef<Konva.Layer>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const shapes = documentStore(documentSelectors.getShapes);
  const components = documentStore(documentSelectors.getComponents);
  const selectedIds = selectionStore(selectionSelectors.getSelectedIds);
  const activeTool = toolStore(toolSelectors.getActiveTool);
  const areGuidesVisible = uiStore(uiSelectors.getAreGuidesVisible);
  const areDimensionsVisible = uiStore(uiSelectors.getAreDimensionsVisible);
  const isRulerVisible = uiStore(uiSelectors.getIsRulerVisible);
  const areRulerGuidesVisible = uiStore(uiSelectors.getAreRulerGuidesVisible);
  const documentScale = documentStore(documentSelectors.getScale);
  const documentUnits = documentStore(documentSelectors.getUnits);
  const shouldShowDimensionUnit = uiStore(uiSelectors.getShouldShowDimensionUnit);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    shapeId: TShapeId;
  } | null>(null);
  const [emptyContextMenu, setEmptyContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isDeleteGuidesDialogOpen, setIsDeleteGuidesDialogOpen] = useState(false);
  const [editingTextId, setEditingTextId] = useState<TShapeId | null>(null);
  const originalTextRef = useRef<string | null>(null);
  const [editingDimensionId, setEditingDimensionId] = useState<TShapeId | null>(null);

  const drawingTool = useDrawingTool();
  const rulerTool = useRulerTool();
  const selectTool = useSelectTool();
  const copyPasteTool = useCopyPasteTool();
  const zoom = useCanvasZoom(size);
  const pan = useCanvasPan();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) {
        return;
      }
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tool = TOOL_HOTKEYS[e.code];
      if (!tool) {
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) {
        return;
      }
      toolActions.setTool(tool);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') {
        return;
      }
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) {
        return;
      }
      if (selectedIds.length === 0) {
        return;
      }
      e.preventDefault();
      selectedIds.forEach(id => documentActions.removeShape(id));
      selectionActions.clear();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedIds]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'KeyZ') {
        return;
      }
      if (!(e.ctrlKey || e.metaKey) || e.shiftKey || e.altKey) {
        return;
      }
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) {
        return;
      }
      e.preventDefault();
      documentStore.temporal.getState().undo();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') {
        return;
      }
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) {
        return;
      }
      toolActions.setTool('select');
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const visibleShapes = shapes.filter(
    shape =>
      (areGuidesVisible || shape.type !== 'guide') &&
      (areDimensionsVisible || shape.type !== 'dimension'),
  );

  useEffect(() => {
    const layer = staticLayerRef.current;
    if (!layer) {
      return;
    }
    layer.clearCache();
    layer.cache();
    layer.batchDraw();
  }, [visibleShapes, selectedIds]);

  const isInteractive = activeTool === 'select';
  const selectedShape =
    selectedIds.length === 1 ? (shapes.find(shape => shape.id === selectedIds[0]) ?? null) : null;
  const selectedNode = selectedShape ? selectTool.getNode(selectedShape.id) : null;
  const editingShape = shapes.find(shape => shape.id === editingTextId);
  const editingDimensionShape = shapes.find(shape => shape.id === editingDimensionId);
  const editingDimensionGeometry =
    editingDimensionShape && editingDimensionShape.type === 'dimension'
      ? computeDimensionGeometry(
          editingDimensionShape.x1,
          editingDimensionShape.y1,
          editingDimensionShape.x2,
          editingDimensionShape.y2,
          editingDimensionShape.axis,
          editingDimensionShape.offset,
          documentScale,
          documentUnits,
          editingDimensionShape.unit,
          shouldShowDimensionUnit,
          shapes,
        )
      : null;

  const snapIndicator =
    drawingTool.snapIndicator.x !== null || drawingTool.snapIndicator.y !== null
      ? drawingTool.snapIndicator
      : selectTool.snapIndicator;

  const viewBounds = {
    left: -zoom.x / zoom.scale,
    top: -zoom.y / zoom.scale,
    right: (size.width - zoom.x) / zoom.scale,
    bottom: (size.height - zoom.y) / zoom.scale,
  };

  const rulerCursor = areRulerGuidesVisible ? cursorPos : null;

  const startEditText = (id: TShapeId) => {
    const shape = shapes.find(s => s.id === id);
    if (!shape || shape.type !== 'text') {
      return;
    }
    selectionActions.select([id]);
    originalTextRef.current = shape.text;
    documentStore.temporal.getState().pause();
    setEditingTextId(id);
  };

  const commitEditText = () => {
    documentStore.temporal.getState().resume();
    originalTextRef.current = null;
    setEditingTextId(null);
  };

  const cancelEditText = () => {
    if (editingTextId !== null && originalTextRef.current !== null) {
      documentActions.updateShape(editingTextId, { text: originalTextRef.current });
    }
    documentStore.temporal.getState().resume();
    originalTextRef.current = null;
    setEditingTextId(null);
  };

  const startEditDimension = (id: TShapeId) => {
    const shape = shapes.find(s => s.id === id);
    if (!shape || shape.type !== 'dimension') {
      return;
    }
    if (!findDimensionResizeTarget(shape, shapes)) {
      return;
    }
    selectionActions.select([id]);
    setEditingDimensionId(id);
  };

  const commitEditDimension = (rawValue: string) => {
    const shape = editingDimensionShape;
    setEditingDimensionId(null);
    if (!shape || shape.type !== 'dimension') {
      return;
    }
    const target = findDimensionResizeTarget(shape, shapes);
    if (!target) {
      return;
    }
    const enteredLength = Number(rawValue.replace(',', '.'));
    if (!Number.isFinite(enteredLength) || enteredLength <= 0) {
      return;
    }
    const currentInternal =
      shape.axis === 'vertical' ? Math.abs(shape.y2 - shape.y1) : Math.abs(shape.x2 - shape.x1);
    const newInternal = convertLengthToInternal(
      enteredLength,
      documentScale,
      documentUnits,
      shape.unit,
    );
    const delta = newInternal - currentInternal;
    if (delta === 0) {
      return;
    }
    documentActions.updateShape(target.id, resizeShapeAlongAxis(target, shape, delta));
  };

  const cancelEditDimension = () => {
    setEditingDimensionId(null);
  };

  const onComponentDrop = (e: DragEvent<HTMLDivElement>) => {
    const componentId = e.dataTransfer.getData(COMPONENT_DRAG_MIME_TYPE);
    if (!componentId || !components[componentId]) {
      return;
    }
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    const x = (e.clientX - rect.left - zoom.x) / zoom.scale;
    const y = (e.clientY - rect.top - zoom.y) / zoom.scale;
    const instanceId = documentActions.addComponentInstance(componentId, x, y);
    // Deferred: the instance's Konva node registers on mount, one render after this one — selecting
    // it a tick later (instead of in the same batch) lets the Transformer find it immediately.
    setTimeout(() => selectionActions.select([instanceId]), 0);
  };

  const onContextMenu = (e: Konva.KonvaEventObject<PointerEvent>) => {
    e.evt.preventDefault();
    if (!isInteractive) {
      return;
    }
    const stage = e.target.getStage();
    if (!stage) {
      return;
    }
    if (e.target === stage) {
      setContextMenu(null);
      setEmptyContextMenu({ x: e.evt.clientX, y: e.evt.clientY });
      return;
    }
    const shapeId = e.target.id();
    if (!shapeId) {
      return;
    }
    selectionActions.select([shapeId]);
    setEmptyContextMenu(null);
    setContextMenu({ x: e.evt.clientX, y: e.evt.clientY, shapeId });
  };

  const onComponentDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (!e.dataTransfer.types.includes(COMPONENT_DRAG_MIME_TYPE)) {
      return;
    }
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const onStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (pan.onMouseDown(e)) {
      return;
    }
    selectTool.onStageMouseDown(e);
    drawingTool.onMouseDown(e);
    rulerTool.onMouseDown(e);
  };

  const onStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    drawingTool.onMouseMove(e);
    rulerTool.onMouseMove(e);
    copyPasteTool.onMouseMove(e);
    if (isRulerVisible && areRulerGuidesVisible) {
      setCursorPos(e.target.getStage()?.getPointerPosition() ?? null);
    }
  };

  const onStageMouseLeave = () => {
    setCursorPos(null);
  };

  const onEditingTextChange = (text: string) => {
    if (!editingShape) {
      return;
    }
    documentActions.updateShape(editingShape.id, { text });
  };

  const onContextMenuClose = () => {
    setContextMenu(null);
  };

  const onEmptyContextMenuClose = () => {
    setEmptyContextMenu(null);
  };

  const onBringToFrontClick = () => {
    if (!contextMenu) {
      return;
    }
    documentActions.bringToFront(contextMenu.shapeId);
  };

  const onSendToBackClick = () => {
    if (!contextMenu) {
      return;
    }
    documentActions.sendToBack(contextMenu.shapeId);
  };

  const onFlipHorizontalClick = () => {
    if (!contextMenu) {
      return;
    }
    documentActions.flipHorizontal(contextMenu.shapeId);
  };

  const onFlipVerticalClick = () => {
    if (!contextMenu) {
      return;
    }
    documentActions.flipVertical(contextMenu.shapeId);
  };

  const onOpenDeleteGuidesDialog = () => {
    setIsDeleteGuidesDialogOpen(true);
  };

  const onConfirmDeleteGuides = () => {
    documentActions.clearGuides();
    setIsDeleteGuidesDialogOpen(false);
  };

  const onCancelDeleteGuides = () => {
    setIsDeleteGuidesDialogOpen(false);
  };

  const contextMenuShape = contextMenu
    ? shapes.find(shape => shape.id === contextMenu.shapeId)
    : undefined;
  const canFlip =
    contextMenuShape?.type === 'line' ||
    contextMenuShape?.type === 'arc' ||
    contextMenuShape?.type === 'component-instance';

  const contextMenuItems = [
    { label: 'Bring to Front', icon: <ArrowUpToLine size={14} />, onClick: onBringToFrontClick },
    { label: 'Send to Back', icon: <ArrowDownFromLine size={14} />, onClick: onSendToBackClick },
    ...(canFlip
      ? [
          {
            label: 'Flip Horizontal',
            icon: <FlipHorizontal2 size={14} />,
            onClick: onFlipHorizontalClick,
          },
          {
            label: 'Flip Vertical',
            icon: <FlipVertical2 size={14} />,
            onClick: onFlipVerticalClick,
          },
        ]
      : []),
  ];

  const emptyContextMenuItems = [
    {
      label: 'Toggle dimensions',
      icon: <RulerDimensionLine size={14} />,
      onClick: uiActions.toggleDimensionsVisible,
    },
    { label: 'Delete guides', icon: <Trash2 size={14} />, onClick: onOpenDeleteGuidesDialog },
  ];

  const containerClassName = pan.isPanning ? s.panning : undefined;

  return (
    <Box
      ref={containerRef}
      onDrop={onComponentDrop}
      onDragOver={onComponentDragOver}
      width="100%"
      height="100%"
      position="relative"
      className={containerClassName}
    >
      <Stage
        width={size.width}
        height={size.height}
        scaleX={zoom.scale}
        scaleY={zoom.scale}
        x={zoom.x}
        y={zoom.y}
        onWheel={zoom.onWheel}
        onMouseDown={onStageMouseDown}
        onMouseMove={onStageMouseMove}
        onMouseLeave={onStageMouseLeave}
        onMouseUp={drawingTool.onMouseUp}
        onContextMenu={onContextMenu}
      >
        <Layer ref={staticLayerRef}>
          {visibleShapes.map(shape => (
            <ShapeRenderer
              key={shape.id}
              shape={shape}
              isInteractive={isInteractive}
              interaction={selectTool}
              viewBounds={viewBounds}
              isSelected={selectedIds.includes(shape.id)}
              editingTextId={editingTextId}
              onStartEditText={startEditText}
              editingDimensionId={editingDimensionId}
              onStartEditDimension={startEditDimension}
            />
          ))}
        </Layer>
        <Layer>
          {drawingTool.draftShape && (
            <ShapeRenderer
              shape={drawingTool.draftShape}
              isInteractive={false}
              interaction={selectTool}
              viewBounds={viewBounds}
            />
          )}
          <SelectionTransformer shape={selectedShape} node={selectedNode} />
          {rulerTool.draftRuler && <RulerOverlay ruler={rulerTool.draftRuler} scale={zoom.scale} />}
          {snapIndicator.x !== null && (
            <Line
              points={[snapIndicator.x, viewBounds.top, snapIndicator.x, viewBounds.bottom]}
              stroke={SNAP_INDICATOR_COLOR}
              strokeWidth={1 / zoom.scale}
              dash={[4 / zoom.scale, 4 / zoom.scale]}
              listening={false}
            />
          )}
          {snapIndicator.y !== null && (
            <Line
              points={[viewBounds.left, snapIndicator.y, viewBounds.right, snapIndicator.y]}
              stroke={SNAP_INDICATOR_COLOR}
              strokeWidth={1 / zoom.scale}
              dash={[4 / zoom.scale, 4 / zoom.scale]}
              listening={false}
            />
          )}
          {snapIndicator.x !== null && snapIndicator.y !== null && (
            <Rect
              x={snapIndicator.x}
              y={snapIndicator.y}
              width={SNAP_POINT_SIZE / zoom.scale}
              height={SNAP_POINT_SIZE / zoom.scale}
              offsetX={SNAP_POINT_SIZE / zoom.scale / 2}
              offsetY={SNAP_POINT_SIZE / zoom.scale / 2}
              stroke={SNAP_INDICATOR_COLOR}
              strokeWidth={1 / zoom.scale}
              listening={false}
            />
          )}
          {selectTool.marqueeRect && (
            <Rect
              x={selectTool.marqueeRect.x}
              y={selectTool.marqueeRect.y}
              width={selectTool.marqueeRect.width}
              height={selectTool.marqueeRect.height}
              stroke={MARQUEE_STROKE_COLOR}
              strokeWidth={1 / zoom.scale}
              fill={MARQUEE_FILL_COLOR}
              listening={false}
            />
          )}
        </Layer>
      </Stage>
      {editingShape && editingShape.type === 'text' && (
        <TextEditOverlay
          shape={editingShape}
          scale={zoom.scale}
          offsetX={zoom.x}
          offsetY={zoom.y}
          onChange={onEditingTextChange}
          onCommit={commitEditText}
          onCancel={cancelEditText}
        />
      )}
      {editingDimensionShape &&
        editingDimensionShape.type === 'dimension' &&
        editingDimensionGeometry && (
          <DimensionEditOverlay
            initialValue={formatLength(editingDimensionGeometry.length)}
            x={editingDimensionGeometry.label.x}
            y={editingDimensionGeometry.label.y}
            align={editingDimensionGeometry.label.align}
            baseline={editingDimensionGeometry.label.baseline}
            scale={zoom.scale}
            offsetX={zoom.x}
            offsetY={zoom.y}
            fontSize={DIMENSION_LABEL_FONT_SIZE}
            color={SELECTED_COLOR}
            onCommit={commitEditDimension}
            onCancel={cancelEditDimension}
          />
        )}
      {isRulerVisible && (
        <CanvasRulers
          width={size.width}
          height={size.height}
          scale={zoom.scale}
          offsetX={zoom.x}
          offsetY={zoom.y}
          documentScale={documentScale}
          documentUnits={documentUnits}
          cursor={rulerCursor}
        />
      )}
      <ZoomControl
        scale={zoom.scale}
        onZoomIn={zoom.zoomIn}
        onZoomOut={zoom.zoomOut}
        onReset={zoom.resetZoom}
      />
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenuItems}
          onClose={onContextMenuClose}
        />
      )}
      {emptyContextMenu && (
        <ContextMenu
          x={emptyContextMenu.x}
          y={emptyContextMenu.y}
          items={emptyContextMenuItems}
          onClose={onEmptyContextMenuClose}
        />
      )}
      <ConfirmDialog
        isOpen={isDeleteGuidesDialogOpen}
        title="Delete all guides"
        message="This will remove every guide from the canvas."
        confirmLabel="Delete"
        onConfirm={onConfirmDeleteGuides}
        onCancel={onCancelDeleteGuides}
      />
    </Box>
  );
};

export { CanvasStage };
