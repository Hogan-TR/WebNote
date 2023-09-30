import { useCallback, useEffect, useState, useRef } from 'react'
import { Selected } from '../../interface'
import Icon from './Icon'

interface MarkerProps {
  selected: Selected
  onClose: () => void
}

export default function Panel(props: MarkerProps) {
  const funcs = ['hl', 'bold', 'italicize', 'underline', 'strike_through', 'wn_comment']
  const icon_path = [
    <>
      <path d="M12 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
      <path
        fillRule="evenodd"
        d="M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"
      />
    </>,
    <path d="M8.21 13c2.106 0 3.412-1.087 3.412-2.823 0-1.306-.984-2.283-2.324-2.386v-.055a2.176 2.176 0 0 0 1.852-2.14c0-1.51-1.162-2.46-3.014-2.46H3.843V13H8.21zM5.908 4.674h1.696c.963 0 1.517.451 1.517 1.244 0 .834-.629 1.32-1.73 1.32H5.908V4.673zm0 6.788V8.598h1.73c1.217 0 1.88.492 1.88 1.415 0 .943-.643 1.449-1.832 1.449H5.907z" />,
    <path d="M7.991 11.674L9.53 4.455c.123-.595.246-.71 1.347-.807l.11-.52H7.211l-.11.52c1.06.096 1.128.212 1.005.807L6.57 11.674c-.123.595-.246.71-1.346.806l-.11.52h3.774l.11-.52c-1.06-.095-1.129-.211-1.006-.806z" />,
    <>
      <path d="M5.313 3.136h-1.23V9.54c0 2.105 1.47 3.623 3.917 3.623s3.917-1.518 3.917-3.623V3.136h-1.23v6.323c0 1.49-.978 2.57-2.687 2.57-1.709 0-2.687-1.08-2.687-2.57V3.136z" />
      <path fillRule="evenodd" d="M12.5 15h-9v-1h9v1z" />
    </>,
    <>
      <path d="M8.527 13.164c-2.153 0-3.589-1.107-3.705-2.81h1.23c.144 1.06 1.129 1.703 2.544 1.703 1.34 0 2.31-.705 2.31-1.675 0-.827-.547-1.374-1.914-1.675L8.046 8.5h3.45c.468.437.675.994.675 1.697 0 1.826-1.436 2.967-3.644 2.967zM6.602 6.5H5.167a2.776 2.776 0 0 1-.099-.76c0-1.627 1.436-2.768 3.48-2.768 1.969 0 3.39 1.175 3.445 2.85h-1.23c-.11-1.08-.964-1.743-2.25-1.743-1.23 0-2.18.602-2.18 1.607 0 .31.083.581.27.814z" />
      <path fillRule="evenodd" d="M15 8.5H1v-1h14v1z" />
    </>,
    <>
      <path
        fillRule="evenodd"
        d="M14 1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2.5a2 2 0 0 1 1.6.8L8 14.333 9.9 11.8a2 2 0 0 1 1.6-.8H14a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 0a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2.5a1 1 0 0 1 .8.4l1.9 2.533a1 1 0 0 0 1.6 0l1.9-2.533a1 1 0 0 1 .8-.4H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"
      />
      <path d="M5 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
    </>,
  ]

  const timeoutRef = useRef<number | undefined>(undefined)
  const [isLongPress, setIsLongPress] = useState<boolean>(false)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log(`Button ${event.currentTarget.textContent} clicked`)
  }

  const handleMouseDown = () => {
    setIsLongPress(false)
    timeoutRef.current = setTimeout(() => {
      console.log('trigger long press')
      setIsLongPress(true)
    }, 500)
  }

  const handleMouseUp = () => {
    clearTimeout(timeoutRef.current)
    if (!isLongPress) {
      console.log('trigger onClick')
    }
  }

  const buttons = funcs.map((name, index) => {
    if (index === 0) {
      return (
        <button
          type="button"
          className="wn-btn"
          value={name}
          key={index}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          <Icon>{icon_path[0]}</Icon>
        </button>
      )
    } else {
      return (
        <button type="button" className="wn-btn" value={name} key={index} onClick={handleClick}>
          <Icon>{icon_path[index]}</Icon>
        </button>
      )
    }
  })

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      const target = event.target as HTMLElement
      console.log(`[mousedown] ${target.closest('.note-bar') ? 'inside' : 'outside'} panel`)
      if (!target.closest('.note-bar')) {
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
      className="note-bar"
      style={{
        position: 'absolute',
        top: props.selected.bottom,
        left: props.selected.left,
      }}
    >
      {buttons}
    </div>
  )
}
