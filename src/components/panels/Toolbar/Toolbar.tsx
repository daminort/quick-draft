import { useState } from 'react';

import { Flex, IconButton } from '@radix-ui/themes';
import {
  MousePointer2,
  PencilLine,
  Square,
  Circle,
  LoaderCircle,
  Type,
  PanelLeftRightDashed,
  Ruler,
  RulerDimensionLine,
  Trash2,
  Settings,
  Layers,
  Printer,
} from 'lucide-react';

import { toolStore, toolSelectors, toolActions } from '~/stores/toolStore';
import type { TTool } from '~/stores/toolStore';
import { useDocumentStore } from '~/stores/useDocumentStore';
import { selectionActions } from '~/stores/selectionStore';
import { useUIStore } from '~/stores/useUIStore';

import { ConfirmDialog } from '~/components/ui/ConfirmDialog';
import { FileActions } from '~/components/panels/FileActions';

import s from './Toolbar.module.css';

const TOOLS: { tool: TTool; label: string; Icon: typeof MousePointer2 }[] = [
  { tool: 'select', label: 'Select', Icon: MousePointer2 },
  { tool: 'line', label: 'Line (L)', Icon: PencilLine },
  { tool: 'rect', label: 'Rectangle (R)', Icon: Square },
  { tool: 'circle', label: 'Circle (C)', Icon: Circle },
  { tool: 'arc', label: 'Arc (A)', Icon: LoaderCircle },
  { tool: 'text', label: 'Text (T)', Icon: Type },
  {
    tool: 'guide',
    label: 'Guide (G) — click: horizontal, Shift+click: vertical',
    Icon: PanelLeftRightDashed,
  },
  {
    tool: 'dimension',
    label: 'Dimension (D) — click two points, then drag to set direction and offset',
    Icon: RulerDimensionLine,
  },
  {
    tool: 'ruler',
    label:
      'Ruler (U) — click two points to measure; hold Shift to lock to horizontal/vertical; type a number + Enter to set an exact length',
    Icon: Ruler,
  },
];

export function Toolbar() {
  const activeTool = toolStore(toolSelectors.getActiveTool);
  const clearDocument = useDocumentStore(state => state.clear);
  const isSettingsOpen = useUIStore(state => state.isSettingsOpen);
  const toggleSettings = useUIStore(state => state.toggleSettings);
  const isLibraryOpen = useUIStore(state => state.isLibraryOpen);
  const toggleLibrary = useUIStore(state => state.toggleLibrary);
  const openPrint = useUIStore(state => state.openPrint);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

  const onClearConfirmed = () => {
    clearDocument();
    selectionActions.clear();
    setIsClearDialogOpen(false);
  };

  const libraryButtonClassName = isLibraryOpen ? s.active : undefined;
  const settingsButtonClassName = isSettingsOpen ? s.active : undefined;
  const onToolClick = (tool: TTool) => () => toolActions.setTool(tool);
  const onOpenClearDialog = () => setIsClearDialogOpen(true);
  const onCancelClear = () => setIsClearDialogOpen(false);

  return (
    <Flex direction="column" gap="4" p="3" className={s.toolbar}>
      {TOOLS.map(({ tool, label, Icon }) => {
        const buttonClassName = activeTool === tool ? s.active : undefined;
        return (
          <IconButton
            key={tool}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={activeTool === tool}
            onClick={onToolClick(tool)}
            variant="ghost"
            size="3"
            className={buttonClassName}
          >
            <Icon size={20} />
          </IconButton>
        );
      })}

      <Flex direction="column" gap="3" mt="auto">
        <IconButton
          type="button"
          title="Component library"
          aria-label="Component library"
          aria-pressed={isLibraryOpen}
          onClick={toggleLibrary}
          variant="ghost"
          size="3"
          className={libraryButtonClassName}
        >
          <Layers size={20} />
        </IconButton>

        <FileActions />

        <IconButton
          type="button"
          title="Print"
          aria-label="Print"
          onClick={openPrint}
          variant="ghost"
          size="3"
        >
          <Printer size={20} />
        </IconButton>

        <IconButton
          type="button"
          title="Settings"
          aria-label="Settings"
          aria-pressed={isSettingsOpen}
          onClick={toggleSettings}
          variant="ghost"
          size="3"
          className={settingsButtonClassName}
        >
          <Settings size={20} />
        </IconButton>

        <IconButton
          type="button"
          title="Clear canvas"
          aria-label="Clear canvas"
          onClick={onOpenClearDialog}
          variant="ghost"
          color="red"
          size="3"
        >
          <Trash2 size={20} />
        </IconButton>
      </Flex>

      <ConfirmDialog
        isOpen={isClearDialogOpen}
        title="Clear canvas"
        message="This will remove all shapes from the canvas."
        confirmLabel="Clear"
        onConfirm={onClearConfirmed}
        onCancel={onCancelClear}
      />
    </Flex>
  );
}
