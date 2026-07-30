import { Flex } from '@radix-ui/themes';

import type { TShape, TStyle } from '~/types/document';

import { useDocumentStore } from '~/stores/useDocumentStore';

import {
  Section,
  LabeledRow,
  CompactNumberInput,
  StrokeSection,
} from '~/components/panels/shared/PanelFields';

type TLineSettingsPanelProps = {
  shape: Extract<TShape, { type: 'line' }>;
};

export function LineSettingsPanel({ shape }: TLineSettingsPanelProps) {
  const updateShape = useDocumentStore(state => state.updateShape);

  const onStartXChange = (v: number) => updateShape(shape.id, { x1: v });
  const onStartYChange = (v: number) => updateShape(shape.id, { y1: v });
  const onEndXChange = (v: number) => updateShape(shape.id, { x2: v });
  const onEndYChange = (v: number) => updateShape(shape.id, { y2: v });
  const onStyleChange = (style: TStyle) => updateShape(shape.id, { style });

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

      <StrokeSection style={shape.style} onChange={onStyleChange} />
    </Flex>
  );
}
