import { useState } from "react";
import { useAuthContext } from "./useAuthContext";
import {API_BASE_URL} from "../config/api";



export const useLogin = () => {
    const [error, setError] = useState(null)
    const { dispatch } = useAuthContext();

    const login = async (email, password) => {
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            console.log("login response ok:", response.ok);
            console.log("login response data:", data);

            if (!response.ok) {
                const errmsg = data?.error || "login failed";
                setError(errmsg);
                return { ok: false, error: errmsg };
            }
            const cleanData = {
                user: data.user,
                token: data.token
            };

            localStorage.setItem("user", JSON.stringify(cleanData));
            dispatch({ type: "LOGIN", payload: cleanData });

            localStorage.setItem("user", JSON.stringify(data));
            dispatch({ type: "LOGIN", payload: data });
            return { ok: true, data };

        } catch (err) {
            console.error("login fetch error:", err);
            setError("Could not connect to server");
            return { ok: false, error: err.message || "Network error" };

        }

    };
    return { login, error }
}


