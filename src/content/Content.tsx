import { useEffect } from 'react'

export default function Content() {
  useEffect(() => {
    console.info('content view loaded')
  })

  return <div>Content View</div>
}
