import { Box, Flex, Text, TextField, TextArea, Select, IconButton } from '@radix-ui/themes'
import { TextBIcon } from '@phosphor-icons/react/dist/csr/TextB'
import { TextItalicIcon } from '@phosphor-icons/react/dist/csr/TextItalic'
import { useDocumentStore } from '~/stores/useDocumentStore'
import type { Shape } from '~/types/document'
import { FONT_FAMILIES } from '~/constants/ui'

interface TextPanelProps {
  shape: Shape
}

// Keep `variant="ghost"` at all times (see Toolbar.tsx for why switching to `soft` on activation
// shifts the button) and fake the active look with a plain background instead.
const ACTIVE_TEXT_BUTTON_STYLE = { backgroundColor: 'var(--accent-a3)' }

export function TextPanel({ shape }: TextPanelProps) {
  const updateShape = useDocumentStore((state) => state.updateShape)

  if (shape.type !== 'text') return null

  return (
    <Flex direction="column" gap="2">
      <Text as="label" size="2">
        <Flex direction="column" gap="1">
          Text
          <TextArea
            rows={2}
            value={shape.text}
            onChange={(e) => updateShape(shape.id, { text: e.target.value })}
          />
        </Flex>
      </Text>

      <Text as="label" size="2">
        <Flex direction="column" gap="1">
          Font family
          <Select.Root
            value={shape.fontFamily}
            onValueChange={(value) => updateShape(shape.id, { fontFamily: value })}
          >
            <Select.Trigger />
            <Select.Content>
              {FONT_FAMILIES.map((font) => (
                <Select.Item key={font} value={font}>
                  {font}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Flex>
      </Text>

      <Text as="label" size="2">
        <Flex direction="column" gap="1">
          Font size
          <TextField.Root
            type="number"
            min={1}
            value={shape.fontSize}
            onChange={(e) => {
              const value = Number(e.target.value)
              if (Number.isFinite(value) && value > 0) {
                updateShape(shape.id, { fontSize: value })
              }
            }}
          />
        </Flex>
      </Text>

      <Flex gap="1">
        <IconButton
          type="button"
          title="Bold"
          aria-label="Bold"
          aria-pressed={shape.bold}
          variant="ghost"
          style={shape.bold ? ACTIVE_TEXT_BUTTON_STYLE : undefined}
          onClick={() => updateShape(shape.id, { bold: !shape.bold })}
        >
          <TextBIcon size={18} />
        </IconButton>
        <IconButton
          type="button"
          title="Italic"
          aria-label="Italic"
          aria-pressed={shape.italic}
          variant="ghost"
          style={shape.italic ? ACTIVE_TEXT_BUTTON_STYLE : undefined}
          onClick={() => updateShape(shape.id, { italic: !shape.italic })}
        >
          <TextItalicIcon size={18} />
        </IconButton>
      </Flex>

      <Text as="label" size="2">
        <Flex direction="column" gap="1">
          Color
          <Box>
            <input
              type="color"
              value={shape.fill}
              onChange={(e) => updateShape(shape.id, { fill: e.target.value })}
            />
          </Box>
        </Flex>
      </Text>
    </Flex>
  )
}
