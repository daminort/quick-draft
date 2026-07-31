import { Flex } from '@radix-ui/themes';

import type { TShape, TStyle } from '~/types/document';

import { documentActions } from '~/stores/documentStore';

import {
  Section,
  LabeledRow,
  InlineField,
  CompactNumberInput,
  StrokeSection,
  FillSection,
} from '~/components/panels/shared/PanelFields';

type TArcSettingsPanelProps = {
  shape: Extract<TShape, { type: 'arc' }>;
};

function ArcSettingsPanel({ shape }: TArcSettingsPanelProps) {
  const onCenterXChange = (v: number) => documentActions.updateShape(shape.id, { cx: v });
  const onCenterYChange = (v: number) => documentActions.updateShape(shape.id, { cy: v });
  const onRadiusChange = (v: number) => documentActions.updateShape(shape.id, { r: v });
  const onStartAngleChange = (v: number) =>
    documentActions.updateShape(shape.id, { startAngle: v });
  const onEndAngleChange = (v: number) => documentActions.updateShape(shape.id, { endAngle: v });
  const onStyleChange = (style: TStyle) => documentActions.updateShape(shape.id, { style });

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

      <Section title="Angles">
        <LabeledRow label="start">
          <CompactNumberInput value={shape.startAngle} onChange={onStartAngleChange} />
        </LabeledRow>
        <LabeledRow label="end">
          <CompactNumberInput value={shape.endAngle} onChange={onEndAngleChange} />
        </LabeledRow>
      </Section>

      <StrokeSection style={shape.style} onChange={onStyleChange} />

      <FillSection style={shape.style} onChange={onStyleChange} />
    </Flex>
  );
}

export { ArcSettingsPanel };
