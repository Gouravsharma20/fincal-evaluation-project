import { createContext, useReducer, useEffect, useState } from "react";

export const AuthContext = createContext();


export const authReducer = (state, action) => {
    switch (action.type) {
        case `LOGIN`:
            localStorage.setItem('user', JSON.stringify(action.payload))
            return { user: action.payload.user, token: action.payload.token };
        case `LOGOUT`:
            localStorage.removeItem('user');
            return { user: null, token: null };
        case 'SET_USER':
            return { user: action.payload.user, token: action.payload.token }
        default:
            return state
    }
}


export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, {
        user: null,
        token: null
    })
    // eslint-disable-next-line no-unused-vars
    const [loading,setLoading] = useState(true);

    useEffect(() => {
    const storedUser = localStorage.getItem('user')
    console.log(' Stored user from localStorage:', storedUser); 
    if (storedUser) {
        try {
            const data = JSON.parse(storedUser);
            dispatch({ type: `SET_USER`, payload: data })
        } catch (err) {
            console.error('Failed to parse stored user:', err)
            localStorage.removeItem('user')
        }
    } else {
        console.log(' No stored user found');
    }
    setLoading(false);
}, [])

    return (
        <AuthContext.Provider value={{ ...state, dispatch }}>
            {children}
        </AuthContext.Provider>
    )

}

export default AuthContextProvider;