import { Flex, Text, TextField, Select } from '@radix-ui/themes'
import { useDocumentStore } from '~/stores/useDocumentStore'
import type { Shape, ShapeId, ShapePatch } from '~/types/document'

interface NumberFieldProps {
  label: string
  value: number
  min?: number
  onChange: (value: number) => void
}

function NumberField({ label, value, min, onChange }: NumberFieldProps) {
  return (
    <Text as="label" size="2">
      <Flex direction="column" gap="1">
        {label}
        <TextField.Root
          type="number"
          min={min}
          value={value}
          onChange={(e) => {
            const next = Number(e.target.value)
            if (Number.isFinite(next)) onChange(next)
          }}
        />
      </Flex>
    </Text>
  )
}

interface GeometryFieldsProps {
  shape: Shape
  updateShape: (id: ShapeId, patch: ShapePatch) => void
}

function GeometryFields({ shape, updateShape }: GeometryFieldsProps) {
  switch (shape.type) {
    case 'line':
      return (
        <>
          <NumberField
            label="X1"
            value={shape.x1}
            onChange={(v) => updateShape(shape.id, { x1: v })}
          />
          <NumberField
            label="Y1"
            value={shape.y1}
            onChange={(v) => updateShape(shape.id, { y1: v })}
          />
          <NumberField
            label="X2"
            value={shape.x2}
            onChange={(v) => updateShape(shape.id, { x2: v })}
          />
          <NumberField
            label="Y2"
            value={shape.y2}
            onChange={(v) => updateShape(shape.id, { y2: v })}
          />
        </>
      )
    case 'rect':
      return (
        <>
          <NumberField
            label="X"
            value={shape.x}
            onChange={(v) => updateShape(shape.id, { x: v })}
          />
          <NumberField
            label="Y"
            value={shape.y}
            onChange={(v) => updateShape(shape.id, { y: v })}
          />
          <NumberField
            label="Width"
            value={shape.w}
            min={0}
            onChange={(v) => updateShape(shape.id, { w: v })}
          />
          <NumberField
            label="Height"
            value={shape.h}
            min={0}
            onChange={(v) => updateShape(shape.id, { h: v })}
          />
          <NumberField
            label="Rotation"
            value={shape.rotation}
            onChange={(v) => updateShape(shape.id, { rotation: v })}
          />
        </>
      )
    case 'circle':
      return (
        <>
          <NumberField
            label="Center X"
            value={shape.cx}
            onChange={(v) => updateShape(shape.id, { cx: v })}
          />
          <NumberField
            label="Center Y"
            value={shape.cy}
            onChange={(v) => updateShape(shape.id, { cy: v })}
          />
          <NumberField
            label="Radius"
            value={shape.r}
            min={0}
            onChange={(v) => updateShape(shape.id, { r: v })}
          />
        </>
      )
    case 'arc':
      return (
        <>
          <NumberField
            label="Center X"
            value={shape.cx}
            onChange={(v) => updateShape(shape.id, { cx: v })}
          />
          <NumberField
            label="Center Y"
            value={shape.cy}
            onChange={(v) => updateShape(shape.id, { cy: v })}
          />
          <NumberField
            label="Radius"
            value={shape.r}
            min={0}
            onChange={(v) => updateShape(shape.id, { r: v })}
          />
          <NumberField
            label="Start angle"
            value={shape.startAngle}
            onChange={(v) => updateShape(shape.id, { startAngle: v })}
          />
          <NumberField
            label="End angle"
            value={shape.endAngle}
            onChange={(v) => updateShape(shape.id, { endAngle: v })}
          />
        </>
      )
    case 'text':
      return (
        <>
          <NumberField
            label="X"
            value={shape.x}
            onChange={(v) => updateShape(shape.id, { x: v })}
          />
          <NumberField
            label="Y"
            value={shape.y}
            onChange={(v) => updateShape(shape.id, { y: v })}
          />
        </>
      )
    case 'guide':
      return (
        <>
          <Text as="label" size="2">
            <Flex direction="column" gap="1">
              Orientation
              <Select.Root
                value={shape.orientation}
                onValueChange={(value) =>
                  updateShape(shape.id, {
                    orientation: value as 'h' | 'v' | 'angle',
                  })
                }
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="h">Horizontal</Select.Item>
                  <Select.Item value="v">Vertical</Select.Item>
                  <Select.Item value="angle">Angle</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>
          </Text>
          <NumberField
            label="Position"
            value={shape.position}
            onChange={(v) => updateShape(shape.id, { position: v })}
          />
          {shape.orientation === 'angle' && (
            <NumberField
              label="Angle"
              value={shape.angle ?? 0}
              onChange={(v) => updateShape(shape.id, { angle: v })}
            />
          )}
        </>
      )
    case 'dimension':
      return (
        <>
          <NumberField
            label="X1"
            value={shape.x1}
            onChange={(v) => updateShape(shape.id, { x1: v, bindingA: null })}
          />
          <NumberField
            label="Y1"
            value={shape.y1}
            onChange={(v) => updateShape(shape.id, { y1: v, bindingA: null })}
          />
          <NumberField
            label="X2"
            value={shape.x2}
            onChange={(v) => updateShape(shape.id, { x2: v, bindingB: null })}
          />
          <NumberField
            label="Y2"
            value={shape.y2}
            onChange={(v) => updateShape(shape.id, { y2: v, bindingB: null })}
          />
          <Text as="label" size="2">
            <Flex direction="column" gap="1">
              Axis
              <Select.Root
                value={shape.axis}
                onValueChange={(value) =>
                  updateShape(shape.id, {
                    axis: value as 'horizontal' | 'vertical',
                  })
                }
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="horizontal">Horizontal</Select.Item>
                  <Select.Item value="vertical">Vertical</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>
          </Text>
          <NumberField
            label="Offset"
            value={shape.offset}
            onChange={(v) => updateShape(shape.id, { offset: v })}
          />
          <Text as="label" size="2">
            <Flex direction="column" gap="1">
              Unit
              <Select.Root
                value={shape.unit}
                onValueChange={(value) =>
                  updateShape(shape.id, {
                    unit: value as 'mm' | 'cm' | 'm',
                  })
                }
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="mm">mm</Select.Item>
                  <Select.Item value="cm">cm</Select.Item>
                  <Select.Item value="m">m</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>
          </Text>
        </>
      )
    case 'component-instance':
      return (
        <>
          <NumberField
            label="X"
            value={shape.x}
            onChange={(v) => updateShape(shape.id, { x: v })}
          />
          <NumberField
            label="Y"
            value={shape.y}
            onChange={(v) => updateShape(shape.id, { y: v })}
          />
          <NumberField
            label="Scale"
            value={shape.scale}
            min={0.01}
            onChange={(v) => updateShape(shape.id, { scale: v })}
          />
          <NumberField
            label="Rotation"
            value={shape.rotation}
            onChange={(v) => updateShape(shape.id, { rotation: v })}
          />
        </>
      )
    default:
      return null
  }
}

interface GeometryPanelProps {
  shape: Shape
}

export function GeometryPanel({ shape }: GeometryPanelProps) {
  const updateShape = useDocumentStore((state) => state.updateShape)

  return (
    <Flex direction="column" gap="2">
      <GeometryFields shape={shape} updateShape={updateShape} />
    </Flex>
  )
}
