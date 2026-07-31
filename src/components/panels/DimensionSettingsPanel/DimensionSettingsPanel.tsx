import { Flex, Select } from '@radix-ui/themes';

import { documentActions } from '~/stores/documentStore';

import { Section, LabeledRow, CompactNumberInput } from '~/components/panels/shared/PanelFields';

import type { TDimensionSettingsPanelProps } from './DimensionSettingsPanel.props';

const DimensionSettingsPanel = ({ shape }: TDimensionSettingsPanelProps) => {
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
