import ReactDOM from 'react-dom/client'
import Content from './Content'
// @ts-ignore
import mainWorld from './inject?script&module'

// unique identifier for current page, used as the key in storage map
const uri = window.location.href.replace(window.location.hash, '')
// content view dom
const root = document.createElement('div')
root.id = 'content-view-container'
document.body.append(root)
ReactDOM.createRoot(root).render(<Content uri={uri} />)

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
