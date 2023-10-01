import { useState } from 'react'
import { Selected } from '../../interface'
import FuncButton from './funcBtn'
import ColorButton from './colorBtn'

interface MarkerProps {
  selected: Selected
  onClose: () => void
}

export default function Panel(props: MarkerProps) {
  const [isColorPanel, setIsColorPanel] = useState<boolean>(false)

  const handleClick = () => {
    console.log('trigger button clicked')
  }

  const handleHlLongPress = () => {
    setIsColorPanel(true)
    console.log('trigger color button long pressed')
  }

  const funcs = ['hl', 'bold', 'italicize', 'underline', 'strike_through', 'wn_comment']
  const funcButtons = funcs.map((func, index) => {
    if (index === 0) {
      return (
        <FuncButton key={index} name={func} onClick={handleClick} onLongPress={handleHlLongPress} pressDuration={500} />
      )
    } else {
      return <FuncButton key={index} name={func} onClick={handleClick} />
    }
  })

  const colors = ['#FFF59D', '#B39DDB', '#B3E5FC', '#A5D6A7', '#Ef9A9A']
  const colorButtons = colors.map((color, index) => {
    return <ColorButton key={index} color={color} onClick={handleClick} />
  })

  return (
    <div
      className={isColorPanel ? 'color-bar' : 'note-bar'}
      style={{
        position: 'absolute',
        top: props.selected.bottom,
        left: props.selected.left,
        zIndex: 9999,
      }}
    >
      {isColorPanel ? colorButtons : funcButtons}
    </div>
  )
}
