import { useEffect, useRef, useState } from 'react';

import { Stage, Layer, Line, Rect } from 'react-konva';
import { Box } from '@radix-ui/themes';
import { ArrowUpToLine, ArrowDownFromLine, RulerDimensionLine, Trash2 } from 'lucide-react';

import type { TShapeId } from '~/types/document';

import { COMPONENT_DRAG_MIME_TYPE } from '~/constants/fileIO';
import {
  SNAP_INDICATOR_COLOR,
  SNAP_POINT_SIZE,
  MARQUEE_STROKE_COLOR,
  MARQUEE_FILL_COLOR,
} from '~/constants/canvas';

import { useDocumentStore } from '~/stores/useDocumentStore';
import { selectionStore, selectionSelectors, selectionActions } from '~/stores/selectionStore';
import { toolStore, toolSelectors, toolActions } from '~/stores/toolStore';
import type { TTool } from '~/stores/toolStore';
import { useUIStore } from '~/stores/useUIStore';

import { ShapeRenderer } from '~/components/canvas/shapes/ShapeRenderer';
import { TextEditOverlay } from '~/components/canvas/TextEditOverlay';
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

export function CanvasStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const staticLayerRef = useRef<Konva.Layer>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const shapes = useDocumentStore(state => state.document.shapes);
  const components = useDocumentStore(state => state.document.components);
  const updateShape = useDocumentStore(state => state.updateShape);
  const removeShape = useDocumentStore(state => state.removeShape);
  const bringToFront = useDocumentStore(state => state.bringToFront);
  const sendToBack = useDocumentStore(state => state.sendToBack);
  const addComponentInstance = useDocumentStore(state => state.addComponentInstance);
  const clearGuides = useDocumentStore(state => state.clearGuides);
  const selectedIds = selectionStore(selectionSelectors.getSelectedIds);
  const activeTool = toolStore(toolSelectors.getActiveTool);
  const areGuidesVisible = useUIStore(state => state.areGuidesVisible);
  const areDimensionsVisible = useUIStore(state => state.areDimensionsVisible);
  const toggleDimensionsVisible = useUIStore(state => state.toggleDimensionsVisible);
  const isRulerVisible = useUIStore(state => state.isRulerVisible);
  const areRulerGuidesVisible = useUIStore(state => state.areRulerGuidesVisible);
  const documentScale = useDocumentStore(state => state.document.scale);
  const documentUnits = useDocumentStore(state => state.document.units);
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
    function onKeyDown(e: KeyboardEvent) {
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
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
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
      selectedIds.forEach(id => removeShape(id));
      selectionActions.clear();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedIds, removeShape]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
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
      useDocumentStore.temporal.getState().undo();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') {
        return;
      }
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) {
        return;
      }
      toolActions.setTool('select');
    }

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

  function startEditText(id: TShapeId) {
    const shape = shapes.find(s => s.id === id);
    if (!shape || shape.type !== 'text') {
      return;
    }
    selectionActions.select([id]);
    originalTextRef.current = shape.text;
    useDocumentStore.temporal.getState().pause();
    setEditingTextId(id);
  }

  function commitEditText() {
    useDocumentStore.temporal.getState().resume();
    originalTextRef.current = null;
    setEditingTextId(null);
  }

  function cancelEditText() {
    if (editingTextId !== null && originalTextRef.current !== null) {
      updateShape(editingTextId, { text: originalTextRef.current });
    }
    useDocumentStore.temporal.getState().resume();
    originalTextRef.current = null;
    setEditingTextId(null);
  }

  function onComponentDrop(e: React.DragEvent<HTMLDivElement>) {
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
    const instanceId = addComponentInstance(componentId, x, y);
    // Deferred: the instance's Konva node registers on mount, one render after this one — selecting
    // it a tick later (instead of in the same batch) lets the Transformer find it immediately.
    setTimeout(() => selectionActions.select([instanceId]), 0);
  }

  function onContextMenu(e: Konva.KonvaEventObject<PointerEvent>) {
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
  }

  function onComponentDragOver(e: React.DragEvent<HTMLDivElement>) {
    if (!e.dataTransfer.types.includes(COMPONENT_DRAG_MIME_TYPE)) {
      return;
    }
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }

  function onStageMouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
    if (pan.onMouseDown(e)) {
      return;
    }
    selectTool.onStageMouseDown(e);
    drawingTool.onMouseDown(e);
    rulerTool.onMouseDown(e);
  }

  function onStageMouseMove(e: Konva.KonvaEventObject<MouseEvent>) {
    drawingTool.onMouseMove(e);
    rulerTool.onMouseMove(e);
    copyPasteTool.onMouseMove(e);
    if (isRulerVisible && areRulerGuidesVisible) {
      setCursorPos(e.target.getStage()?.getPointerPosition() ?? null);
    }
  }

  function onStageMouseLeave() {
    setCursorPos(null);
  }

  function onEditingTextChange(text: string) {
    if (!editingShape) {
      return;
    }
    updateShape(editingShape.id, { text });
  }

  function onContextMenuClose() {
    setContextMenu(null);
  }

  function onEmptyContextMenuClose() {
    setEmptyContextMenu(null);
  }

  function onBringToFrontClick() {
    if (!contextMenu) {
      return;
    }
    bringToFront(contextMenu.shapeId);
  }

  function onSendToBackClick() {
    if (!contextMenu) {
      return;
    }
    sendToBack(contextMenu.shapeId);
  }

  function onOpenDeleteGuidesDialog() {
    setIsDeleteGuidesDialogOpen(true);
  }

  function onConfirmDeleteGuides() {
    clearGuides();
    setIsDeleteGuidesDialogOpen(false);
  }

  function onCancelDeleteGuides() {
    setIsDeleteGuidesDialogOpen(false);
  }

  const contextMenuItems = [
    { label: 'Bring to Front', icon: <ArrowUpToLine size={14} />, onClick: onBringToFrontClick },
    { label: 'Send to Back', icon: <ArrowDownFromLine size={14} />, onClick: onSendToBackClick },
  ];

  const emptyContextMenuItems = [
    {
      label: 'Toggle dimensions',
      icon: <RulerDimensionLine size={14} />,
      onClick: toggleDimensionsVisible,
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
}
