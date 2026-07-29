import { useState } from 'react';

import { Box, Flex, Text, TextField, Checkbox, Button } from '@radix-ui/themes';

import { useUIStore } from '~/stores/useUIStore';
import { useDocumentStore } from '~/stores/useDocumentStore';

import { UnitsControl } from '~/components/panels/UnitsControl';
import { ConfirmDialog } from '~/components/ui/ConfirmDialog';

export function SettingsPanel() {
  const guidesVisible = useUIStore(state => state.guidesVisible);
  const toggleGuidesVisible = useUIStore(state => state.toggleGuidesVisible);
  const snapTolerance = useUIStore(state => state.snapTolerance);
  const setSnapTolerance = useUIStore(state => state.setSnapTolerance);
  const showDimensionUnit = useUIStore(state => state.showDimensionUnit);
  const toggleShowDimensionUnit = useUIStore(state => state.toggleShowDimensionUnit);
  const dimensionsVisible = useUIStore(state => state.dimensionsVisible);
  const toggleDimensionsVisible = useUIStore(state => state.toggleDimensionsVisible);
  const dimensionColor = useUIStore(state => state.dimensionColor);
  const setDimensionColor = useUIStore(state => state.setDimensionColor);
  const rulerVisible = useUIStore(state => state.rulerVisible);
  const toggleRulerVisible = useUIStore(state => state.toggleRulerVisible);
  const rulerGuidesVisible = useUIStore(state => state.rulerGuidesVisible);
  const toggleRulerGuidesVisible = useUIStore(state => state.toggleRulerGuidesVisible);
  const clearGuides = useDocumentStore(state => state.clearGuides);
  const [deleteGuidesDialogOpen, setDeleteGuidesDialogOpen] = useState(false);

  const handleDeleteGuidesConfirmed = () => {
    clearGuides();
    setDeleteGuidesDialogOpen(false);
  };

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
            <Checkbox checked={guidesVisible} onCheckedChange={toggleGuidesVisible} />
            Show guides
          </Flex>
        </Text>
        <Button
          type="button"
          variant="soft"
          color="gray"
          onClick={() => setDeleteGuidesDialogOpen(true)}
        >
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
              onChange={e => {
                const value = Number(e.target.value);
                if (Number.isFinite(value)) {
                  setSnapTolerance(value);
                }
              }}
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
            <Checkbox checked={dimensionsVisible} onCheckedChange={toggleDimensionsVisible} />
            Show dimensions
          </Flex>
        </Text>
        <Text as="label" size="2">
          <Flex align="center" gap="2">
            <Checkbox checked={showDimensionUnit} onCheckedChange={toggleShowDimensionUnit} />
            Show unit
          </Flex>
        </Text>
        <Text as="label" size="2">
          <Flex direction="column" gap="1">
            Color
            <Box>
              <input
                type="color"
                value={dimensionColor}
                onChange={e => setDimensionColor(e.target.value)}
              />
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
            <Checkbox checked={rulerVisible} onCheckedChange={toggleRulerVisible} />
            Show ruler
          </Flex>
        </Text>
        <Text as="label" size="2">
          <Flex align="center" gap="2">
            <Checkbox checked={rulerGuidesVisible} onCheckedChange={toggleRulerGuidesVisible} />
            Show cursor guides
          </Flex>
        </Text>
      </Flex>

      <ConfirmDialog
        open={deleteGuidesDialogOpen}
        title="Delete all guides"
        message="This will remove every guide from the canvas."
        confirmLabel="Delete"
        onConfirm={handleDeleteGuidesConfirmed}
        onCancel={() => setDeleteGuidesDialogOpen(false)}
      />
    </Flex>
  );
}
