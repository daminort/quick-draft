import type { ChangeEvent, KeyboardEvent } from 'react';
import { useEffect, useState } from 'react';

import { Flex, Select, TextField } from '@radix-ui/themes';

import { computeDimensionGeometry, formatLength } from '~/lib/dimension';
import { computeDimensionResizePatch } from '~/lib/dimensionBinding';

import { documentStore, documentSelectors, documentActions } from '~/stores/documentStore';
import { uiStore, uiSelectors } from '~/stores/uiStore';

import { Section, LabeledRow, CompactNumberInput } from '~/components/panels/shared/PanelFields';

import type { TDimensionSettingsPanelProps } from './DimensionSettingsPanel.props';

const DimensionSettingsPanel = ({ shape }: TDimensionSettingsPanelProps) => {
  const shapes = documentStore(documentSelectors.getShapes);
  const documentScale = documentStore(documentSelectors.getScale);
  const documentUnits = documentStore(documentSelectors.getUnits);
  const shouldShowDimensionUnit = uiStore(uiSelectors.getShouldShowDimensionUnit);

  const geometry = computeDimensionGeometry(
    shape.x1,
    shape.y1,
    shape.x2,
    shape.y2,
    shape.axis,
    shape.offset,
    documentScale,
    documentUnits,
    shape.unit,
    shouldShowDimensionUnit,
    shapes,
  );
  const currentValue = geometry ? formatLength(geometry.length) : '';

  const [valueDraft, setValueDraft] = useState(currentValue);
  const [isValueFocused, setIsValueFocused] = useState(false);

  useEffect(() => {
    if (!isValueFocused) {
      setValueDraft(currentValue);
    }
  }, [currentValue, isValueFocused]);

  const onValueChange = (e: ChangeEvent<HTMLInputElement>) => setValueDraft(e.target.value);
  const onValueFocus = () => setIsValueFocused(true);
  const onValueBlur = () => setIsValueFocused(false);
  const onValueKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') {
      return;
    }
    e.preventDefault();
    const result = computeDimensionResizePatch(
      shape,
      shapes,
      documentScale,
      documentUnits,
      valueDraft,
    );
    if (result) {
      documentActions.updateShape(result.targetId, result.patch);
    }
    e.currentTarget.blur();
  };

  const onStartXChange = (v: number) =>
    documentActions.updateShape(shape.id, { x1: v, bindingA: null });
  const onStartYChange = (v: number) =>
    documentActions.updateShape(shape.id, { y1: v, bindingA: null });
  const onEndXChange = (v: number) =>
    documentActions.updateShape(shape.id, { x2: v, bindingB: null });
  const onEndYChange = (v: number) =>
    documentActions.updateShape(shape.id, { y2: v, bindingB: null });
  const onUnitChange = (value: string) =>
    documentActions.updateShape(shape.id, { unit: value as 'mm' | 'cm' | 'm' });

  return (
    <Flex direction="column" gap="4">
      <Section title="Value">
        <TextField.Root
          value={valueDraft}
          onChange={onValueChange}
          onFocus={onValueFocus}
          onBlur={onValueBlur}
          onKeyDown={onValueKeyDown}
        />
      </Section>

      <Section title="Position">
        <LabeledRow label="Start">
          <CompactNumberInput value={shape.x1} onChange={onStartXChange} />
          <CompactNumberInput value={shape.y1} onChange={onStartYChange} />
        </LabeledRow>
        <LabeledRow label="End">
          <CompactNumberInput value={shape.x2} onChange={onEndXChange} />
          <CompactNumberInput value={shape.y2} onChange={onEndYChange} />
        </LabeledRow>
      </Section>

      <Section title="Unit">
        <Select.Root value={shape.unit} onValueChange={onUnitChange}>
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="mm">mm</Select.Item>
            <Select.Item value="cm">cm</Select.Item>
            <Select.Item value="m">m</Select.Item>
          </Select.Content>
        </Select.Root>
      </Section>
    </Flex>
  );
};

export { DimensionSettingsPanel };
