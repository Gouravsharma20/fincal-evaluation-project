import React, { useState } from 'react';
import axios from "axios";
import "./MessageFormStyles.css"
import messageButtonImage from "../../Assets/HomeAssets/messageButtonImage.png";
import hublyIconImage from "../../Assets/CommonAssets/hublyIconImage.png";

const MessageForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMessageBox, setShowMessageBox] = useState(true);
  const [userMessage, setUserMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [initialMessage, setInitialMessage] = useState(""); // ← CAPTURE INITIAL MESSAGE
  const [customerForm, setCustomerForm] = useState({
    name: "",
    phoneNumber: "",
    emailAddress: ""
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const messageBoxText = "👋 Want to chat about Hubly? I'm an chatbot here to help you find your way.";

  const handleChatOpen = () => {
    setIsOpen(true);
  };

  const handleSendMessage = () => {
    
    if (userMessage.trim()) {
      
      // SAVE THE INITIAL MESSAGE
      setInitialMessage(userMessage);
      
      // Add user message to chat
      setMessages(prev => [...prev, {
        type: 'user',
        text: userMessage
      }]);

      // Show form after user sends a message
      setTimeout(() => {
        setShowForm(true);
      }, 300);

      setUserMessage("");
    } else {
    }
  };

  const createCustomer = async (e) => {
    e.preventDefault();
    console.log('🔵 [7] Form submit button clicked');
    
    try {
      
      // VALIDATE ALL FIELDS ARE FILLED
      if (!customerForm.name.trim()) {
        console.log(' Name is empty');
        alert('Please enter your name');
        return;
      }
      
      if (!customerForm.phoneNumber.trim()) {
        console.log(' Phone number is empty');
        alert('Please enter your phone number');
        return;
      }
      
      if (!customerForm.emailAddress.trim()) {
        console.log(' Email is empty');
        alert('Please enter your email');
        return;
      }

      // BUILD PAYLOAD - EXACTLY AS BACKEND EXPECTS
      const payload = {
        userName: customerForm.name.trim(),
        userPhoneNumber: customerForm.phoneNumber.trim(),
        userEmail: customerForm.emailAddress.trim(),
        initialMessage: initialMessage // ← THE MESSAGE USER SENT FIRST
      };

      setIsLoading(true);

      // SEND TO BACKEND
      const response = await axios.post(
        "http://localhost:4000/api/tickets",
        payload
      );
      
      // CHECK IF SUCCESSFUL
      if (response.data.success || response.status === 201) {
        console.log('   Ticket ID:', response.data.ticketId);
        console.log('   Client Secret:', response.data.clientSecret);
        
        // ADD THANK YOU MESSAGE TO CHAT
        setMessages(prev => [...prev, {
          type: 'bot',
          text: 'Thank You! We\'ll get back to you soon.'
        }]);

        // UPDATE STATE
        setFormSubmitted(true);
        setShowForm(false);
        setCustomerForm({ name: "", phoneNumber: "", emailAddress: "" });
        setInitialMessage("");
        
      } else {
        throw new Error('Unexpected response from server');
      }

    } catch (error) {
      console.log('Axios error:', error.message);
      
      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response data:', error.response.data);
        alert('Error: ' + (error.response.data.error || error.response.data.message || 'Failed to create ticket'));
      } else if (error.request) {
        console.log('No response from backend');
        alert('Error: Cannot connect to backend. Is it running on port 4000?');
      } else {
        console.log('Error:', error.message);
        alert('Error: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateCustomerForm = (e) => {
    const { name, value } = e.target;
    
    setCustomerForm({
      ...customerForm,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    createCustomer(e);
  };

  const resetChat = () => {
    setIsOpen(false);
    setMessages([]);
    setFormSubmitted(false);
    setShowForm(false);
    setUserMessage("");
    setInitialMessage("");
    setCustomerForm({ name: "", phoneNumber: "", emailAddress: "" });
  };

  return (
    <>
      {/* Message Box - Shows by default, can be closed */}
      {!isOpen && showMessageBox && (
        <div className="message-box">
          <img 
            src={hublyIconImage} 
            alt="Hubly" 
            className="message-box-icon"
          />
          <span>{messageBoxText}</span>
          <button 
            className="message-box-close"
            onClick={() => setShowMessageBox(false)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Chat Button - Shows by default */}
      {!isOpen && (
        <button 
          className="chat-button" 
          onClick={handleChatOpen}
        >
          <img 
            src={messageButtonImage}
            alt="Chat" 
          />
        </button>
      )}

      {/* Chat Modal */}
      {isOpen && (
        <div className="chat-modal">
          {/* Header */}
          <div className="chat-modal-header">
            <div className="header-content">
              <img 
                src={hublyIconImage} 
                alt="Hubly" 
                className="hubly-icon"
              />
              <span className="hubly-title">Hubly</span>
            </div>
            <button 
              className="close-btn"
              onClick={resetChat}
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div className="messages-container">
            {/* Display messages */}
            {messages.map((msg, index) => (
              msg.type === 'user' ? (
                <div key={index} className="user-message-wrapper">
                  <div className="user-message">
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div key={index} className="bot-message-wrapper">
                  <img 
                    src={hublyIconImage}
                    alt="Hubly" 
                    className="bot-icon"
                  />
                  <div className="bot-message">
                    {msg.text}
                  </div>
                </div>
              )
            ))}

            {/* Form as Chat Message - appears after user sends message */}
            {showForm && !formSubmitted && (
              <div className="form-message">
                <div className="form-title">
                  Introduce Yourself
                </div>
                
                <div className="form-group">
                  <label>Your name</label>
                  <input
                    type="text"
                    name="name"
                    value={customerForm.name}
                    onChange={updateCustomerForm}
                    placeholder="Your name"
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label>Your Phone</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={customerForm.phoneNumber}
                    onChange={updateCustomerForm}
                    placeholder="+1 (000) 000-0000"
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label>Your Email</label>
                  <input
                    type="email"
                    name="emailAddress"
                    value={customerForm.emailAddress}
                    onChange={updateCustomerForm}
                    placeholder="example@gmail.com"
                    disabled={isLoading}
                  />
                </div>

                <button 
                  className="form-submit-btn"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Thank You!'}
                </button>
              </div>
            )}
          </div>

          {/* Message Input Area */}
          <div className="message-input-container">
            <input 
              type="text"
              className="message-input"
              placeholder="Write a message"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={showForm}
            />
            <button
              className="send-btn"
              onClick={handleSendMessage}
              disabled={!userMessage.trim() || showForm}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MessageForm;