import { useState, type ChangeEvent } from 'react';

import { Box, Flex, Text, TextField, Checkbox, Button } from '@radix-ui/themes';

import { useUIStore } from '~/stores/useUIStore';
import { useDocumentStore } from '~/stores/useDocumentStore';

import { UnitsControl } from '~/components/panels/UnitsControl';
import { ConfirmDialog } from '~/components/ui/ConfirmDialog';

export function SettingsPanel() {
  const areGuidesVisible = useUIStore(state => state.areGuidesVisible);
  const toggleGuidesVisible = useUIStore(state => state.toggleGuidesVisible);
  const snapTolerance = useUIStore(state => state.snapTolerance);
  const setSnapTolerance = useUIStore(state => state.setSnapTolerance);
  const shouldShowDimensionUnit = useUIStore(state => state.shouldShowDimensionUnit);
  const toggleShowDimensionUnit = useUIStore(state => state.toggleShowDimensionUnit);
  const areDimensionsVisible = useUIStore(state => state.areDimensionsVisible);
  const toggleDimensionsVisible = useUIStore(state => state.toggleDimensionsVisible);
  const dimensionColor = useUIStore(state => state.dimensionColor);
  const setDimensionColor = useUIStore(state => state.setDimensionColor);
  const isRulerVisible = useUIStore(state => state.isRulerVisible);
  const toggleRulerVisible = useUIStore(state => state.toggleRulerVisible);
  const areRulerGuidesVisible = useUIStore(state => state.areRulerGuidesVisible);
  const toggleRulerGuidesVisible = useUIStore(state => state.toggleRulerGuidesVisible);
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
      setSnapTolerance(value);
    }
  }

  function onDimensionColorChange(e: ChangeEvent<HTMLInputElement>) {
    setDimensionColor(e.target.value);
  }

  return (
    <Flex
      direction="column"
      gap="4"
      width="220px"
      p="3"
      style={{ borderLeft: '1px solid var(--gray-a5)' }}
    >
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
            <Checkbox checked={areGuidesVisible} onCheckedChange={toggleGuidesVisible} />
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
            <Checkbox checked={areDimensionsVisible} onCheckedChange={toggleDimensionsVisible} />
            Show dimensions
          </Flex>
        </Text>
        <Text as="label" size="2">
          <Flex align="center" gap="2">
            <Checkbox checked={shouldShowDimensionUnit} onCheckedChange={toggleShowDimensionUnit} />
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
            <Checkbox checked={isRulerVisible} onCheckedChange={toggleRulerVisible} />
            Show ruler
          </Flex>
        </Text>
        <Text as="label" size="2">
          <Flex align="center" gap="2">
            <Checkbox checked={areRulerGuidesVisible} onCheckedChange={toggleRulerGuidesVisible} />
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
