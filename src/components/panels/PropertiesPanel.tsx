import { Flex, Text } from '@radix-ui/themes'
import { useDocumentStore } from '~/stores/useDocumentStore'
import { useSelectionStore } from '~/stores/useSelectionStore'
import { GeometryPanel } from '~/components/panels/GeometryPanel'
import { LineSettingsPanel } from '~/components/panels/LineSettingsPanel'
import { RectSettingsPanel } from '~/components/panels/RectSettingsPanel'
import { CircleSettingsPanel } from '~/components/panels/CircleSettingsPanel'
import { ArcSettingsPanel } from '~/components/panels/ArcSettingsPanel'
import { TextSettingsPanel } from '~/components/panels/TextSettingsPanel'
import { DimensionSettingsPanel } from '~/components/panels/DimensionSettingsPanel'
import { ComponentActions } from '~/components/panels/ComponentActions'
import { LABEL_WEIGHT } from '~/components/panels/shared/PanelFields'
import type { Shape } from '~/types/document'

const SHAPE_TYPE_LABELS: Record<Shape['type'], string> = {
  line: 'Line',
  rect: 'Rectangle',
  circle: 'Circle',
  arc: 'Arc',
  text: 'Text',
  dimension: 'Dimension',
  guide: 'Guide',
  'component-instance': 'Component instance',
}

function ShapeSettings({ shape }: { shape: Shape }) {
  switch (shape.type) {
    case 'line':
      return <LineSettingsPanel shape={shape} />
    case 'rect':
      return <RectSettingsPanel shape={shape} />
    case 'circle':
      return <CircleSettingsPanel shape={shape} />
    case 'arc':
      return <ArcSettingsPanel shape={shape} />
    case 'text':
      return <TextSettingsPanel shape={shape} />
    case 'dimension':
      return <DimensionSettingsPanel shape={shape} />
    case 'guide':
    case 'component-instance':
      return <GeometryPanel shape={shape} />
    default:
      return null
  }
}

export function PropertiesPanel() {
  const selectedIds = useSelectionStore((state) => state.selectedIds)
  const shapes = useDocumentStore((state) => state.document.shapes)

  if (selectedIds.length > 1) {
    return (
      <Flex
        direction="column"
        gap="4"
        width="220px"
        p="3"
        style={{ borderLeft: '1px solid var(--gray-a5)' }}
      >
        <ComponentActions />
      </Flex>
    )
  }

  if (selectedIds.length !== 1) return null
  const shape = shapes.find((candidate) => candidate.id === selectedIds[0])
  if (!shape) return null

  return (
    <Flex
      direction="column"
      gap="4"
      width="220px"
      p="3"
      style={{ borderLeft: '1px solid var(--gray-a5)' }}
    >
      <Text as="div" size="3" style={LABEL_WEIGHT}>
        {SHAPE_TYPE_LABELS[shape.type]}
      </Text>
      <ShapeSettings shape={shape} />
    </Flex>
  )
}
