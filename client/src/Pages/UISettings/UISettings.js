// import React, { useState, useEffect, useRef, useCallback } from 'react'
// import axios from '../../config/axiosConfig'
// import { useAuthContext } from '../../Hooks/useAuthContext'
// import './UISettingsStyles.css'
// import hublyIconImage from "../../Assets/CommonAssets/hublyIconImage.png";

// const UISettings = () => {
//   const { user } = useAuthContext()
//   const [settings, setSettings] = useState({
//     headerColor: '#33475B',
//     backgroundColor: '#FAFBFC',
//     formPlaceholders: {
//       namePlaceholder: 'Your name',
//       phonePlaceholder: '+1 (000) 000-0000',
//       emailPlaceholder: 'example@gmail.com',
//       buttonText: 'Thank You!'
//     },
//     welcomeMessage: '👋 Want to chat about Hubly? I\'m a chatbot here to help you find your way.',
//     customMessage: 'Thank You! We\'ll get back to you soon.',
//     missedChatTimerEnabled: true,
//   })

//   const [timerMinutes, setTimerMinutes] = useState('20')
//   const [timerSaveState, setTimerSaveState] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [savingState, setSavingState] = useState(null)
//   const debounceTimer = useRef(null)

//   // Fetch settings on component mount
//   useEffect(() => {
//     fetchSettings()
//     fetchTimerSettings()
//   }, [])

//   // Debounced auto-save on settings change
//   const saveSettingsToBackend = useCallback(async () => {
//     try {
//       setSavingState('saving')
//       const response = await axios.put(
//         'http://localhost:4000/api/admin/ui-settings',
//         settings
//       )
//       if (response.data.success) {
//         setSavingState('saved')
//         setTimeout(() => setSavingState(null), 2000)
//       }
//     } catch (error) {
//       console.log('Error saving settings:', error.message)
//       setSavingState('error')
//       setTimeout(() => setSavingState(null), 3000)
//     }
//   }, [settings])

//   // Debounce effect
//   useEffect(() => {
//     if (debounceTimer.current) {
//       clearTimeout(debounceTimer.current)
//     }
//     debounceTimer.current = setTimeout(() => {
//       saveSettingsToBackend()
//     }, 800)
//     return () => clearTimeout(debounceTimer.current)
//   }, [settings, saveSettingsToBackend])

//   const fetchTimerSettings = async () => {
//     try {
//       const response = await axios.get('http://localhost:4000/api/admin/timer-settings')
//       if (response.data.success) {
//         const minutes = response.data.settings.resolutionTimeLimit
//         setTimerMinutes(minutes.toString())
//       }
//     } catch (error) {
//       console.error('Error fetching timer settings:', error.message)
//     }
//   }

//   const fetchSettings = async () => {
//     try {
//       setLoading(true)
//       const response = await axios.get('http://localhost:4000/api/admin/ui-settings')
//       if (response.data.success) {
//         setSettings(response.data.settings)
//       }
//     } catch (error) {
//       console.error('Error fetching UI settings:', error.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const saveTimerSettingsToBackend = async () => {
//     try {
//       setTimerSaveState('saving')
//       const minutesValue = parseInt(timerMinutes, 10)

//       // Validate input
//       if (isNaN(minutesValue) || minutesValue < 1 || minutesValue > 1440) {
//         setTimerSaveState('error')
//         setTimeout(() => setTimerSaveState(null), 3000)
//         return
//       }

//       const response = await axios.patch(
//         'http://localhost:4000/api/admin/timer-settings',
//         { resolutionTimeLimit: minutesValue }
//       )

//       if (response.data.success) {
//         setTimerSaveState('saved')
//         setTimeout(() => setTimerSaveState(null), 2000)
//       }
//     } catch (error) {
//       console.error('Error saving timer settings:', error.message)
//       setTimerSaveState('error')
//       setTimeout(() => setTimerSaveState(null), 3000)
//     }
//   }

//   const handleHeaderColorChange = (color) => {
//     setSettings(prev => ({
//       ...prev,
//       headerColor: color
//     }))
//   }

//   const handleBackgroundColorChange = (color) => {
//     setSettings(prev => ({
//       ...prev,
//       backgroundColor: color
//     }))
//   }

//   const handleFormPlaceholderChange = (field, value) => {
//     setSettings(prev => ({
//       ...prev,
//       formPlaceholders: {
//         ...prev.formPlaceholders,
//         [field]: value
//       }
//     }))
//   }

//   const handleCustomMessageChange = (value) => {
//     setSettings(prev => ({
//       ...prev,
//       customMessage: value
//     }))
//   }

//   const handleWelcomeMessageBoxChange = (value) => {
//     setSettings(prev => ({
//       ...prev,
//       welcomeMessage: value
//     }))
//   }

//   const handleTimerToggle = () => {
//     setSettings(prev => ({
//       ...prev,
//       missedChatTimerEnabled: !prev.missedChatTimerEnabled
//     }))
//   }

//   const handleTimerMinuteChange = (value) => {
//     // Only allow numbers
//     if (value === '' || /^\d+$/.test(value)) {
//       // Limit max to 1440 minutes (24 hours)
//       if (value === '' || parseInt(value, 10) <= 1440) {
//         setTimerMinutes(value)
//       }
//     }
//   }

//   // Authorization check
//   if (!user || !user.isAdmin) {
//     return <div className="ui-unauthorized">Admin access only</div>
//   }

//   if (loading) {
//     return <div className="ui-settings-loading">Loading settings...</div>
//   }

//   return (
//     <div className="ui-settings-wrapper">
//       {/* Left Side - Chat Widget Display */}
//       <div className="ui-settings-left">
//         {/* ═══════════════════════════════════════════════════════════════════ */}
//         {/* CHAT WIDGET PREVIEW */}
//         {/* ═══════════════════════════════════════════════════════════════════ */}

//         {/* Chat Modal - Full chat widget preview */}
//         <div className="ui-chat-modal">
//           {/* Header */}
//           <div className="ui-chat-modal-header" style={{ backgroundColor: settings.headerColor }}>
//             <div className="ui-header-content">
//               <img src={hublyIconImage} alt="Hubly" className="ui-hubly-icon" />
//               <h3 className="ui-hubly-title">Hubly</h3>
//             </div>
//             <button className="ui-close-btn">✕</button>
//           </div>

//           {/* Messages Container - SINGLE CONTAINER WITH ALL CONTENT */}
//           <div className="ui-messages-container">
//             {/* Welcome Message */}
//             <div className="ui-bot-message-wrapper">
//               <div className="ui-bot-message">
//                 {settings.welcomeMessage}
//               </div>
//             </div>

//             {/* ═══════════════════════════════════════════════════════════════════ */}
//             {/* Introduction Form Preview - Inside Messages Container */}
//             {/* ═══════════════════════════════════════════════════════════════════ */}
//             <div className="ui-form-preview-container">
//               <div className="ui-form-preview" style={{ backgroundColor: settings.backgroundColor }}>
//                 {/* Name Field */}
//                 <div className="ui-form-group">
//                   <label className="ui-form-label">Your name</label>
//                   <input
//                     type="text"
//                     className="ui-form-input"
//                     placeholder={settings.formPlaceholders.namePlaceholder}
//                     disabled
//                   />
//                 </div>

//                 {/* Phone Field */}
//                 <div className="ui-form-group">
//                   <label className="ui-form-label">Your Phone</label>
//                   <input
//                     type="tel"
//                     className="ui-form-input"
//                     placeholder={settings.formPlaceholders.phonePlaceholder}
//                     disabled
//                   />
//                 </div>

//                 {/* Email Field */}
//                 <div className="ui-form-group">
//                   <label className="ui-form-label">Your Email</label>
//                   <input
//                     type="email"
//                     className="ui-form-input"
//                     placeholder={settings.formPlaceholders.emailPlaceholder}
//                     disabled
//                   />
//                 </div>

//                 {/* Submit Button */}
//                 <button
//                   className="ui-form-submit-btn"
//                   style={{ backgroundColor: settings.headerColor }}
//                   disabled
//                 >
//                   {settings.formPlaceholders.buttonText}
//                 </button>
//               </div>
//             </div>

//             {/* Success/Custom Message */}
//             <div className="ui-bot-message-wrapper">
//               <div className="ui-bot-message">
//                 {settings.customMessage}
//               </div>
//             </div>

//             {/* Input Area */}
//             <div className="ui-message-input-container">
//               <input
//                 type="text"
//                 className="ui-message-input"
//                 placeholder="Type your message..."
//                 disabled
//               />
//               <button className="ui-send-btn" style={{ backgroundColor: settings.headerColor }}>
//                 ➤
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Message Box - Shows welcome message */}
//         <div className="ui-message-box">
//           <button className="ui-message-box-close">✕</button>
//           <img src={hublyIconImage} alt="Hubly" className="ui-message-box-icon" />
//           {settings.welcomeMessage}
//         </div>

//         {/* Saving Indicator */}
//         {savingState && (
//           <div className={`ui-saving-indicator ${savingState}`}>
//             {savingState === 'saving' && '💾 Saving...'}
//             {savingState === 'saved' && '✓ Saved'}
//             {savingState === 'error' && '✗ Error saving'}
//           </div>
//         )}
//       </div>

//       {/* Right Side - Settings Panel */}
//       <div className="ui-settings-right">
//         <div className="ui-settings-scroll-container">
//           {/* 1. Header Color */}
//           <div className="ui-setting-card">
//             <h3 className="ui-card-title">Header Color</h3>
//             <div className="ui-color-preset-group">
//               <div
//                 className={`ui-color-circle ${settings.headerColor === '#FFFFFF' ? 'active' : ''}`}
//                 style={{ backgroundColor: '#FFFFFF' }}
//                 onClick={() => handleHeaderColorChange('#FFFFFF')}
//                 title="White"
//               />
//               <div
//                 className={`ui-color-circle ${settings.headerColor === '#000000' ? 'active' : ''}`}
//                 style={{ backgroundColor: '#000000' }}
//                 onClick={() => handleHeaderColorChange('#000000')}
//                 title="Black"
//               />
//               <div
//                 className={`ui-color-circle ${settings.headerColor === '#33475B' ? 'active' : ''}`}
//                 style={{ backgroundColor: '#33475B' }}
//                 onClick={() => handleHeaderColorChange('#33475B')}
//                 title="Blue"
//               />
//             </div>
//             <div className="ui-color-selected-box">
//               <div
//                 className="ui-color-selected-preview"
//                 style={{ backgroundColor: settings.headerColor }}
//               />
//               <span className="ui-color-selected-text">{settings.headerColor}</span>
//             </div>
//           </div>

//           {/* 2. Background Color */}
//           <div className="ui-setting-card">
//             <h3 className="ui-card-title">Custom Background Color</h3>
//             <div className="ui-color-preset-group">
//               <div
//                 className={`ui-color-circle ${settings.backgroundColor === '#FFFFFF' ? 'active' : ''}`}
//                 style={{ backgroundColor: '#FFFFFF' }}
//                 onClick={() => handleBackgroundColorChange('#FFFFFF')}
//                 title="White"
//               />
//               <div
//                 className={`ui-color-circle ${settings.backgroundColor === '#000000' ? 'active' : ''}`}
//                 style={{ backgroundColor: '#000000' }}
//                 onClick={() => handleBackgroundColorChange('#000000')}
//                 title="Black"
//               />
//               <div
//                 className={`ui-color-circle ${settings.backgroundColor === '#FAFBFC' ? 'active' : ''}`}
//                 style={{ backgroundColor: '#FAFBFC' }}
//                 onClick={() => handleBackgroundColorChange('#FAFBFC')}
//                 title="Light Gray"
//               />
//             </div>
//             <div className="ui-color-selected-box">
//               <div
//                 className="ui-color-selected-preview"
//                 style={{ backgroundColor: settings.backgroundColor }}
//               />
//               <span className="ui-color-selected-text">{settings.backgroundColor}</span>
//             </div>
//           </div>

//           {/* 3. INTRODUCTION FORM SECTION */}
//           <div className="ui-setting-card">
//             <h3 className="ui-card-title">Introduction Form</h3>

//             {/* Name Placeholder */}
//             <div>
//               <label className="ui-form-label">Name Placeholder</label>
//               <input
//                 type="text"
//                 value={settings.formPlaceholders.namePlaceholder}
//                 onChange={(e) => {
//                   if (e.target.value.length <= 100) {
//                     handleFormPlaceholderChange('namePlaceholder', e.target.value)
//                   }
//                 }}
//                 maxLength={100}
//                 className="ui-form-field-input"
//                 placeholder="e.g., Your name"
//               />
//               <small className="ui-char-count">{settings.formPlaceholders.namePlaceholder.length}/100</small>
//             </div>

//             {/* Phone Placeholder */}
//             <div>
//               <label className="ui-form-label">Phone Placeholder</label>
//               <input
//                 type="text"
//                 value={settings.formPlaceholders.phonePlaceholder}
//                 onChange={(e) => {
//                   if (e.target.value.length <= 100) {
//                     handleFormPlaceholderChange('phonePlaceholder', e.target.value)
//                   }
//                 }}
//                 maxLength={100}
//                 className="ui-form-field-input"
//                 placeholder="e.g., +1 (000) 000-0000"
//               />
//               <small className="ui-char-count">{settings.formPlaceholders.phonePlaceholder.length}/100</small>
//             </div>

//             {/* Email Placeholder */}
//             <div>
//               <label className="ui-form-label">Email Placeholder</label>
//               <input
//                 type="text"
//                 value={settings.formPlaceholders.emailPlaceholder}
//                 onChange={(e) => {
//                   if (e.target.value.length <= 100) {
//                     handleFormPlaceholderChange('emailPlaceholder', e.target.value)
//                   }
//                 }}
//                 maxLength={100}
//                 className="ui-form-field-input"
//                 placeholder="e.g., example@gmail.com"
//               />
//               <small className="ui-char-count">{settings.formPlaceholders.emailPlaceholder.length}/100</small>
//             </div>

//             {/* Button Text */}
//             <div>
//               <label className="ui-form-label">Button Text</label>
//               <input
//                 type="text"
//                 value={settings.formPlaceholders.buttonText}
//                 onChange={(e) => {
//                   if (e.target.value.length <= 100) {
//                     handleFormPlaceholderChange('buttonText', e.target.value)
//                   }
//                 }}
//                 maxLength={100}
//                 className="ui-form-field-input"
//                 placeholder="e.g., Submit"
//               />
//               <small className="ui-char-count">{settings.formPlaceholders.buttonText.length}/100</small>
//             </div>
//           </div>

//           {/* 4. Welcome Message (For Message Box) */}
//           <div className="ui-setting-card">
//             <h3 className="ui-card-title">Welcome Message</h3>
//             <div className="ui-message-box-header">
//               <span className="ui-char-count">{settings.welcomeMessage.length}/200</span>
//             </div>
//             <textarea
//               value={settings.welcomeMessage}
//               onChange={(e) => {
//                 if (e.target.value.length <= 200) {
//                   handleWelcomeMessageBoxChange(e.target.value)
//                 }
//               }}
//               maxLength={200}
//               className="ui-welcome-textarea"
//               rows={4}
//               placeholder="Enter welcome message for message box"
//             />
//           </div>

//           {/* 5. Custom Success Message */}
//           <div className="ui-setting-card">
//             <h3 className="ui-card-title">Success Message</h3>
//             <div className="ui-message-box-header">
//               <span className="ui-char-count">{settings.customMessage.length}/200</span>
//             </div>
//             <textarea
//               value={settings.customMessage}
//               onChange={(e) => {
//                 if (e.target.value.length <= 200) {
//                   handleCustomMessageChange(e.target.value)
//                 }
//               }}
//               maxLength={200}
//               className="ui-welcome-textarea"
//               rows={4}
//               placeholder="Enter success message"
//             />
//           </div>

//           {/* 6. Missed Chat Timer */}
//           <div className="ui-setting-card">
//             <h3 className="ui-card-title">Missed chat timer</h3>
//             <div className="ui-timer-toggle">
//               <label className="ui-toggle-label">
//                 <input
//                   type="checkbox"
//                   checked={settings.missedChatTimerEnabled}
//                   onChange={handleTimerToggle}
//                   className="ui-toggle-input"
//                 />
//                 <span className="ui-toggle-slider"></span>
//               </label>
//               <span className="ui-toggle-text">
//                 {settings.missedChatTimerEnabled ? 'Enabled' : 'Disabled'}
//               </span>
//             </div>

//             {settings.missedChatTimerEnabled && (
//               <div className="ui-timer-display">
//                 <div className="ui-timer-input-wrapper">
//                   <label className="ui-timer-input-label">Resolution Time Limit (Minutes)</label>
//                   <div className="ui-timer-input-container">
//                     <input
//                       type="number"
//                       value={timerMinutes}
//                       onChange={(e) => handleTimerMinuteChange(e.target.value)}
//                       className="ui-timer-minutes-input"
//                       min="1"
//                       max="1440"
//                       placeholder="Enter minutes"
//                     />
//                     <span className="ui-timer-unit">minutes</span>
//                   </div>
//                   <small className="ui-timer-hint">Min: 1 minute | Max: 1440 minutes (24 hours)</small>
//                 </div>

//                 {/* Save Button and Status */}
//                 <div className="ui-timer-action">
//                   <button
//                     className="ui-timer-save-btn"
//                     onClick={saveTimerSettingsToBackend}
//                     disabled={timerSaveState === 'saving'}
//                   >
//                     {timerSaveState === 'saving' ? '💾 Saving...' : 'Save'}
//                   </button>
//                   {timerSaveState && (
//                     <span className={`ui-timer-status ${timerSaveState}`}>
//                       {timerSaveState === 'saving' && '⏳ Saving...'}
//                       {timerSaveState === 'saved' && '✓ Saved successfully'}
//                       {timerSaveState === 'error' && '✗ Error saving'}
//                     </span>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default UISettings




import React, { useState, useEffect, useRef, useCallback } from 'react'
import axios from '../../config/axiosConfig'
import { useAuthContext } from '../../Hooks/useAuthContext'
import './UISettingsStyles.css'
import hublyIconImage from "../../Assets/CommonAssets/hublyIconImage.png";

const UISettings = () => {
  const { user } = useAuthContext()
  const [settings, setSettings] = useState({
    headerColor: '#33475B',
    backgroundColor: '#FAFBFC',
    formPlaceholders: {
      namePlaceholder: 'Your name',
      phonePlaceholder: '+1 (000) 000-0000',
      emailPlaceholder: 'example@gmail.com',
      buttonText: 'Thank You!'
    },
    welcomeMessage: '👋 Want to chat about Hubly? I\'m a chatbot here to help you find your way.',
    customMessage: 'Thank You! We\'ll get back to you soon.',
    missedChatTimerEnabled: true,
  })

  const [timerMinutes, setTimerMinutes] = useState('20')
  const [timerSaveState, setTimerSaveState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savingState, setSavingState] = useState(null)
  const debounceTimer = useRef(null)

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings()
    fetchTimerSettings()
  }, [])

  // Debounced auto-save on settings change
  const saveSettingsToBackend = useCallback(async () => {
    try {
      setSavingState('saving')
      const response = await axios.put(
        `/api/admin/ui-settings`,
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
  }, [settings])

  // Debounce effect
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    debounceTimer.current = setTimeout(() => {
      saveSettingsToBackend()
    }, 800)
    return () => clearTimeout(debounceTimer.current)
  }, [settings, saveSettingsToBackend])

  const fetchTimerSettings = async () => {
    try {
      const response = await axios.get('/api/admin/timer-settings')
      if (response.data.success) {
        const minutes = response.data.settings.resolutionTimeLimit
        setTimerMinutes(minutes.toString())
      }
    } catch (error) {
      console.error('Error fetching timer settings:', error.message)
    }
  }

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/admin/ui-settings')
      if (response.data.success) {
        setSettings(response.data.settings)
      }
    } catch (error) {
      console.error('Error fetching UI settings:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const saveTimerSettingsToBackend = async () => {
    try {
      setTimerSaveState('saving')
      const minutesValue = parseInt(timerMinutes, 10)

      // Validate input
      if (isNaN(minutesValue) || minutesValue < 1 || minutesValue > 1440) {
        setTimerSaveState('error')
        setTimeout(() => setTimerSaveState(null), 3000)
        return
      }

      const response = await axios.patch(
        '/api/admin/timer-settings',
        { resolutionTimeLimit: minutesValue }
      )

      if (response.data.success) {
        setTimerSaveState('saved')
        setTimeout(() => setTimerSaveState(null), 2000)
      }
    } catch (error) {
      console.error('Error saving timer settings:', error.message)
      setTimerSaveState('error')
      setTimeout(() => setTimerSaveState(null), 3000)
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

  const handleFormPlaceholderChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      formPlaceholders: {
        ...prev.formPlaceholders,
        [field]: value
      }
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

  const handleTimerToggle = () => {
    setSettings(prev => ({
      ...prev,
      missedChatTimerEnabled: !prev.missedChatTimerEnabled
    }))
  }

  const handleTimerMinuteChange = (value) => {
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      // Limit max to 1440 minutes (24 hours)
      if (value === '' || parseInt(value, 10) <= 1440) {
        setTimerMinutes(value)
      }
    }
  }

  // Authorization check
  if (!user || !user.isAdmin) {
    return <div className="ui-unauthorized">Admin access only</div>
  }

  if (loading) {
    return <div className="ui-settings-loading">Loading settings...</div>
  }

  return (
    <div className="ui-settings-wrapper">
      {/* Left Side - Chat Widget Display */}
      <div className="ui-settings-left">
        {/* Chat Bot Label */}
        <div className="ui-chat-bot-label">Chat Bot</div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* CHAT WIDGET PREVIEW */}
        {/* ═══════════════════════════════════════════════════════════════════ */}

        {/* Chat Modal - Full chat widget preview */}
        <div className="ui-chat-modal">
          {/* Header */}
          <div className="ui-chat-modal-header" style={{ backgroundColor: settings.headerColor }}>
            <div className="ui-header-content">
              <img src={hublyIconImage} alt="Hubly" className="ui-hubly-icon" />
              <h3 className="ui-hubly-title">Hubly</h3>
            </div>
            <button className="ui-close-btn">✕</button>
          </div>

          {/* Messages Container - SINGLE CONTAINER WITH ALL CONTENT */}
          <div className="ui-messages-container">
            {/* Welcome Message */}
            <div className="ui-bot-message-wrapper">
              <div className="ui-bot-message">
                {settings.welcomeMessage}
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* Introduction Form Preview - Inside Messages Container */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            <div className="ui-form-preview-container">
              <div className="ui-form-preview" style={{ backgroundColor: settings.backgroundColor }}>
                {/* Name Field */}
                <div className="ui-form-group">
                  <label className="ui-form-label">Your name</label>
                  <input
                    type="text"
                    className="ui-form-input"
                    placeholder={settings.formPlaceholders.namePlaceholder}
                    disabled
                  />
                </div>

                {/* Phone Field */}
                <div className="ui-form-group">
                  <label className="ui-form-label">Your Phone</label>
                  <input
                    type="tel"
                    className="ui-form-input"
                    placeholder={settings.formPlaceholders.phonePlaceholder}
                    disabled
                  />
                </div>

                {/* Email Field */}
                <div className="ui-form-group">
                  <label className="ui-form-label">Your Email</label>
                  <input
                    type="email"
                    className="ui-form-input"
                    placeholder={settings.formPlaceholders.emailPlaceholder}
                    disabled
                  />
                </div>

                {/* Submit Button */}
                <button
                  className="ui-form-submit-btn"
                  style={{ backgroundColor: settings.headerColor }}
                  disabled
                >
                  {settings.formPlaceholders.buttonText}
                </button>
              </div>
            </div>

            {/* Success/Custom Message */}
            <div className="ui-bot-message-wrapper">
              <div className="ui-bot-message">
                {settings.customMessage}
              </div>
            </div>

            {/* Input Area */}
            <div className="ui-message-input-container">
              <input
                type="text"
                className="ui-message-input"
                placeholder="Type your message..."
                disabled
              />
              <button className="ui-send-btn" style={{ backgroundColor: settings.headerColor }}>
                ➤
              </button>
            </div>
          </div>
        </div>

        {/* Message Box - Shows welcome message */}
        <div className="ui-message-box">
          <button className="ui-message-box-close">✕</button>
          <img src={hublyIconImage} alt="Hubly" className="ui-message-box-icon" />
          {settings.welcomeMessage}
        </div>

        {/* Saving Indicator */}
        {savingState && (
          <div className={`ui-saving-indicator ${savingState}`}>
            {savingState === 'saving' && '💾 Saving...'}
            {savingState === 'saved' && '✓ Saved'}
            {savingState === 'error' && '✗ Error saving'}
          </div>
        )}
      </div>

      {/* Right Side - Settings Panel */}
      <div className="ui-settings-right">
        <div className="ui-settings-scroll-container">
          {/* 1. Header Color */}
          <div className="ui-setting-card">
            <h3 className="ui-card-title">Header Color</h3>
            <div className="ui-color-preset-group">
              <div
                className={`ui-color-circle ${settings.headerColor === '#FFFFFF' ? 'active' : ''}`}
                style={{ backgroundColor: '#FFFFFF' }}
                onClick={() => handleHeaderColorChange('#FFFFFF')}
                title="White"
              />
              <div
                className={`ui-color-circle ${settings.headerColor === '#000000' ? 'active' : ''}`}
                style={{ backgroundColor: '#000000' }}
                onClick={() => handleHeaderColorChange('#000000')}
                title="Black"
              />
              <div
                className={`ui-color-circle ${settings.headerColor === '#33475B' ? 'active' : ''}`}
                style={{ backgroundColor: '#33475B' }}
                onClick={() => handleHeaderColorChange('#33475B')}
                title="Blue"
              />
            </div>
            <div className="ui-color-selected-box">
              <div
                className="ui-color-selected-preview"
                style={{ backgroundColor: settings.headerColor }}
              />
              <span className="ui-color-selected-text">{settings.headerColor}</span>
            </div>
          </div>

          {/* 2. Background Color */}
          <div className="ui-setting-card">
            <h3 className="ui-card-title">Custom Background Color</h3>
            <div className="ui-color-preset-group">
              <div
                className={`ui-color-circle ${settings.backgroundColor === '#FFFFFF' ? 'active' : ''}`}
                style={{ backgroundColor: '#FFFFFF' }}
                onClick={() => handleBackgroundColorChange('#FFFFFF')}
                title="White"
              />
              <div
                className={`ui-color-circle ${settings.backgroundColor === '#000000' ? 'active' : ''}`}
                style={{ backgroundColor: '#000000' }}
                onClick={() => handleBackgroundColorChange('#000000')}
                title="Black"
              />
              <div
                className={`ui-color-circle ${settings.backgroundColor === '#FAFBFC' ? 'active' : ''}`}
                style={{ backgroundColor: '#FAFBFC' }}
                onClick={() => handleBackgroundColorChange('#FAFBFC')}
                title="Light Gray"
              />
            </div>
            <div className="ui-color-selected-box">
              <div
                className="ui-color-selected-preview"
                style={{ backgroundColor: settings.backgroundColor }}
              />
              <span className="ui-color-selected-text">{settings.backgroundColor}</span>
            </div>
          </div>

          {/* 3. INTRODUCTION FORM SECTION */}
          <div className="ui-setting-card">
            <h3 className="ui-card-title">Introduction Form</h3>

            {/* Name Placeholder */}
            <div>
              <label className="ui-form-label">Name Placeholder</label>
              <input
                type="text"
                value={settings.formPlaceholders.namePlaceholder}
                onChange={(e) => {
                  if (e.target.value.length <= 100) {
                    handleFormPlaceholderChange('namePlaceholder', e.target.value)
                  }
                }}
                maxLength={100}
                className="ui-form-field-input"
                placeholder="e.g., Your name"
              />
              <small className="ui-char-count">{settings.formPlaceholders.namePlaceholder.length}/100</small>
            </div>

            {/* Phone Placeholder */}
            <div>
              <label className="ui-form-label">Phone Placeholder</label>
              <input
                type="text"
                value={settings.formPlaceholders.phonePlaceholder}
                onChange={(e) => {
                  if (e.target.value.length <= 100) {
                    handleFormPlaceholderChange('phonePlaceholder', e.target.value)
                  }
                }}
                maxLength={100}
                className="ui-form-field-input"
                placeholder="e.g., +1 (000) 000-0000"
              />
              <small className="ui-char-count">{settings.formPlaceholders.phonePlaceholder.length}/100</small>
            </div>

            {/* Email Placeholder */}
            <div>
              <label className="ui-form-label">Email Placeholder</label>
              <input
                type="text"
                value={settings.formPlaceholders.emailPlaceholder}
                onChange={(e) => {
                  if (e.target.value.length <= 100) {
                    handleFormPlaceholderChange('emailPlaceholder', e.target.value)
                  }
                }}
                maxLength={100}
                className="ui-form-field-input"
                placeholder="e.g., example@gmail.com"
              />
              <small className="ui-char-count">{settings.formPlaceholders.emailPlaceholder.length}/100</small>
            </div>

            {/* Button Text */}
            <div>
              <label className="ui-form-label">Button Text</label>
              <input
                type="text"
                value={settings.formPlaceholders.buttonText}
                onChange={(e) => {
                  if (e.target.value.length <= 100) {
                    handleFormPlaceholderChange('buttonText', e.target.value)
                  }
                }}
                maxLength={100}
                className="ui-form-field-input"
                placeholder="e.g., Submit"
              />
              <small className="ui-char-count">{settings.formPlaceholders.buttonText.length}/100</small>
            </div>
          </div>

          {/* 4. Welcome Message (For Message Box) */}
          <div className="ui-setting-card">
            <h3 className="ui-card-title">Welcome Message</h3>
            <div className="ui-message-box-header">
              <span className="ui-char-count">{settings.welcomeMessage.length}/200</span>
            </div>
            <textarea
              value={settings.welcomeMessage}
              onChange={(e) => {
                if (e.target.value.length <= 200) {
                  handleWelcomeMessageBoxChange(e.target.value)
                }
              }}
              maxLength={200}
              className="ui-welcome-textarea"
              rows={4}
              placeholder="Enter welcome message for message box"
            />
          </div>

          {/* 5. Custom Success Message */}
          <div className="ui-setting-card">
            <h3 className="ui-card-title">Success Message</h3>
            <div className="ui-message-box-header">
              <span className="ui-char-count">{settings.customMessage.length}/200</span>
            </div>
            <textarea
              value={settings.customMessage}
              onChange={(e) => {
                if (e.target.value.length <= 200) {
                  handleCustomMessageChange(e.target.value)
                }
              }}
              maxLength={200}
              className="ui-welcome-textarea"
              rows={4}
              placeholder="Enter success message"
            />
          </div>

          {/* 6. Missed Chat Timer */}
          <div className="ui-setting-card">
            <h3 className="ui-card-title">Missed chat timer</h3>
            <div className="ui-timer-toggle">
              <label className="ui-toggle-label">
                <input
                  type="checkbox"
                  checked={settings.missedChatTimerEnabled}
                  onChange={handleTimerToggle}
                  className="ui-toggle-input"
                />
                <span className="ui-toggle-slider"></span>
              </label>
              <span className="ui-toggle-text">
                {settings.missedChatTimerEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            {settings.missedChatTimerEnabled && (
              <div className="ui-timer-display">
                <div className="ui-timer-input-wrapper">
                  <label className="ui-timer-input-label">Resolution Time Limit (Minutes)</label>
                  <div className="ui-timer-input-container">
                    <input
                      type="number"
                      value={timerMinutes}
                      onChange={(e) => handleTimerMinuteChange(e.target.value)}
                      className="ui-timer-minutes-input"
                      min="1"
                      max="1440"
                      placeholder="Enter minutes"
                    />
                    <span className="ui-timer-unit">minutes</span>
                  </div>
                  <small className="ui-timer-hint">Min: 1 minute | Max: 1440 minutes (24 hours)</small>
                </div>

                {/* Save Button and Status */}
                <div className="ui-timer-action">
                  <button
                    className="ui-timer-save-btn"
                    onClick={saveTimerSettingsToBackend}
                    disabled={timerSaveState === 'saving'}
                  >
                    {timerSaveState === 'saving' ? '💾 Saving...' : 'Save'}
                  </button>
                  {timerSaveState && (
                    <span className={`ui-timer-status ${timerSaveState}`}>
                      {timerSaveState === 'saving' && '⏳ Saving...'}
                      {timerSaveState === 'saved' && '✓ Saved successfully'}
                      {timerSaveState === 'error' && '✗ Error saving'}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UISettings