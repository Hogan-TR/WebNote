console.info('chrome-ext template-react-ts content script')

export {}

import('./components')

// inject srcipt
try {
  let insertScript = document.createElement('script')
  insertScript.setAttribute('type', 'text/javascript')
  insertScript.src = window.chrome.runtime.getURL('src/pages/content/inject.js')
  document.body.append(insertScript)
} catch (err) {
  console.error(err)
}
