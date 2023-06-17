import ReactDOM from 'react-dom/client'
import Content from './Content'
// @ts-ignore
import mainWorld from './inject?script&module'

console.info('chrome-ext template-react-ts content script')

// content view dom
const root = document.createElement('div')
root.id = 'content-view-container'
document.body.append(root)
ReactDOM.createRoot(root).render(<Content />)

// main world inject script
try {
  let injectScript = document.createElement('script')
  injectScript.setAttribute('type', 'text/javascript')
  injectScript.src = window.chrome.runtime.getURL(mainWorld)
  document.head.append(injectScript)
} catch (err) {
  console.error(err)
}

export {}
