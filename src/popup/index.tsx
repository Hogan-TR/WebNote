import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@popup/Popup'

ReactDOM.createRoot(document.getElementById('webnote-extension') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
