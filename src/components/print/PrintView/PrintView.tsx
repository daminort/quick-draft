import { useMemo } from 'react';

import { Flex, Box, Button } from '@radix-ui/themes';
import { Printer, X } from 'lucide-react';

import { useDocumentStore } from '~/stores/useDocumentStore';
import { useUIStore } from '~/stores/useUIStore';

import { renderDocumentToSvg } from '~/render/svg/renderDocumentToSvg';

import s from './PrintView.module.css';

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
    <Flex direction="column" align="center" gap="4" p="6" className={s.overlay}>
      <Flex gap="2" flexShrink="0">
        <Button type="button" title="Print" aria-label="Print" onClick={() => window.print()}>
          <Printer size={18} />
          Print
        </Button>
        <Button
          type="button"
          title="Close preview"
          aria-label="Close preview"
          onClick={onClose}
          variant="surface"
          color="gray"
        >
          <X size={18} />
          Close
        </Button>
      </Flex>
      <Box dangerouslySetInnerHTML={{ __html: svg }} className="print-page" flexShrink="0" />
    </Flex>
  );
}
