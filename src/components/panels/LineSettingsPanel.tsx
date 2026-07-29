import { Flex } from '@radix-ui/themes';

import type { Shape } from '~/types/document';

import { useDocumentStore } from '~/stores/useDocumentStore';

import {
  Section,
  LabeledRow,
  CompactNumberInput,
  StrokeSection,
} from '~/components/panels/shared/PanelFields';

interface LineSettingsPanelProps {
  shape: Extract<Shape, { type: 'line' }>;
}

export function LineSettingsPanel({ shape }: LineSettingsPanelProps) {
  const updateShape = useDocumentStore(state => state.updateShape);

  return (
    <Flex direction="column" gap="4">
      <Section title="Position">
        <LabeledRow label="Start">
          <CompactNumberInput value={shape.x1} onChange={v => updateShape(shape.id, { x1: v })} />
          <CompactNumberInput value={shape.y1} onChange={v => updateShape(shape.id, { y1: v })} />
        </LabeledRow>
        <LabeledRow label="End">
          <CompactNumberInput value={shape.x2} onChange={v => updateShape(shape.id, { x2: v })} />
          <CompactNumberInput value={shape.y2} onChange={v => updateShape(shape.id, { y2: v })} />
        </LabeledRow>
      </Section>

      <StrokeSection style={shape.style} onChange={style => updateShape(shape.id, { style })} />
    </Flex>
  );
}
