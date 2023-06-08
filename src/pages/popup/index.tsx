import React from 'react'
import ReactDOM from 'react-dom/client'
import Popup from '@pages/popup/Popup'
import '@pages/popup/index.css'

ReactDOM.createRoot(document.getElementById('app-container') as HTMLElement).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
)
