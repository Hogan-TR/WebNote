export default function Icon(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 16 16" fill={props.color} xmlns="http://www.w3.org/2000/svg">
      {props.children}
    </svg>
  )
}
