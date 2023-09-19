import { useCallback, useEffect } from 'react'
import { Selected } from '../interface'

interface MarkerProps {
  selected: Selected
  onClose: () => void
}

export default function Panel(props: MarkerProps) {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log(`Button ${event.currentTarget.textContent} clicked`)
  }

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      const target = event.target as HTMLElement
      console.log(`[mousedown] ${target.closest('.wn-panel') ? 'inside' : 'outside'} panel`)
      if (!target.closest('.wn-panel')) {
        props.onClose()
      }
    },
    [props.onClose],
  )

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handleClickOutside])

  return (
    <div
      className="wn-panel"
      style={{
        position: 'absolute',
        top: props.selected.bottom,
        left: props.selected.left,
        backgroundColor: 'white',
        border: '1px solid black',
        padding: '2px',
      }}
    >
      <button onClick={handleClick}>bt1</button>
      <button onClick={handleClick}>bt2</button>
      <button onClick={props.onClose}>Close</button>
    </div>
  )
}
