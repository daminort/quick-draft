import { UnitsControl } from '~/components/panels/UnitsControl'

export function SettingsPanel() {
  return (
    <div
      style={{
        width: 220,
        padding: 12,
        borderLeft: '1px solid #ddd',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <h2 style={{ fontSize: 14, margin: 0 }}>Settings</h2>
      <UnitsControl />
    </div>
  )
}
