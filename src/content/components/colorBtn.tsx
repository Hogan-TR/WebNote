import { ComponentProps } from 'react'

export default function ColorButton(props: ComponentProps<'button'>) {
  return (
    <button type="button" className="color-item" value={props.color}>
      <div className="circle" style={{ backgroundColor: props.color }} />
    </button>
  )
}
