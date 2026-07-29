import { Flex, Select } from '@radix-ui/themes'
import { useDocumentStore } from '~/stores/useDocumentStore'
import { Section, LabeledRow, CompactNumberInput } from '~/components/panels/shared/PanelFields'
import type { Shape } from '~/types/document'

interface DimensionSettingsPanelProps {
  shape: Extract<Shape, { type: 'dimension' }>
}

export function DimensionSettingsPanel({ shape }: DimensionSettingsPanelProps) {
  const updateShape = useDocumentStore((state) => state.updateShape)

  return (
    <Flex direction="column" gap="4">
      <Section title="Position">
        <LabeledRow label="Start">
          <CompactNumberInput
            value={shape.x1}
            onChange={(v) => updateShape(shape.id, { x1: v, bindingA: null })}
          />
          <CompactNumberInput
            value={shape.y1}
            onChange={(v) => updateShape(shape.id, { y1: v, bindingA: null })}
          />
        </LabeledRow>
        <LabeledRow label="End">
          <CompactNumberInput
            value={shape.x2}
            onChange={(v) => updateShape(shape.id, { x2: v, bindingB: null })}
          />
          <CompactNumberInput
            value={shape.y2}
            onChange={(v) => updateShape(shape.id, { y2: v, bindingB: null })}
          />
        </LabeledRow>
      </Section>

      <Section title="Unit">
        <Select.Root
          value={shape.unit}
          onValueChange={(value) => updateShape(shape.id, { unit: value as 'mm' | 'cm' | 'm' })}
        >
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="mm">mm</Select.Item>
            <Select.Item value="cm">cm</Select.Item>
            <Select.Item value="m">m</Select.Item>
          </Select.Content>
        </Select.Root>
      </Section>
    </Flex>
  )
}
