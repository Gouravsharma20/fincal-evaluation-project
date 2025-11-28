import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import "../Login/LoginStyles.css"
import { useSignUp } from '../../Hooks/useSignUp'


const SignUp = () => {

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [agreeToTerms, setAgreeToTerms] = useState(false)
    const navigate = useNavigate()
    const { signUp, error } = useSignUp();

    const isPasswordMatch = password && confirmPassword && password === confirmPassword
    const isFormValid = name && email && password && confirmPassword && isPasswordMatch && agreeToTerms



    const handleSubmit = async (e) => {
        e.preventDefault();

        await signUp(name, email,password, confirmPassword)

        setName("")
        setEmail("")
        setPassword("")
        setConfirmPassword("")
        setAgreeToTerms(false)
    }

    const handleLoginClick = () => {
        navigate('/login')
    }

    return (
        <div className='signUpForm'>
            <h1>Create your Plexify Account</h1>
            <form onSubmit={handleSubmit}>

                <div className='field'>
                    <label htmlFor='name'>Name</label>
                    <input
                        id='name'
                        type='text'
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        placeholder="Enter your full name"
                    />
                </div>


                <div className='field'>
                    <label htmlFor='email'>Email</label>
                    <input
                        id='email'
                        type='email'
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        placeholder="Enter your email"
                    />
                </div>

                <div className="field">
                    <label htmlFor='password'>Password</label>
                    <input
                        id='password'
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        placeholder="Create a password"
                    />
                </div>

                <div className='field'>
                    <label htmlFor='confirmPassword'>Confirm Password</label>
                    <input
                        id='confirmPassword'
                        type='password'
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        value={confirmPassword}
                        placeholder="Confirm your password"
                        className={confirmPassword && !isPasswordMatch ? 'input-error' : ''}
                    />
                    {confirmPassword && !isPasswordMatch && (
                        <p className='password-error'>Passwords do not match</p>
                    )}
                </div>
                <div className='field checkbox-field'>
                    <label htmlFor='agreeToTerms' className='checkbox-label'>
                        <input
                            id='agreeToTerms'
                            type="checkbox"
                            onChange={(e) => setAgreeToTerms(e.target.checked)}
                            checked={agreeToTerms}
                            className='checkbox-input'
                        />
                        <span className='checkbox-text'>
                            By creating an account, I agree to our <span className='terms-link'>Terms of use</span> and <span className='terms-link'>Privacy Policy</span>
                        </span>
                    </label>
                </div>

                <button type='submit' disabled={!isFormValid}>Sign up</button>
                {error && <p className='error-message'>{error}</p>}

                <p>
                    Already have an account? <span className='link-button' onClick={handleLoginClick}>Log in</span>
                </p>
            </form>
            <div className='footer-text'>
                This site is protected by reCAPTCHA and the Google <a href='https://policies.google.com/privacy' target='_blank' rel='noopener noreferrer'>Privacy Policy</a> and <a href='https://policies.google.com/terms' target='_blank' rel='noopener noreferrer'>Terms of Service</a> apply.
            </div>
        </div>
    )
}

export default SignUp