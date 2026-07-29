import { Flex, Box } from '@radix-ui/themes';

import { useUIStore } from '~/stores/useUIStore';
import { useRestoreDocument } from '~/stores/useRestoreDocument';
import { useRestoreUISettings } from '~/stores/useRestoreUISettings';

import { CanvasStage } from '~/components/canvas/CanvasStage';
import { Toolbar } from '~/components/panels/Toolbar';
import { PropertiesPanel } from '~/components/panels/PropertiesPanel';
import { SettingsPanel } from '~/components/panels/SettingsPanel';
import { ComponentLibrary } from '~/components/panels/ComponentLibrary';
import { PrintView } from '~/components/print/PrintView';

function App() {
  useRestoreDocument();
  useRestoreUISettings();
  const settingsOpen = useUIStore(state => state.settingsOpen);
  const libraryOpen = useUIStore(state => state.libraryOpen);
  const printOpen = useUIStore(state => state.printOpen);
  const closePrint = useUIStore(state => state.closePrint);

  return (
    <Flex direction="row" width="100%" height="100%">
      <Toolbar />
      <Flex flexGrow="1" minWidth="0">
        <Box flexGrow="1" minWidth="0">
          <CanvasStage />
        </Box>
        {settingsOpen ? (
          <SettingsPanel />
        ) : libraryOpen ? (
          <ComponentLibrary />
        ) : (
          <PropertiesPanel />
        )}
      </Flex>
      <PrintView open={printOpen} onClose={closePrint} />
    </Flex>
  );
}

export default App;
