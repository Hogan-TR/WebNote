import './Popup.css'

function App() {
  return (
    <>
      <div className="switch-box">
        <span>{chrome.i18n.getMessage('function_switch')}</span>
        <input className="mui-switch mui-switch-anim" type="checkbox" id="switch-input" />
      </div>
      <div className="clear-box">
        <button id="clear-button">{chrome.i18n.getMessage('clear_notes')}</button>
      </div>
    </>
  )
}

export default App
