import { useCallback, useEffect, useState } from 'react'
import { Selected } from '../interface'
import Panel from '../components/Panel'

export default function Content() {
  const [selected, setSelected] = useState<Selected | null>(null)

  const handleSelChange = useCallback(() => {
    const selection = window.getSelection()
    console.debug('[selection change]')
    if (selection && selection.toString() && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      setSelected({
        selection: selection,
        text: selection.toString(),
        bottom: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      })
    }
  }, [])

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelChange)
    return () => {
      document.removeEventListener('selectionchange', handleSelChange)
    }
  }, [handleSelChange])

  const handleClose = useCallback(() => {
    console.log('[remove pannel]', selected)
    selected?.selection.removeAllRanges()
    setSelected(null)
  }, [selected])

  return selected ? <Panel selected={selected} onClose={handleClose} /> : null
}
