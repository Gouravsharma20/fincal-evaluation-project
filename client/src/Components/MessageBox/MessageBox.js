
// import React from 'react'
// import './MessageBoxStyles.css'

// const MessageBox = ({ messages, isAdmin, isTeamMember }) => {
//   return (
//     <div className='message-box'>
//       {messages.map((msg, idx) => (
//         <div 
//           key={idx} 
//           className={`message ${msg.senderType} ${msg.internal ? 'internal' : ''}`}
//         >
//           <div className='message-header'>
//             <span className='sender-type'>{msg.senderType}</span>
//             {msg.internal && <span className='internal-badge'>Internal</span>}
//             <span className='timestamp'>
//               {new Date(msg.createdAt).toLocaleTimeString()}
//             </span>
//           </div>
//           <p className='message-text'>{msg.text}</p>
//         </div>
//       ))}
//     </div>
//   )
// }

// export default MessageBox