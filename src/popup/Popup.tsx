import { sendMsgToActiveTab } from '../utils/message'
import { useEffect, useState } from 'react'
import { PopupMsg } from '../interface'
import './Popup.css'

function App() {
  const [enable, setEnable] = useState<boolean>(false)

  useEffect(() => {
    const getStatus = async () => {
      const msg: PopupMsg = {
        type: 'query_status',
      }
      // TODO: try-catch
      const result = (await sendMsgToActiveTab(msg)) as boolean
      setEnable(result)
      console.log(`current enabled status: ${result}`)
    }
    getStatus()
  }, [])

  const handleCheckBox = async () => {
    const status = !enable
    setEnable(status)
    const msg: PopupMsg = {
      type: 'change_status',
      payload: {
        enable: status,
      },
    }
    await sendMsgToActiveTab(msg)
  }

  const handleButton = async () => {
    setEnable(false)
    const msg: PopupMsg = {
      type: 'clear_notes',
    }
    await sendMsgToActiveTab(msg)
  }

  return (
    <>
      <div className="switch-box">
        <span>{chrome.i18n.getMessage('function_switch')}</span>
        <input
          className="mui-switch mui-switch-anim"
          type="checkbox"
          id="switch-input"
          checked={enable}
          onChange={handleCheckBox}
        />
      </div>
      <div className="clear-box">
        <button id="clear-button" onClick={handleButton}>
          {chrome.i18n.getMessage('clear_notes')}
        </button>
      </div>
    </>
  )
}

export default App
