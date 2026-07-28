import { CanvasStage } from './components/canvas/CanvasStage'
import { Toolbar } from './components/panels/Toolbar'
import { StylePanel } from './components/panels/StylePanel'

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '100%' }}>
      <Toolbar />
      <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <CanvasStage />
        </div>
        <StylePanel />
      </div>
    </div>
  )
}

export default App
