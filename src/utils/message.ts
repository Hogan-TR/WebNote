export const sendPopupMsg = (message: any) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
    if (tabs.length == 0) {
      return
    }
    const tab = tabs[0]
    if (!/^(chrome|edge)/.test(tab.url as string)) {
      chrome.tabs.sendMessage(tab.id as number, message, (response: any) => {
        console.debug('[popup] msg response -', response)
      })
    }
  })
}
