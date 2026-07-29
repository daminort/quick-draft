import { useMemo } from 'react'
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
    <div className="print-overlay">
      <div className="print-toolbar">
        <button type="button" onClick={() => window.print()} title="Print" aria-label="Print">
          <PrinterIcon size={18} />
          Print
        </button>
        <button type="button" onClick={onClose} title="Close preview" aria-label="Close preview">
          <XIcon size={18} />
          Close
        </button>
      </div>
      <div className="print-page" dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  )
}
