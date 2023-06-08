import React from 'react'
import ReactDOM from 'react-dom/client'
import Options from '@pages/options/Options'
import '@pages/options/index.css'

ReactDOM.createRoot(document.getElementById('app-container') as HTMLElement).render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>,
)
