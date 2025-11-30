import { useState } from "react";
import { useAuthContext } from "./useAuthContext";

import {API_BASE_URL} from "../config/api";



export const useSignUp = () => {
    const [error, setError] = useState(null)
    const { dispatch } = useAuthContext();

    const signUp = async (name, email, password, confirmPassword) => {
        setError(null);

        if (password !== confirmPassword) {
            setError("password do not match");
            return { ok: false, error: "Password do not match" }
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({ name, email, password, confirmPassword })
            });

            const data = await response.json();
            console.log("signup response ok:", response.ok);
            console.log("signup response data:", data);

            if (!response.ok) {
                const errmsg = data?.error || "SignUp failed"
                setError(errmsg);
                return { ok: false, error: errmsg };
            }

            localStorage.setItem("user", JSON.stringify(data));
            dispatch({ type: "LOGIN", payload: data });
            return { ok: true, data };

        } catch (err) {
            console.error("signup fetch error:", err);
            setError("Could not connect to server");
            return { ok: false, error: err.message || "Network error" };

        }

    };
    return { signUp, error }
}