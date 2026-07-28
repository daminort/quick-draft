import { useCallback, useEffect, useRef, useState } from 'react'
import type Konva from 'konva'
import { useViewStore } from '~/stores/useViewStore'

const MIDDLE_BUTTON = 1

export function useCanvasPan() {
  const setView = useViewStore((state) => state.setView)
  const [isPanning, setIsPanning] = useState(false)
  const lastPointer = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!isPanning) return

    function handleWindowMouseMove(e: MouseEvent) {
      if (!lastPointer.current) return
      const dx = e.clientX - lastPointer.current.x
      const dy = e.clientY - lastPointer.current.y
      lastPointer.current = { x: e.clientX, y: e.clientY }
      const { scale, x, y } = useViewStore.getState()
      setView({ scale, x: x + dx, y: y + dy })
    }

    function handleWindowMouseUp() {
      lastPointer.current = null
      setIsPanning(false)
    }

    window.addEventListener('mousemove', handleWindowMouseMove)
    window.addEventListener('mouseup', handleWindowMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove)
      window.removeEventListener('mouseup', handleWindowMouseUp)
    }
  }, [isPanning, setView])

  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>): boolean => {
    if (e.evt.button !== MIDDLE_BUTTON) return false
    e.evt.preventDefault()
    lastPointer.current = { x: e.evt.clientX, y: e.evt.clientY }
    setIsPanning(true)
    return true
  }, [])

  return { isPanning, handleMouseDown }
}
