import { useCallback, useEffect, useState } from 'react'
import { MessageHandlers, PopupMsg, Selected, WebNote } from '../interface'
import Panel from './components/Panel'
import ChromeStorage from '../utils/storage'
import './Content.css'

interface ContentProps {
  uri: string
}

export default function Content(props: ContentProps) {
  const { uri } = props
  const storage = new ChromeStorage<WebNote>('sync')
  const [enable, setEnable] = useState<boolean>(false)
  const [selected, setSelected] = useState<Selected | null>(null)

  // load notes data from storage
  useEffect(() => {
    const loadData = async () => {
      const data = await storage.get(uri)
      console.debug(data ? 'true' : 'false', data)
      if (data && data.mark) {
        setEnable(true)
      }
    }
    loadData()
  }, [])

  // receive msg from popup page
  useEffect(() => {
    const messageHandlers: MessageHandlers = {
      query_status: async (sendResponse) => {
        sendResponse(enable)
      },
      change_status: async (sendResponse, payload) => {
        sendResponse('received')
        setEnable(payload.enable)
        const result = await storage.get(uri)
        if (result) {
          result.mark = payload.enable
          await storage.set(uri, result)
          console.log('change enabled status:', result.mark)
        }
      },
      clear_notes: async (sendResponse) => {
        sendResponse('received')
        await storage.remove(uri) // TODO: only clear when with records ?
        console.log('notes cleared of:', uri)
        location.reload()
      },
    }

    const msgHandler = async (
      msg: PopupMsg, // TODO: test invalid msg type
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void,
    ) => {
      console.debug('[content script] receive:', msg)
      const handler = messageHandlers[msg.type]
      if (handler) {
        await handler(sendResponse, msg.payload)
      }
      return true
    }

    // add a listener to the message event
    chrome.runtime.onMessage.addListener(msgHandler)
    // remove listener on unmount
    return () => {
      chrome.runtime.onMessage.removeListener(msgHandler)
    }
  }, [enable]) // TODO: other parameters like uri ?

  // handle object selection change
  const handleSelChange = useCallback(() => {
    // TODO: remove duplicate selection
    const selection = window.getSelection()
    console.debug('[selection change]')
    if (selection && selection.toString() && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      setSelected({
        selection: selection,
        text: selection.toString(),
        bottom: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      })
    }
  }, [])

  useEffect(() => {
    document.addEventListener('mouseup', handleSelChange)
    return () => {
      document.removeEventListener('mouseup', handleSelChange)
    }
  }, [handleSelChange])

  // remove panel from page
  const handleClose = useCallback(() => {
    console.log('[remove pannel]', selected)
    selected?.selection.removeAllRanges()
    setSelected(null)
  }, [selected])

  // trigger handleClose when click outside
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      const target = event.target as HTMLElement
      console.log(`[mousedown] ${target.closest('#content-view-container') ? 'inside' : 'outside'} panel`)
      if (!target.closest('#content-view-container')) {
        handleClose()
      }
    },
    [handleClose],
  )

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handleClickOutside])

  return enable && selected ? <Panel selected={selected} onClose={handleClose} /> : null
}
