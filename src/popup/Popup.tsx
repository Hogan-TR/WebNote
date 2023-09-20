import './Popup.css'
import { sendPopupMsg } from '../utils/message'

function App() {
  const handleCheckBox = () => {
    sendPopupMsg('switch button clicked')
  }

  const handleButton = () => {
    sendPopupMsg('clear button clicked')
  }

  return (
    <>
      <div className="switch-box">
        <span>{chrome.i18n.getMessage('function_switch')}</span>
        <input className="mui-switch mui-switch-anim" type="checkbox" id="switch-input" onClick={handleCheckBox} />
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
