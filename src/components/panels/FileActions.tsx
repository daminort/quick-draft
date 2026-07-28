import { useRef, type ChangeEvent } from 'react'
import { FloppyDiskIcon } from '@phosphor-icons/react/dist/csr/FloppyDisk'
import { FolderOpenIcon } from '@phosphor-icons/react/dist/csr/FolderOpen'
import { useDocumentStore } from '~/stores/useDocumentStore'
import { exportDocumentToJsonFile, importDocumentFromJsonFile } from '~/lib/persistence/fileIO'

const BUTTON_STYLE = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: 36,
  border: 'none',
  borderRadius: 6,
  background: 'transparent',
  cursor: 'pointer',
} as const

export function FileActions() {
  const documentState = useDocumentStore((state) => state.document)
  const loadDocument = useDocumentStore((state) => state.loadDocument)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleOpen = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const doc = await importDocumentFromJsonFile(file)
      loadDocument(doc)
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Failed to open the file.')
    }
  }

  return (
    <>
      <button
        type="button"
        title="Save as JSON"
        aria-label="Save as JSON"
        onClick={() => exportDocumentToJsonFile(documentState)}
        style={BUTTON_STYLE}
      >
        <FloppyDiskIcon size={20} />
      </button>
      <button
        type="button"
        title="Open JSON"
        aria-label="Open JSON"
        onClick={() => inputRef.current?.click()}
        style={BUTTON_STYLE}
      >
        <FolderOpenIcon size={20} />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleOpen}
        style={{ display: 'none' }}
      />
    </>
  )
}
