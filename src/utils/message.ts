// send single message to other components or extensions, except for content-scripts
export const sendMessage = (message: any) => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response: any) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      } else {
        resolve(response)
      }
    })
  })
}

// send single message to content-scripts in the specified tab
export const sendMsgToTab = (tabId: number, message: any) => {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response: any) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      } else {
        resolve(response)
      }
    })
  })
}

// send message to the active tab using 'sendMsgToTab'
export const sendMsgToActiveTab = async (message: any) => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  if (tabs.length == 0) {
    return
  }
  const tab = tabs[0]
  if (!/^(chrome|edge)/.test(tab.url as string)) {
    return await sendMsgToTab(tab.id as number, message)
  }
}
