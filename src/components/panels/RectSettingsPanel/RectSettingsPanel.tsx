import { Flex } from '@radix-ui/themes';

import type { TShape, TStyle } from '~/types/document';

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

  const onXChange = (v: number) => updateShape(shape.id, { x: v });
  const onYChange = (v: number) => updateShape(shape.id, { y: v });
  const onWidthChange = (v: number) => updateShape(shape.id, { w: v });
  const onHeightChange = (v: number) => updateShape(shape.id, { h: v });
  const onRotationChange = (v: number) => updateShape(shape.id, { rotation: v });
  const onStyleChange = (style: TStyle) => updateShape(shape.id, { style });

  return (
    <Flex direction="column" gap="4">
      <Section title="Position">
        <Flex gap="3">
          <InlineField label="x" value={shape.x} onChange={onXChange} />
          <InlineField label="y" value={shape.y} onChange={onYChange} />
        </Flex>
      </Section>

      <Section title="Size">
        <Flex gap="3">
          <InlineField label="w" value={shape.w} min={0} onChange={onWidthChange} />
          <InlineField label="h" value={shape.h} min={0} onChange={onHeightChange} />
        </Flex>
      </Section>

      <Section title="Rotation">
        <CompactNumberInput value={shape.rotation} onChange={onRotationChange} />
      </Section>

      <StrokeSection style={shape.style} onChange={onStyleChange} />

      <FillSection style={shape.style} onChange={onStyleChange} />
    </Flex>
  );
}
