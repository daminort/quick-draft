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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
        Stroke width
        <input
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
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
        Stroke color
        <input
          type="color"
          value={style.stroke}
          onChange={(e) => updateShape(shape.id, { style: { ...style, stroke: e.target.value } })}
        />
      </label>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="checkbox"
            checked={style.fill !== undefined}
            onChange={(e) =>
              updateShape(shape.id, {
                style: { ...style, fill: e.target.checked ? (style.fill ?? '#ffffff') : undefined },
              })
            }
          />
          Fill
        </label>
        {style.fill !== undefined && (
          <>
            <input
              type="color"
              value={style.fill}
              onChange={(e) => updateShape(shape.id, { style: { ...style, fill: e.target.value } })}
            />
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              Fill opacity
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={style.fillOpacity ?? 1}
                onChange={(e) =>
                  updateShape(shape.id, {
                    style: { ...style, fillOpacity: Number(e.target.value) },
                  })
                }
              />
            </label>
          </>
        )}
      </div>
    </div>
  )
}
