// import React, { useState, useEffect } from 'react'
// import axios from 'axios'
// import { useAuthContext } from '../../Hooks/useAuthContext'
// import './UISettingsStyles.css'

// const UISettings = () => {
//   const { user } = useAuthContext()
//   const [settings, setSettings] = useState({
//     headerColor: '#2C4A6E',
//     buttonColor: '#2C4A6E',
//     backgroundColor: '#FFFFFF',
//     welcomeMessage: '👋 Want to chat about Hubly? I\'m an chatbot here to help you find your way.',
//     customMessage: 'Thank You! We\'ll get back to you soon.',
//     missedChatTimerEnabled: true
//   })
//   const [loading, setLoading] = useState(true)
//   const [saving, setSaving] = useState(false)
//   const [saveMessage, setSaveMessage] = useState('')
//   const [editingField, setEditingField] = useState(null)

//   // Fetch current settings on component mount
//   useEffect(() => {
//     fetchSettings()
//   }, [])

//   const fetchSettings = async () => {
//     try {
//       setLoading(true)
//       const response = await axios.get('http://localhost:4000/api/ui-settings')
//       if (response.data.success) {
//         setSettings(response.data.settings)
//       }
//     } catch (error) {
//       console.log('Error fetching UI settings:', error.message)
//       // Use default settings if fetch fails
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleInputChange = (field, value) => {
//     setSettings(prev => ({
//       ...prev,
//       [field]: value
//     }))
//   }

//   const handleColorChange = (field, value) => {
//     setSettings(prev => ({
//       ...prev,
//       [field]: value
//     }))
//   }

//   const saveSettings = async () => {
//     try {
//       setSaving(true)
//       setSaveMessage('')

//       const response = await axios.put(
//         'http://localhost:4000/api/ui-settings',
//         settings
//       )

//       if (response.data.success) {
//         setSaveMessage('Settings saved successfully!')
//         setEditingField(null)
//         setTimeout(() => setSaveMessage(''), 3000)
//       }
//     } catch (error) {
//       console.log('Error saving settings:', error.message)
//       setSaveMessage('Error saving settings. Please try again.')
//     } finally {
//       setSaving(false)
//     }
//   }

//   const resetToDefaults = async () => {
//     if (window.confirm('Are you sure you want to reset to default settings?')) {
//       try {
//         setSaving(true)
//         const response = await axios.post('http://localhost:4000/api/ui-settings/reset')
        
//         if (response.data.success) {
//           setSettings(response.data.settings)
//           setSaveMessage('Settings reset to defaults!')
//           setTimeout(() => setSaveMessage(''), 3000)
//         }
//       } catch (error) {
//         console.log('Error resetting settings:', error.message)
//         setSaveMessage('Error resetting settings.')
//       } finally {
//         setSaving(false)
//       }
//     }
//   }

//   // Authorization check
//   if (!user || !user.isAdmin) {
//     return <div className="unauthorized">Admin access only</div>
//   }

//   if (loading) {
//     return <div className="ui-settings-loading">Loading settings...</div>
//   }

//   return (
//     <div className="ui-settings-container">
//       <div className="ui-settings-header">
//         <h1>Chat Widget Customization</h1>
//         <p>Customize the appearance and messages of your chat widget</p>
//       </div>

//       {saveMessage && (
//         <div className={`save-message ${saveMessage.includes('Error') ? 'error' : 'success'}`}>
//           {saveMessage}
//         </div>
//       )}

//       <div className="ui-settings-content">
        
//         {/* Color Settings Section */}
//         <div className="settings-section">
//           <div className="section-header">
//             <h2>🎨 Color Customization</h2>
//           </div>

//           <div className="settings-grid">
            
//             {/* Header Color - Enum Dropdown */}
//             <div className="setting-card">
//               <div className="card-header">
//                 <h3>Header Color</h3>
//                 <span className="card-label">Chat modal header & buttons</span>
//               </div>
              
//               <div className="select-wrapper">
//                 <select
//                   value={settings.headerColor}
//                   onChange={(e) => handleColorChange('headerColor', e.target.value)}
//                   className="color-select"
//                 >
//                   <option value="#2C4A6E">Dark Blue (#2C4A6E)</option>
//                   <option value="#1f3350">Darker Blue (#1f3350)</option>
//                   <option value="#000000">Black (#000000)</option>
//                   <option value="#FF0000">Red (#FF0000)</option>
//                   <option value="#008000">Green (#008000)</option>
//                   <option value="#800080">Purple (#800080)</option>
//                   <option value="#FFA500">Orange (#FFA500)</option>
//                 </select>
//               </div>

//               {/* Live Preview */}
//               <div className="preview-box">
//                 <div 
//                   className="preview-header" 
//                   style={{ backgroundColor: settings.headerColor }}
//                 >
//                   <span>Hubly</span>
//                 </div>
//               </div>
//             </div>

//             {/* Custom Color Heading - Enum Dropdown */}
//             <div className="setting-card">
//               <div className="card-header">
//                 <h3>Custom Color Theme</h3>
//                 <span className="card-label">Overall color scheme preset</span>
//               </div>
              
//               <div className="select-wrapper">
//                 <select
//                   value={settings.customColorHeading}
//                   onChange={(e) => handleColorChange('customColorHeading', e.target.value)}
//                   className="color-select"
//                 >
//                   <option value="primary">Primary</option>
//                   <option value="secondary">Secondary</option>
//                   <option value="success">Success</option>
//                   <option value="danger">Danger</option>
//                   <option value="warning">Warning</option>
//                   <option value="info">Info</option>
//                   <option value="dark">Dark</option>
//                   <option value="light">Light</option>
//                 </select>
//               </div>

//               {/* Theme Description */}
//               <div className="preview-box">
//                 <div className="theme-description">
//                   Theme: <strong>{settings.customColorHeading}</strong>
//                 </div>
//               </div>
//             </div>

//             {/* Button Color */}
//             <div className="setting-card">
//               <div className="card-header">
//                 <h3>Button Color</h3>
//                 <span className="card-label">Submit button & send button</span>
//               </div>
              
//               <div className="color-picker-wrapper">
//                 <div className="color-input-group">
//                   <input
//                     type="color"
//                     value={settings.buttonColor}
//                     onChange={(e) => handleColorChange('buttonColor', e.target.value)}
//                     className="color-picker"
//                   />
//                   <input
//                     type="text"
//                     value={settings.buttonColor}
//                     onChange={(e) => handleColorChange('buttonColor', e.target.value)}
//                     placeholder="#2C4A6E"
//                     className="color-text-input"
//                   />
//                 </div>

//                 {/* Color Presets */}
//                 <div className="color-presets">
//                   <button
//                     className={`preset-color black ${settings.buttonColor === '#000000' ? 'active' : ''}`}
//                     style={{ backgroundColor: '#000000' }}
//                     onClick={() => handleColorChange('buttonColor', '#000000')}
//                     title="Black"
//                   />
//                   <button
//                     className={`preset-color blue ${settings.buttonColor === '#2C4A6E' ? 'active' : ''}`}
//                     style={{ backgroundColor: '#2C4A6E' }}
//                     onClick={() => handleColorChange('buttonColor', '#2C4A6E')}
//                     title="Blue"
//                   />
//                   <button
//                     className={`preset-color light ${settings.buttonColor === '#FFFFFF' ? 'active' : ''}`}
//                     style={{ backgroundColor: '#FFFFFF', border: '2px solid #ddd' }}
//                     onClick={() => handleColorChange('buttonColor', '#FFFFFF')}
//                     title="White"
//                   />
//                 </div>
//               </div>

//               {/* Live Preview */}
//               <div className="preview-box">
//                 <button 
//                   className="preview-button"
//                   style={{ backgroundColor: settings.buttonColor }}
//                 >
//                   Thank You!
//                 </button>
//               </div>
//             </div>

//             {/* Background Color */}
//             <div className="setting-card">
//               <div className="card-header">
//                 <h3>Background Color</h3>
//                 <span className="card-label">Chat message background</span>
//               </div>
              
//               <div className="color-picker-wrapper">
//                 <div className="color-input-group">
//                   <input
//                     type="color"
//                     value={settings.backgroundColor}
//                     onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
//                     className="color-picker"
//                   />
//                   <input
//                     type="text"
//                     value={settings.backgroundColor}
//                     onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
//                     placeholder="#FFFFFF"
//                     className="color-text-input"
//                   />
//                 </div>

//                 {/* Color Presets */}
//                 <div className="color-presets">
//                   <button
//                     className={`preset-color black ${settings.backgroundColor === '#000000' ? 'active' : ''}`}
//                     style={{ backgroundColor: '#000000' }}
//                     onClick={() => handleColorChange('backgroundColor', '#000000')}
//                     title="Black"
//                   />
//                   <button
//                     className={`preset-color white ${settings.backgroundColor === '#FFFFFF' ? 'active' : ''}`}
//                     style={{ backgroundColor: '#FFFFFF', border: '2px solid #ddd' }}
//                     onClick={() => handleColorChange('backgroundColor', '#FFFFFF')}
//                     title="White"
//                   />
//                   <button
//                     className={`preset-color light ${settings.backgroundColor === '#F5F5F5' ? 'active' : ''}`}
//                     style={{ backgroundColor: '#F5F5F5' }}
//                     onClick={() => handleColorChange('backgroundColor', '#F5F5F5')}
//                     title="Light Gray"
//                   />
//                 </div>
//               </div>

//               {/* Live Preview */}
//               <div className="preview-box">
//                 <div 
//                   className="preview-message" 
//                   style={{ backgroundColor: settings.backgroundColor }}
//                 >
//                   How can I help you?
//                 </div>
//               </div>
//             </div>

//           </div>
//         </div>

//         {/* Text Settings Section */}
//         <div className="settings-section">
//           <div className="section-header">
//             <h2>💬 Message Customization</h2>
//           </div>

//           <div className="settings-grid">
            
//             {/* Welcome Message */}
//             <div className="setting-card full-width">
//               <div className="card-header">
//                 <h3>Welcome Message</h3>
//                 <span className="card-label">
//                   Displayed when chat widget first appears ({settings.welcomeMessage.length}/200 characters)
//                 </span>
//               </div>
              
//               <div className="text-input-wrapper">
//                 <textarea
//                   value={settings.welcomeMessage}
//                   onChange={(e) => {
//                     if (e.target.value.length <= 200) {
//                       handleInputChange('welcomeMessage', e.target.value)
//                     }
//                   }}
//                   maxLength={200}
//                   className="message-textarea"
//                   placeholder="Enter welcome message"
//                   rows={3}
//                 />
//               </div>

//               {/* Live Preview */}
//               <div className="preview-box">
//                 <div className="preview-welcome-message">
//                   {settings.welcomeMessage}
//                 </div>
//               </div>
//             </div>

//             {/* Custom Message After Form Submit */}
//             <div className="setting-card full-width">
//               <div className="card-header">
//                 <h3>Form Submission Message</h3>
//                 <span className="card-label">
//                   Message shown after user submits the form ({settings.customMessage.length}/200 characters)
//                 </span>
//               </div>
              
//               <div className="text-input-wrapper">
//                 <textarea
//                   value={settings.customMessage}
//                   onChange={(e) => {
//                     if (e.target.value.length <= 200) {
//                       handleInputChange('customMessage', e.target.value)
//                     }
//                   }}
//                   maxLength={200}
//                   className="message-textarea"
//                   placeholder="Enter custom message"
//                   rows={3}
//                 />
//               </div>

//               {/* Live Preview */}
//               <div className="preview-box">
//                 <div className="preview-custom-message">
//                   {settings.customMessage}
//                 </div>
//               </div>
//             </div>

//           </div>
//         </div>

//         {/* Advanced Settings Section */}
//         <div className="settings-section">
//           <div className="section-header">
//             <h2>⚙️ Advanced Settings</h2>
//           </div>

//           <div className="settings-grid">
            
//             {/* Missed Chat Timer */}
//             <div className="setting-card">
//               <div className="card-header">
//                 <h3>Missed Chat Timer</h3>
//                 <span className="card-label">
//                   Shows time elapsed since first message was sent
//                 </span>
//               </div>
              
//               <div className="toggle-wrapper">
//                 <label className="toggle-switch">
//                   <input
//                     type="checkbox"
//                     checked={settings.missedChatTimerEnabled}
//                     onChange={(e) => handleInputChange('missedChatTimerEnabled', e.target.checked)}
//                   />
//                   <span className="slider"></span>
//                 </label>
//                 <span className="toggle-label">
//                   {settings.missedChatTimerEnabled ? 'Enabled' : 'Disabled'}
//                 </span>
//               </div>

//               {/* Live Preview */}
//               {settings.missedChatTimerEnabled && (
//                 <div className="preview-box">
//                   <div className="preview-timer">
//                     <div className="timer-label">Missed chat timer</div>
//                     <div className="timer-display">
//                       <span>12 : 45 : 30</span>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="settings-actions">
//           <button
//             className="btn btn-primary"
//             onClick={saveSettings}
//             disabled={saving}
//           >
//             {saving ? 'Saving...' : '💾 Save Changes'}
//           </button>
//           <button
//             className="btn btn-secondary"
//             onClick={resetToDefaults}
//             disabled={saving}
//           >
//             🔄 Reset to Defaults
//           </button>
//         </div>

//       </div>
//     </div>
//   )
// }

// export default UISettings








import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useAuthContext } from '../../Hooks/useAuthContext'
import './UISettingsStyles.css'
import hublyIconImage from "../../Assets/CommonAssets/hublyIconImage.png";

const UISettings = () => {
  const { user } = useAuthContext()
  const [settings, setSettings] = useState({
    headerColor: '#2C4A6E',
    backgroundColor: '#FFFFFF',
    welcomeMessages: [
      'How can I help you?',
      'Ask me anything!'
    ],
    customMessage: 'Thank You! We\'ll get back to you soon.',
    customerFormFields: [
      { label: 'Your name', placeholder: 'Your name' },
      { label: 'Your Phone', placeholder: '+1 (000) 000-0000' },
      { label: 'Your Email', placeholder: 'example@gmail.com' }
    ],
    missedChatTimerEnabled: true,
    missedChatTimerData: {
      days: '12',
      hours: '09',
      minutes: '59',
      seconds: '00'
    },
    welcomeMessage: '👋 Want to chat about Hubly? I\'m an chatbot here to help you find your way.' // Added for message box
  })
  const [loading, setLoading] = useState(true)
  const [savingState, setSavingState] = useState(null)
  const debounceTimer = useRef(null)
  const [editingMessages, setEditingMessages] = useState({})

  // Fetch current settings on component mount
  useEffect(() => {
    fetchSettings()
  }, [])

  // Debounced auto-save on settings change
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      saveSettingsToBackend()
    }, 800)

    return () => clearTimeout(debounceTimer.current)
  }, [settings])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:4000/api/ui-settings')
      if (response.data.success) {
        setSettings(response.data.settings)
      }
    } catch (error) {
      console.log('Error fetching UI settings:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const saveSettingsToBackend = async () => {
    try {
      setSavingState('saving')
      const response = await axios.put(
        'http://localhost:4000/api/ui-settings',
        settings
      )

      if (response.data.success) {
        setSavingState('saved')
        setTimeout(() => setSavingState(null), 2000)
      }
    } catch (error) {
      console.log('Error saving settings:', error.message)
      setSavingState('error')
      setTimeout(() => setSavingState(null), 3000)
    }
  }

  const handleHeaderColorChange = (color) => {
    setSettings(prev => ({
      ...prev,
      headerColor: color
    }))
  }

  const handleBackgroundColorChange = (color) => {
    setSettings(prev => ({
      ...prev,
      backgroundColor: color
    }))
  }

  const handleWelcomeMessageChange = (index, value) => {
    const newMessages = [...settings.welcomeMessages]
    newMessages[index] = value
    setSettings(prev => ({
      ...prev,
      welcomeMessages: newMessages
    }))
  }

  const handleCustomMessageChange = (value) => {
    setSettings(prev => ({
      ...prev,
      customMessage: value
    }))
  }

  const handleWelcomeMessageBoxChange = (value) => {
    setSettings(prev => ({
      ...prev,
      welcomeMessage: value
    }))
  }

  const handleFormFieldChange = (index, field, value) => {
    const newFields = [...settings.customerFormFields]
    newFields[index] = {
      ...newFields[index],
      [field]: value
    }
    setSettings(prev => ({
      ...prev,
      customerFormFields: newFields
    }))
  }

  const handleTimerToggle = () => {
    setSettings(prev => ({
      ...prev,
      missedChatTimerEnabled: !prev.missedChatTimerEnabled
    }))
  }

  const handleTimerChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      missedChatTimerData: {
        ...prev.missedChatTimerData,
        [field]: value
      }
    }))
  }

  // Authorization check
  if (!user || !user.isAdmin) {
    return <div className="unauthorized">Admin access only</div>
  }

  if (loading) {
    return <div className="ui-settings-loading">Loading settings...</div>
  }

  return (
    <div className="ui-settings-wrapper">
      {/* Left Side - Chat Widget Display (Actual MessageForm UI) */}
      <div className="ui-settings-left">
        <div className="chat-widget-container">
          {/* Message Box - Shows welcome message */}
          <div className="message-box">
            <img 
              src={hublyIconImage} 
              alt="Hubly" 
              className="message-box-icon"
            />
            <span>{settings.welcomeMessage}</span>
            <button className="message-box-close">✕</button>
          </div>

          {/* Chat Modal - Full chat widget preview */}
          <div className="chat-modal">
            {/* Header */}
            <div className="chat-modal-header" style={{ backgroundColor: settings.headerColor }}>
              <div className="header-content">
                <img 
                  src={hublyIconImage} 
                  alt="Hubly" 
                  className="hubly-icon"
                />
                <span className="hubly-title">Hubly</span>
              </div>
              <button className="close-btn">✕</button>
            </div>

            {/* Messages Container */}
            <div className="messages-container" style={{ backgroundColor: settings.backgroundColor }}>
              {/* Welcome Messages */}
              {settings.welcomeMessages.map((msg, idx) => (
                <div key={idx} className="bot-message-wrapper">
                  <img 
                    src={hublyIconImage}
                    alt="Hubly" 
                    className="bot-icon"
                  />
                  <div className="bot-message">
                    {msg}
                  </div>
                </div>
              ))}

              {/* Form */}
              <div className="form-message">
                <div className="form-title">Introduce Yourself</div>
                
                {settings.customerFormFields.map((field, idx) => (
                  <div key={idx} className="form-group">
                    <label>{field.label}</label>
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      disabled
                    />
                  </div>
                ))}

                <button 
                  className="form-submit-btn"
                  style={{ backgroundColor: settings.headerColor }}
                >
                  Thank You!
                </button>
              </div>

              {/* Success Message */}
              <div className="bot-message-wrapper">
                <img 
                  src={hublyIconImage}
                  alt="Hubly" 
                  className="bot-icon"
                />
                <div className="bot-message">
                  {settings.customMessage}
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="message-input-container">
              <input 
                type="text"
                className="message-input"
                placeholder="Write a message"
                disabled
              />
              <button 
                className="send-btn"
                style={{ backgroundColor: settings.headerColor }}
                disabled
              >
                ➤
              </button>
            </div>
          </div>
        </div>

        {/* Saving Indicator */}
        {savingState && (
          <div className={`saving-indicator ${savingState}`}>
            {savingState === 'saving' && '💾 Saving...'}
            {savingState === 'saved' && '✓ Saved'}
            {savingState === 'error' && '✗ Error saving'}
          </div>
        )}
      </div>

      {/* Right Side - Settings Panel */}
      <div className="ui-settings-right">
        <div className="settings-scroll-container">
          {/* 1. Header Color */}
          <div className="setting-card">
            <h3 className="card-title">Header Color</h3>
            <div className="color-preset-group">
              <button 
                className={`color-circle ${settings.headerColor === '#FFFFFF' ? 'active' : ''}`}
                style={{ backgroundColor: '#FFFFFF', border: '2px solid #ddd' }}
                onClick={() => handleHeaderColorChange('#FFFFFF')}
                title="White"
              />
              <button 
                className={`color-circle ${settings.headerColor === '#000000' ? 'active' : ''}`}
                style={{ backgroundColor: '#000000' }}
                onClick={() => handleHeaderColorChange('#000000')}
                title="Black"
              />
              <button 
                className={`color-circle ${settings.headerColor === '#2C4A6E' ? 'active' : ''}`}
                style={{ backgroundColor: '#2C4A6E' }}
                onClick={() => handleHeaderColorChange('#2C4A6E')}
                title="Blue"
              />
            </div>
            <div className="color-selected-box">
              <div 
                className="color-selected-preview"
                style={{ backgroundColor: settings.headerColor }}
              />
              <span className="color-selected-text">{settings.headerColor}</span>
            </div>
          </div>

          {/* 2. Background Color */}
          <div className="setting-card">
            <h3 className="card-title">Custom Background Color</h3>
            <div className="color-preset-group">
              <button 
                className={`color-circle ${settings.backgroundColor === '#FFFFFF' ? 'active' : ''}`}
                style={{ backgroundColor: '#FFFFFF', border: '2px solid #ddd' }}
                onClick={() => handleBackgroundColorChange('#FFFFFF')}
                title="White"
              />
              <button 
                className={`color-circle ${settings.backgroundColor === '#000000' ? 'active' : ''}`}
                style={{ backgroundColor: '#000000' }}
                onClick={() => handleBackgroundColorChange('#000000')}
                title="Black"
              />
              <button 
                className={`color-circle ${settings.backgroundColor === '#F5F5F5' ? 'active' : ''}`}
                style={{ backgroundColor: '#F5F5F5' }}
                onClick={() => handleBackgroundColorChange('#F5F5F5')}
                title="Light Gray"
              />
            </div>
            <div className="color-selected-box">
              <div 
                className="color-selected-preview"
                style={{ backgroundColor: settings.backgroundColor }}
              />
              <span className="color-selected-text">{settings.backgroundColor}</span>
            </div>
          </div>

          {/* 3. Customize Messages */}
          <div className="setting-card">
            <h3 className="card-title">Customize Message</h3>
            <div className="message-list">
              {settings.welcomeMessages.map((msg, idx) => (
                <div key={idx} className="message-item-edit">
                  <textarea
                    value={msg}
                    onChange={(e) => handleWelcomeMessageChange(idx, e.target.value)}
                    className="message-edit-textarea"
                    rows={2}
                  />
                  <span className="edit-icon">✏️</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Introduction Form */}
          <div className="setting-card">
            <h3 className="card-title">Introduction Form</h3>
            <div className="form-fields-list">
              {settings.customerFormFields.map((field, idx) => (
                <div key={idx} className="form-field-item">
                  <label className="field-label">{field.label}</label>
                  <input
                    type="text"
                    className="field-input"
                    value={field.placeholder}
                    onChange={(e) => handleFormFieldChange(idx, 'placeholder', e.target.value)}
                    placeholder="Field placeholder"
                  />
                </div>
              ))}
            </div>
            <button className="form-btn" style={{ backgroundColor: settings.headerColor }}>
              Thank You!
            </button>
          </div>

          {/* 5. Welcome Message (For Message Box) */}
          <div className="setting-card">
            <h3 className="card-title">Welcome Message</h3>
            <div className="message-box-header">
              <span className="char-count">{settings.welcomeMessage.length}/200</span>
            </div>
            <textarea
              value={settings.welcomeMessage}
              onChange={(e) => {
                if (e.target.value.length <= 200) {
                  handleWelcomeMessageBoxChange(e.target.value)
                }
              }}
              maxLength={200}
              className="welcome-textarea"
              rows={4}
              placeholder="Enter welcome message for message box"
            />
          </div>

          {/* 6. Custom Success Message */}
          <div className="setting-card">
            <h3 className="card-title">Success Message</h3>
            <div className="message-box-header">
              <span className="char-count">{settings.customMessage.length}/200</span>
            </div>
            <textarea
              value={settings.customMessage}
              onChange={(e) => {
                if (e.target.value.length <= 200) {
                  handleCustomMessageChange(e.target.value)
                }
              }}
              maxLength={200}
              className="welcome-textarea"
              rows={4}
              placeholder="Enter success message"
            />
          </div>

          {/* 7. Missed Chat Timer */}
          <div className="setting-card">
            <h3 className="card-title">Missed chat timer</h3>
            <div className="timer-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={settings.missedChatTimerEnabled}
                  onChange={handleTimerToggle}
                  className="toggle-input"
                />
                <span className="toggle-slider"></span>
              </label>
              <span className="toggle-text">
                {settings.missedChatTimerEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            {settings.missedChatTimerEnabled && (
              <div className="timer-display">
                <div className="timer-row">
                  <div className="timer-input-group">
                    <input
                      type="number"
                      value={settings.missedChatTimerData.days}
                      onChange={(e) => handleTimerChange('days', e.target.value)}
                      className="timer-input"
                      min="0"
                    />
                    <span className="timer-label">Days</span>
                  </div>
                  <span className="timer-separator">:</span>
                  <div className="timer-input-group">
                    <input
                      type="number"
                      value={settings.missedChatTimerData.hours}
                      onChange={(e) => handleTimerChange('hours', e.target.value)}
                      className="timer-input"
                      min="0"
                      max="23"
                    />
                    <span className="timer-label">Hours</span>
                  </div>
                  <span className="timer-separator">:</span>
                  <div className="timer-input-group">
                    <input
                      type="number"
                      value={settings.missedChatTimerData.minutes}
                      onChange={(e) => handleTimerChange('minutes', e.target.value)}
                      className="timer-input"
                      min="0"
                      max="59"
                    />
                    <span className="timer-label">Minutes</span>
                  </div>
                </div>
                <div className="timer-row">
                  <div className="timer-input-group">
                    <input
                      type="number"
                      value={settings.missedChatTimerData.seconds}
                      onChange={(e) => handleTimerChange('seconds', e.target.value)}
                      className="timer-input"
                      min="0"
                      max="59"
                    />
                    <span className="timer-label">Seconds</span>
                  </div>
                </div>
                <button className="timer-save-btn">Save</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UISettings