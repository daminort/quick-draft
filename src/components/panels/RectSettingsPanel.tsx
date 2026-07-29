import { Flex } from '@radix-ui/themes';

import type { TShape } from '~/types/document';

import { useDocumentStore } from '~/stores/useDocumentStore';

import {
  Section,
  InlineField,
  CompactNumberInput,
  StrokeSection,
  FillSection,
} from '~/components/panels/shared/PanelFields';

type TRectSettingsPanelProps = {
  shape: Extract<TShape, { type: 'rect' }>;
};

export function RectSettingsPanel({ shape }: TRectSettingsPanelProps) {
  const updateShape = useDocumentStore(state => state.updateShape);

  return (
    <Flex direction="column" gap="4">
      <Section title="Position">
        <Flex gap="3">
          <InlineField label="x" value={shape.x} onChange={v => updateShape(shape.id, { x: v })} />
          <InlineField label="y" value={shape.y} onChange={v => updateShape(shape.id, { y: v })} />
        </Flex>
      </Section>

      <Section title="Size">
        <Flex gap="3">
          <InlineField
            label="w"
            value={shape.w}
            min={0}
            onChange={v => updateShape(shape.id, { w: v })}
          />
          <InlineField
            label="h"
            value={shape.h}
            min={0}
            onChange={v => updateShape(shape.id, { h: v })}
          />
        </Flex>
      </Section>

      <Section title="Rotation">
        <CompactNumberInput
          value={shape.rotation}
          onChange={v => updateShape(shape.id, { rotation: v })}
        />
      </Section>

      <StrokeSection style={shape.style} onChange={style => updateShape(shape.id, { style })} />

      <FillSection style={shape.style} onChange={style => updateShape(shape.id, { style })} />
    </Flex>
  );
}
