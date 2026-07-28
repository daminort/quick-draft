import { CanvasStage } from '~/components/canvas/CanvasStage'
import { Toolbar } from '~/components/panels/Toolbar'
import { PropertiesPanel } from '~/components/panels/PropertiesPanel'
import { SettingsPanel } from '~/components/panels/SettingsPanel'
import { useUIStore } from '~/stores/useUIStore'

function App() {
  const settingsOpen = useUIStore((state) => state.settingsOpen)

  return (
    <div style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '100%' }}>
      <Toolbar />
      <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <CanvasStage />
        </div>
        {settingsOpen ? <SettingsPanel /> : <PropertiesPanel />}
      </div>
    </div>
  )
}

export default App
