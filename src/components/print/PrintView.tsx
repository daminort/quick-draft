import { useMemo } from 'react'
import { Flex, Box, Button } from '@radix-ui/themes'
import { PrinterIcon } from '@phosphor-icons/react/dist/csr/Printer'
import { XIcon } from '@phosphor-icons/react/dist/csr/X'
import { useDocumentStore } from '~/stores/useDocumentStore'
import { useUIStore } from '~/stores/useUIStore'
import { renderDocumentToSvg } from '~/render/svg/renderDocumentToSvg'

interface PrintViewProps {
  open: boolean
  onClose: () => void
}

export function PrintView({ open, onClose }: PrintViewProps) {
  const document = useDocumentStore((state) => state.document)
  const showDimensionUnit = useUIStore((state) => state.showDimensionUnit)
  const dimensionColor = useUIStore((state) => state.dimensionColor)
  const svg = useMemo(
    () => renderDocumentToSvg(document, { showDimensionUnit, dimensionColor }),
    [document, showDimensionUnit, dimensionColor],
  )

  if (!open) return null

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
          <PrinterIcon size={18} />
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
          <XIcon size={18} />
          Close
        </Button>
      </Flex>
      <Box className="print-page" flexShrink="0" dangerouslySetInnerHTML={{ __html: svg }} />
    </Flex>
  )
}
