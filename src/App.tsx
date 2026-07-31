import { Flex, Box } from '@radix-ui/themes';

import { uiStore, uiSelectors, uiActions } from '~/stores/uiStore';
import { useRestoreDocument } from '~/stores/useRestoreDocument';
import { useRestoreUISettings } from '~/stores/useRestoreUISettings';

import { CanvasStage } from '~/components/canvas/CanvasStage';
import { Toolbar } from '~/components/panels/Toolbar';
import { PropertiesPanel } from '~/components/panels/PropertiesPanel';
import { SettingsPanel } from '~/components/panels/SettingsPanel';
import { ComponentLibrary } from '~/components/panels/ComponentLibrary';
import { PrintView } from '~/components/print/PrintView';

const App = () => {
  useRestoreDocument();
  useRestoreUISettings();
  const isSettingsOpen = uiStore(uiSelectors.getIsSettingsOpen);
  const isLibraryOpen = uiStore(uiSelectors.getIsLibraryOpen);
  const isPrintOpen = uiStore(uiSelectors.getIsPrintOpen);

  return (
    <Flex direction="row" width="100%" height="100%">
      <Toolbar />
      <Flex flexGrow="1" minWidth="0">
        <Box flexGrow="1" minWidth="0">
          <CanvasStage />
        </Box>
        {isSettingsOpen ? (
          <SettingsPanel />
        ) : isLibraryOpen ? (
          <ComponentLibrary />
        ) : (
          <PropertiesPanel />
        )}
      </Flex>
      <PrintView isOpen={isPrintOpen} onClose={uiActions.closePrint} />
    </Flex>
  );
};

export { App };
