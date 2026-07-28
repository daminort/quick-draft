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
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
      {label}
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => {
          const next = Number(e.target.value)
          if (Number.isFinite(next)) onChange(next)
        }}
      />
    </label>
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
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
            Orientation
            <select
              value={shape.orientation}
              onChange={(e) =>
                updateShape(shape.id, {
                  orientation: e.target.value as 'h' | 'v' | 'angle',
                })
              }
            >
              <option value="h">Horizontal</option>
              <option value="v">Vertical</option>
              <option value="angle">Angle</option>
            </select>
          </label>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <GeometryFields shape={shape} updateShape={updateShape} />
    </div>
  )
}
