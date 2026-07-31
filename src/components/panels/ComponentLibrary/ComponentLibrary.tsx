import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';

import { Stage, Layer, Group } from 'react-konva';
import { Flex, Text, Button, IconButton } from '@radix-ui/themes';
import { Trash2, Download, Upload } from 'lucide-react';

import type { TComponentDef } from '~/types/document';

import { COMPONENT_DRAG_MIME_TYPE } from '~/constants/fileIO';
import {
  COMPONENT_PREVIEW_SIZE as PREVIEW_SIZE,
  COMPONENT_PREVIEW_PADDING as PREVIEW_PADDING,
  LARGE_VIEW_BOUNDS as PREVIEW_VIEW_BOUNDS,
} from '~/constants/componentLibrary';

import { getUnionBounds } from '~/lib/bounds';
import {
  exportComponentLibraryToJsonFile,
  importComponentLibraryFromJsonFile,
} from '~/lib/persistence/fileIO';

import { documentStore, documentSelectors, documentActions } from '~/stores/documentStore';
import { selectionStore, selectionActions } from '~/stores/selectionStore';

import { ShapeRenderer } from '~/components/canvas/shapes/ShapeRenderer';
import { noopShapeInteraction } from '~/components/canvas/shapes/ShapeInteraction';
import { ConfirmDialog } from '~/components/ui/ConfirmDialog';

import s from './ComponentLibrary.module.css';

type TComponentPreviewProps = {
  componentDef: TComponentDef;
  components: Record<string, TComponentDef>;
};

function ComponentPreview({ componentDef, components }: TComponentPreviewProps) {
  const bounds = getUnionBounds(componentDef.shapes, components);
  const width = bounds ? Math.max(1, bounds.x2 - bounds.x1) : 1;
  const height = bounds ? Math.max(1, bounds.y2 - bounds.y1) : 1;
  const innerSize = PREVIEW_SIZE - PREVIEW_PADDING * 2;
  const scale = bounds ? Math.min(innerSize / width, innerSize / height) : 1;
  const offsetX = bounds
    ? PREVIEW_PADDING + (innerSize - width * scale) / 2 - bounds.x1 * scale
    : 0;
  const offsetY = bounds
    ? PREVIEW_PADDING + (innerSize - height * scale) / 2 - bounds.y1 * scale
    : 0;

  return (
    <Stage width={PREVIEW_SIZE} height={PREVIEW_SIZE} listening={false}>
      <Layer>
        <Group x={offsetX} y={offsetY} scaleX={scale} scaleY={scale}>
          {componentDef.shapes.map(shape => (
            <ShapeRenderer
              key={shape.id}
              shape={shape}
              isInteractive={false}
              interaction={noopShapeInteraction}
              viewBounds={PREVIEW_VIEW_BOUNDS}
            />
          ))}
        </Group>
      </Layer>
    </Stage>
  );
}

function ComponentLibrary() {
  const components = documentStore(documentSelectors.getComponents);
  const entries = Object.values(components);
  const [deleteTarget, setDeleteTarget] = useState<TComponentDef | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const onDeleteConfirmed = () => {
    if (!deleteTarget) {
      return;
    }
    const replacedBy = documentActions.removeComponent(deleteTarget.id);
    // Swap any selected instance of the deleted component for the freestanding shapes it became.
    const selectedIds = selectionStore.getState().selectedIds;
    const nextSelection = selectedIds.flatMap(id => replacedBy[id] ?? [id]);
    selectionActions.select(nextSelection);
    setDeleteTarget(null);
  };

  const onImportLibrary = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) {
      return;
    }
    try {
      const defs = await importComponentLibraryFromJsonFile(file);
      documentActions.importComponents(defs);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Failed to import the library.');
    }
  };

  const isExportDisabled = entries.length === 0;
  const deleteMessage = deleteTarget
    ? `This will remove "${deleteTarget.name}" from the library. Existing instances on the canvas will become independent, ungrouped shapes.`
    : '';

  function onExportClick() {
    exportComponentLibraryToJsonFile(components);
  }

  function onImportClick() {
    importInputRef.current?.click();
  }

  function onCancelDelete() {
    setDeleteTarget(null);
  }

  const onEntryDragStart = (componentDef: TComponentDef) => (e: DragEvent) => {
    e.dataTransfer.setData(COMPONENT_DRAG_MIME_TYPE, componentDef.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const onDeleteClick = (componentDef: TComponentDef) => () => setDeleteTarget(componentDef);

  return (
    <Flex direction="column" gap="4" width="220px" p="3" className={s.library}>
      <Text as="div" size="2" weight="bold">
        Component library
      </Text>

      <Flex gap="2">
        <Button
          type="button"
          onClick={onExportClick}
          disabled={isExportDisabled}
          variant="outline"
          size="1"
          className={s.libraryButton}
        >
          <Download size={16} />
          Export
        </Button>
        <Button
          type="button"
          onClick={onImportClick}
          variant="outline"
          size="1"
          className={s.libraryButton}
        >
          <Upload size={16} />
          Import
        </Button>
        <input
          ref={importInputRef}
          type="file"
          accept=".json,application/json"
          onChange={onImportLibrary}
          className={s.hiddenInput}
        />
      </Flex>

      {entries.length === 0 && (
        <Text as="p" size="1" color="gray">
          Select two or more shapes and group them into a component to see it here.
        </Text>
      )}
      <Flex direction="column" gap="2">
        {entries.map(componentDef => {
          const dragTitle = `Drag onto the canvas to insert an instance of "${componentDef.name}"`;
          const deleteTitle = `Delete "${componentDef.name}" from the library`;

          return (
            <Flex
              key={componentDef.id}
              title={dragTitle}
              draggable
              onDragStart={onEntryDragStart(componentDef)}
              align="center"
              gap="2"
              p="1"
              className={s.entry}
            >
              <ComponentPreview componentDef={componentDef} components={components} />
              <Text size="2" className={s.entryName}>
                {componentDef.name}
              </Text>
              <IconButton
                type="button"
                title={deleteTitle}
                aria-label={deleteTitle}
                onClick={onDeleteClick(componentDef)}
                variant="ghost"
                color="red"
                size="1"
              >
                <Trash2 size={16} />
              </IconButton>
            </Flex>
          );
        })}
      </Flex>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Delete component"
        message={deleteMessage}
        confirmLabel="Delete"
        onConfirm={onDeleteConfirmed}
        onCancel={onCancelDelete}
      />
    </Flex>
  );
}

export { ComponentLibrary };
