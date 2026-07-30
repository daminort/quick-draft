import { useState, type ChangeEvent } from 'react';

import { Box, Flex, Text, TextField, Checkbox, Button } from '@radix-ui/themes';

import { uiStore, uiSelectors, uiActions } from '~/stores/uiStore';
import { useDocumentStore } from '~/stores/useDocumentStore';

import { UnitsControl } from '~/components/panels/UnitsControl';
import { ConfirmDialog } from '~/components/ui/ConfirmDialog';

import s from './SettingsPanel.module.css';

export function SettingsPanel() {
  const areGuidesVisible = uiStore(uiSelectors.getAreGuidesVisible);
  const snapTolerance = uiStore(uiSelectors.getSnapTolerance);
  const shouldShowDimensionUnit = uiStore(uiSelectors.getShouldShowDimensionUnit);
  const areDimensionsVisible = uiStore(uiSelectors.getAreDimensionsVisible);
  const dimensionColor = uiStore(uiSelectors.getDimensionColor);
  const isRulerVisible = uiStore(uiSelectors.getIsRulerVisible);
  const areRulerGuidesVisible = uiStore(uiSelectors.getAreRulerGuidesVisible);
  const clearGuides = useDocumentStore(state => state.clearGuides);
  const [isDeleteGuidesDialogOpen, setIsDeleteGuidesDialogOpen] = useState(false);

  const onDeleteGuidesConfirmed = () => {
    clearGuides();
    setIsDeleteGuidesDialogOpen(false);
  };

  function onOpenDeleteGuidesDialog() {
    setIsDeleteGuidesDialogOpen(true);
  }

  function onCancelDeleteGuides() {
    setIsDeleteGuidesDialogOpen(false);
  }

  function onSnapToleranceChange(e: ChangeEvent<HTMLInputElement>) {
    const value = Number(e.target.value);
    if (Number.isFinite(value)) {
      uiActions.setSnapTolerance(value);
    }
  }

  function onDimensionColorChange(e: ChangeEvent<HTMLInputElement>) {
    uiActions.setDimensionColor(e.target.value);
  }

  return (
    <Flex direction="column" gap="4" width="220px" p="3" className={s.panel}>
      <Text as="div" size="2" weight="bold">
        Settings
      </Text>
      <UnitsControl />

      <Flex direction="column" gap="2">
        <Text as="div" size="2" weight="bold">
          Guides
        </Text>
        <Text as="label" size="2">
          <Flex align="center" gap="2">
            <Checkbox checked={areGuidesVisible} onCheckedChange={uiActions.toggleGuidesVisible} />
            Show guides
          </Flex>
        </Text>
        <Button type="button" onClick={onOpenDeleteGuidesDialog} variant="soft" color="gray">
          Delete all guides
        </Button>
      </Flex>

      <Flex direction="column" gap="2">
        <Text as="div" size="2" weight="bold">
          Snapping
        </Text>
        <Text as="label" size="2">
          <Flex direction="column" gap="1">
            Snap tolerance (px)
            <TextField.Root
              type="number"
              min={0}
              value={snapTolerance}
              onChange={onSnapToleranceChange}
            />
          </Flex>
        </Text>
      </Flex>

      <Flex direction="column" gap="2">
        <Text as="div" size="2" weight="bold">
          Dimensions
        </Text>
        <Text as="label" size="2">
          <Flex align="center" gap="2">
            <Checkbox
              checked={areDimensionsVisible}
              onCheckedChange={uiActions.toggleDimensionsVisible}
            />
            Show dimensions
          </Flex>
        </Text>
        <Text as="label" size="2">
          <Flex align="center" gap="2">
            <Checkbox
              checked={shouldShowDimensionUnit}
              onCheckedChange={uiActions.toggleShowDimensionUnit}
            />
            Show unit
          </Flex>
        </Text>
        <Text as="label" size="2">
          <Flex direction="column" gap="1">
            Color
            <Box>
              <input type="color" value={dimensionColor} onChange={onDimensionColorChange} />
            </Box>
          </Flex>
        </Text>
      </Flex>

      <Flex direction="column" gap="2">
        <Text as="div" size="2" weight="bold">
          Ruler
        </Text>
        <Text as="label" size="2">
          <Flex align="center" gap="2">
            <Checkbox checked={isRulerVisible} onCheckedChange={uiActions.toggleRulerVisible} />
            Show ruler
          </Flex>
        </Text>
        <Text as="label" size="2">
          <Flex align="center" gap="2">
            <Checkbox
              checked={areRulerGuidesVisible}
              onCheckedChange={uiActions.toggleRulerGuidesVisible}
            />
            Show cursor guides
          </Flex>
        </Text>
      </Flex>

      <ConfirmDialog
        isOpen={isDeleteGuidesDialogOpen}
        title="Delete all guides"
        message="This will remove every guide from the canvas."
        confirmLabel="Delete"
        onConfirm={onDeleteGuidesConfirmed}
        onCancel={onCancelDeleteGuides}
      />
    </Flex>
  );
}
