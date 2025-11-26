// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import "./LoginStyles.css"
// import { useLogin } from '../../Hooks/useLogin'
// import appLogo from '../../Assets/CommonAssets/appLogo.png';
// import LoginSignUpBoy from "../../Assets/LoginSignUpAssets/LoginSignUpBoy.png"


// const Login = () => {

//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const navigate = useNavigate()

//   const { login, error } = useLogin()


//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const result = await login(email, password);
//     if (result.ok) {
//       setEmail("");
//       setPassword("");
//     } else {
//       console.log("login failed", result?.error);
//     }
//   }

//   const handleSignUpClick = () => {
//     navigate('/signup')
//   }


//   return (
//     <div className='loginForm' style={{ '--app-logo': `url(${appLogo})`, '--boy-img': `url(${LoginSignUpBoy})` }}>
//       <h1>Sign in to your Plexify</h1>
//       <form onSubmit={handleSubmit}>
//         <div className='field'>
//           <label htmlFor='email'>Username</label>
//           <input
//             id='email'
//             type="email"
//             onChange={(e) => setEmail(e.target.value)}
//             value={email}
//             placeholder="Enter your email"
//           />
//         </div>

//         <div className='field'>
//           <label htmlFor='password'>Password</label>
//           <input
//             id='password'
//             type="password"
//             onChange={(e) => setPassword(e.target.value)}
//             value={password}
//             placeholder="Enter your password"
//           />
//         </div>
//         <button type='submit'>Log in</button>
//         {error && <p className='error-message'>{error}</p>}
//         <p>
//           Don't have an account? <span className='link-button' onClick={handleSignUpClick}>Sign up</span>
//         </p>
//       </form>
//       <div className='footer-text'>
//         This site is protected by reCAPTCHA and the Google <a href='https://policies.google.com/privacy' target='_blank' rel='noopener noreferrer'>Privacy Policy</a> and <a href='https://policies.google.com/terms' target='_blank' rel='noopener noreferrer'>Terms of Service</a> apply.
//       </div>
//     </div>
//   )
// }

// export default Login



import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import "./LoginStyles.css"
import { useLogin } from '../../Hooks/useLogin'
import appLogo from '../../Assets/CommonAssets/appLogo.png'
import LoginSignUpBoy from "../../Assets/LoginSignUpAssets/LoginSignUpBoy.png"


const Login = () => {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const { login, error } = useLogin()


  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(email, password)
    if (result.ok) {
      setEmail("")
      setPassword("")
      navigate('/team')
    } else {
      console.log("login failed", result?.error)
    }
  }

  const handleSignUpClick = () => {
    navigate('/signup')
  }


  return (
    <div className='loginForm' style={{ '--app-logo': `url(${appLogo})`, '--boy-img': `url(${LoginSignUpBoy})` }}>
      <h1>Sign in to your Plexify</h1>
      <form onSubmit={handleSubmit}>
        <div className='field'>
          <label htmlFor='email'>Username</label>
          <input
            id='email'
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="Enter your email"
          />
        </div>

        <div className='field'>
          <label htmlFor='password'>Password</label>
          <input
            id='password'
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="Enter your password"
          />
        </div>
        <button type='submit'>Log in</button>
        {error && <p className='error-message'>{error}</p>}
        <p>
          Don't have an account? <span className='link-button' onClick={handleSignUpClick}>Sign up</span>
        </p>
      </form>
      <div className='footer-text'>
        This site is protected by reCAPTCHA and the Google <a href='https://policies.google.com/privacy' target='_blank' rel='noopener noreferrer'>Privacy Policy</a> and <a href='https://policies.google.com/terms' target='_blank' rel='noopener noreferrer'>Terms of Service</a> apply.
      </div>
    </div>
  )
}

export default Login