import { createRoot } from 'react-dom/client'
import App from '@pages/content/components/app'

const root = document.createElement('div')
root.id = 'chrome-extension-content-script-container'
document.body.append(root)

createRoot(root).render(<App />)
