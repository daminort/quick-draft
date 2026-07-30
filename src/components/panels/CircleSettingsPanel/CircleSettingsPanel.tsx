import { Flex } from '@radix-ui/themes';

import type { TShape, TStyle } from '~/types/document';

import { useDocumentStore } from '~/stores/useDocumentStore';

import {
  Section,
  LabeledRow,
  InlineField,
  CompactNumberInput,
  StrokeSection,
  FillSection,
} from '~/components/panels/shared/PanelFields';

type TCircleSettingsPanelProps = {
  shape: Extract<TShape, { type: 'circle' }>;
};

export function CircleSettingsPanel({ shape }: TCircleSettingsPanelProps) {
  const updateShape = useDocumentStore(state => state.updateShape);

  const onCenterXChange = (v: number) => updateShape(shape.id, { cx: v });
  const onCenterYChange = (v: number) => updateShape(shape.id, { cy: v });
  const onRadiusChange = (v: number) => updateShape(shape.id, { r: v });
  const onStyleChange = (style: TStyle) => updateShape(shape.id, { style });

  return (
    <Flex direction="column" gap="4">
      <Section title="Center">
        <Flex gap="3">
          <InlineField label="x" value={shape.cx} onChange={onCenterXChange} />
          <InlineField label="y" value={shape.cy} onChange={onCenterYChange} />
        </Flex>
      </Section>

      <Section title="Size">
        <LabeledRow label="r">
          <CompactNumberInput value={shape.r} min={0} onChange={onRadiusChange} />
        </LabeledRow>
      </Section>

      <StrokeSection style={shape.style} onChange={onStyleChange} />

      <FillSection style={shape.style} onChange={onStyleChange} />
    </Flex>
  );
}
