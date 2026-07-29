import { Box, Flex, Text, TextField, Checkbox, Slider } from '@radix-ui/themes'
import { useDocumentStore } from '~/stores/useDocumentStore'
import type { Shape } from '~/types/document'

interface StylePanelProps {
  shape: Shape
}

export function StylePanel({ shape }: StylePanelProps) {
  const updateShape = useDocumentStore((state) => state.updateShape)

  if (!('style' in shape)) return null
  const { style } = shape

  return (
    <Flex direction="column" gap="2">
      <Text as="label" size="2">
        <Flex direction="column" gap="1">
          Stroke width
          <TextField.Root
            type="number"
            min={1}
            value={style.strokeWidth}
            onChange={(e) => {
              const value = Number(e.target.value)
              if (Number.isFinite(value) && value > 0) {
                updateShape(shape.id, { style: { ...style, strokeWidth: value } })
              }
            }}
          />
        </Flex>
      </Text>

      <Text as="label" size="2">
        <Flex direction="column" gap="1">
          Stroke color
          <Box>
            <input
              type="color"
              value={style.stroke}
              onChange={(e) =>
                updateShape(shape.id, { style: { ...style, stroke: e.target.value } })
              }
            />
          </Box>
        </Flex>
      </Text>

      <Flex direction="column" gap="1">
        <Text as="label" size="2">
          <Flex align="center" gap="2">
            <Checkbox
              checked={style.fill !== undefined}
              onCheckedChange={(checked) =>
                updateShape(shape.id, {
                  style: { ...style, fill: checked ? (style.fill ?? '#ffffff') : undefined },
                })
              }
            />
            Fill
          </Flex>
        </Text>
        {style.fill !== undefined && (
          <>
            <Box>
              <input
                type="color"
                value={style.fill}
                onChange={(e) =>
                  updateShape(shape.id, { style: { ...style, fill: e.target.value } })
                }
              />
            </Box>
            <Text as="label" size="2">
              <Flex direction="column" gap="1">
                Fill opacity
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[style.fillOpacity ?? 1]}
                  onValueChange={([value]) =>
                    updateShape(shape.id, {
                      style: { ...style, fillOpacity: value },
                    })
                  }
                />
              </Flex>
            </Text>
          </>
        )}
      </Flex>
    </Flex>
  )
}
