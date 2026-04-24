import { createContext, useContext, useState } from 'react'
import * as authApi from '../api/auth'

const AuthContext = createContext(null)

export const ACCESS_KEY = 'access_token'
export const REFRESH_KEY = 'refresh_token'

export function AuthProvider({ children }) {
    // Инициализируем из localStorage — без сетевых запросов
    const [accessToken, setAccessToken] = useState(() => localStorage.getItem(ACCESS_KEY))

    const login = async (loginVal, password) => {
        const res = await authApi.login(loginVal, password)
        if (res.ok) {
            localStorage.setItem(ACCESS_KEY, res.data.access_token)
            localStorage.setItem(REFRESH_KEY, res.data.refresh_token)
            setAccessToken(res.data.access_token)
        }
        return res
    }

    const logout = async () => {
        const token = localStorage.getItem(ACCESS_KEY)
        const stored = localStorage.getItem(REFRESH_KEY)
        if (token && stored) {
            await authApi.logout(token, stored)
        }
        localStorage.removeItem(ACCESS_KEY)
        localStorage.removeItem(REFRESH_KEY)
        setAccessToken(null)
    }

    // Вызывается из fetchWithAuth после успешного рефреша
    const updateTokens = (accessToken, refreshToken) => {
        localStorage.setItem(ACCESS_KEY, accessToken)
        localStorage.setItem(REFRESH_KEY, refreshToken)
        setAccessToken(accessToken)
    }

    return (
        <AuthContext.Provider value={{
            accessToken,
            isAuth: !!accessToken,
            login,
            logout,
            updateTokens,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
