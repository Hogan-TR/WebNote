import ReactDOM from 'react-dom/client'
import Content from './Content'
// @ts-ignore
import mainWorld from './inject?script&module'

// receive msg from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.debug('[content script] receive msg -', msg)
  sendResponse(`receive: ${msg}`)
})

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
