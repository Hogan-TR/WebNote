import { useEffect } from 'react'

export default function App() {
  useEffect(() => {
    console.log('contet view loaded')
  }, [])

  return <div className="content-view"></div>
}
