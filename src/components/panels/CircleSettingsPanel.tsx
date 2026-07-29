import { Flex } from '@radix-ui/themes';

import type { Shape } from '~/types/document';

import { useDocumentStore } from '~/stores/useDocumentStore';

import {
  Section,
  LabeledRow,
  InlineField,
  CompactNumberInput,
  StrokeSection,
  FillSection,
} from '~/components/panels/shared/PanelFields';

interface CircleSettingsPanelProps {
  shape: Extract<Shape, { type: 'circle' }>;
}

export function CircleSettingsPanel({ shape }: CircleSettingsPanelProps) {
  const updateShape = useDocumentStore(state => state.updateShape);

  return (
    <Flex direction="column" gap="4">
      <Section title="Center">
        <Flex gap="3">
          <InlineField
            label="x"
            value={shape.cx}
            onChange={v => updateShape(shape.id, { cx: v })}
          />
          <InlineField
            label="y"
            value={shape.cy}
            onChange={v => updateShape(shape.id, { cy: v })}
          />
        </Flex>
      </Section>

      <Section title="Size">
        <LabeledRow label="r">
          <CompactNumberInput
            value={shape.r}
            min={0}
            onChange={v => updateShape(shape.id, { r: v })}
          />
        </LabeledRow>
      </Section>

      <StrokeSection style={shape.style} onChange={style => updateShape(shape.id, { style })} />

      <FillSection style={shape.style} onChange={style => updateShape(shape.id, { style })} />
    </Flex>
  );
}
