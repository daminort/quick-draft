import { useMemo } from 'react';

import { Flex, Box, Button } from '@radix-ui/themes';
import { Printer, X } from 'lucide-react';

import { useDocumentStore } from '~/stores/useDocumentStore';
import { useUIStore } from '~/stores/useUIStore';

import { renderDocumentToSvg } from '~/render/svg/renderDocumentToSvg';

type TPrintViewProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function PrintView({ isOpen, onClose }: TPrintViewProps) {
  const document = useDocumentStore(state => state.document);
  const shouldShowDimensionUnit = useUIStore(state => state.shouldShowDimensionUnit);
  const dimensionColor = useUIStore(state => state.dimensionColor);
  const svg = useMemo(
    () => renderDocumentToSvg(document, { shouldShowDimensionUnit, dimensionColor }),
    [document, shouldShowDimensionUnit, dimensionColor],
  );

  if (!isOpen) {
    return null;
  }

  return (
    <Flex
      direction="column"
      align="center"
      gap="4"
      p="6"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        overflow: 'auto',
        background: 'rgba(0, 0, 0, 0.6)',
      }}
    >
      <Flex gap="2" flexShrink="0">
        <Button type="button" onClick={() => window.print()} title="Print" aria-label="Print">
          <Printer size={18} />
          Print
        </Button>
        <Button
          type="button"
          variant="surface"
          color="gray"
          onClick={onClose}
          title="Close preview"
          aria-label="Close preview"
        >
          <X size={18} />
          Close
        </Button>
      </Flex>
      <Box className="print-page" flexShrink="0" dangerouslySetInnerHTML={{ __html: svg }} />
    </Flex>
  );
}
