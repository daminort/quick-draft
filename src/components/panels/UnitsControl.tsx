import { useDocumentStore } from '~/stores/useDocumentStore'
import type { Document } from '~/types/document'
import { UNIT_OPTIONS } from '~/constants/ui'

export function UnitsControl() {
  const units = useDocumentStore((state) => state.document.units)
  const setUnits = useDocumentStore((state) => state.setUnits)

  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
      Measurement units
      <select value={units} onChange={(e) => setUnits(e.target.value as Document['units'])}>
        {UNIT_OPTIONS.map((unit) => (
          <option key={unit} value={unit}>
            {unit}
          </option>
        ))}
      </select>
    </label>
  )
}
