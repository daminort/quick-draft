import { useState } from 'react'
import { useDocumentStore } from '~/stores/useDocumentStore'
import { useSelectionStore } from '~/stores/useSelectionStore'

export function ComponentActions() {
  const selectedIds = useSelectionStore((state) => state.selectedIds)
  const select = useSelectionStore((state) => state.select)
  const createComponent = useDocumentStore((state) => state.createComponent)
  const [name, setName] = useState('')

  if (selectedIds.length <= 1) return null

  const handleCreate = () => {
    const instanceId = createComponent(selectedIds, name.trim() || 'Component')
    // Deferred: the instance's Konva node registers on mount, one render after this one — selecting
    // it a tick later (instead of in the same batch) lets the Transformer find it immediately.
    if (instanceId) setTimeout(() => select([instanceId]), 0)
    setName('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <h3 style={{ fontSize: 13, margin: 0 }}>Component</h3>
      <p style={{ margin: 0, fontSize: 12, color: '#666' }}>{selectedIds.length} shapes selected</p>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
        Name
        <input
          type="text"
          value={name}
          placeholder="Component"
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <button
        type="button"
        onClick={handleCreate}
        style={{
          padding: '6px 10px',
          border: 'none',
          borderRadius: 6,
          background: '#2563eb',
          color: '#fff',
          cursor: 'pointer',
          fontSize: 13,
        }}
      >
        Group into component
      </button>
    </div>
  )
}
