import { Flex } from '@radix-ui/themes'
import { useDocumentStore } from '~/stores/useDocumentStore'
import { useSelectionStore } from '~/stores/useSelectionStore'
import { GeometryPanel } from '~/components/panels/GeometryPanel'
import { TextPanel } from '~/components/panels/TextPanel'
import { StylePanel } from '~/components/panels/StylePanel'
import { ComponentActions } from '~/components/panels/ComponentActions'

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
      <GeometryPanel shape={shape} />
      <TextPanel shape={shape} />
      <StylePanel shape={shape} />
    </Flex>
  )
}
