import { CanvasStage } from '~/components/canvas/CanvasStage'
import { Toolbar } from '~/components/panels/Toolbar'
import { PropertiesPanel } from '~/components/panels/PropertiesPanel'
import { SettingsPanel } from '~/components/panels/SettingsPanel'
import { ComponentLibrary } from '~/components/panels/ComponentLibrary'
import { PrintView } from '~/components/print/PrintView'
import { useUIStore } from '~/stores/useUIStore'
import { useRestoreDocument } from '~/stores/useRestoreDocument'

function App() {
  useRestoreDocument()
  const settingsOpen = useUIStore((state) => state.settingsOpen)
  const libraryOpen = useUIStore((state) => state.libraryOpen)
  const printOpen = useUIStore((state) => state.printOpen)
  const closePrint = useUIStore((state) => state.closePrint)

  return (
    <div style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '100%' }}>
      <Toolbar />
      <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <CanvasStage />
        </div>
        {settingsOpen ? (
          <SettingsPanel />
        ) : libraryOpen ? (
          <ComponentLibrary />
        ) : (
          <PropertiesPanel />
        )}
      </div>
      <PrintView open={printOpen} onClose={closePrint} />
    </div>
  )
}

export default App
