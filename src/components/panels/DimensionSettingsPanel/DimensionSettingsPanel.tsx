import { Flex, Select } from '@radix-ui/themes';

import type { TShape } from '~/types/document';

import { useDocumentStore } from '~/stores/useDocumentStore';

import { Section, LabeledRow, CompactNumberInput } from '~/components/panels/shared/PanelFields';

type TDimensionSettingsPanelProps = {
  shape: Extract<TShape, { type: 'dimension' }>;
};

export function DimensionSettingsPanel({ shape }: TDimensionSettingsPanelProps) {
  const updateShape = useDocumentStore(state => state.updateShape);

  const onStartXChange = (v: number) => updateShape(shape.id, { x1: v, bindingA: null });
  const onStartYChange = (v: number) => updateShape(shape.id, { y1: v, bindingA: null });
  const onEndXChange = (v: number) => updateShape(shape.id, { x2: v, bindingB: null });
  const onEndYChange = (v: number) => updateShape(shape.id, { y2: v, bindingB: null });
  const onUnitChange = (value: string) =>
    updateShape(shape.id, { unit: value as 'mm' | 'cm' | 'm' });

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
}
