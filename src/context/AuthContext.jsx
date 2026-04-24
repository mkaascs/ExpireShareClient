import { createContext, useContext, useState, useEffect, useRef } from 'react'
import * as authApi from '../api/auth'

const AuthContext = createContext(null)

const REFRESH_KEY = 'refresh_token'

export function AuthProvider({ children }) {
    const [accessToken, setAccessToken] = useState(null)
    const [loading, setLoading] = useState(true) 
    const timerRef = useRef(null)
    const silentRefreshRef = useRef(null)

    const scheduleRefresh = (expiresIn) => {
        clearTimeout(timerRef.current)
        const delay = (expiresIn - 60) * 1000
        if (delay > 0) {
            timerRef.current = setTimeout(() => silentRefreshRef.current?.(), delay)
        }
    }

    const silentRefresh = async () => {
        const stored = localStorage.getItem(REFRESH_KEY)
        if (!stored) return false

        const res = await authApi.refresh(stored)
        if (res.ok) {
            setAccessToken(res.data.access_token)
            localStorage.setItem(REFRESH_KEY, res.data.refresh_token)
            scheduleRefresh(res.data.expires_in)
            return true
        }

        localStorage.removeItem(REFRESH_KEY)
        setAccessToken(null)
        return false
    }

    silentRefreshRef.current = silentRefresh

    useEffect(() => {
        const stored = localStorage.getItem(REFRESH_KEY)
        if (stored) {
            silentRefresh().finally(() => setLoading(false))
        } 
        
        else {
            setLoading(false)
        }

        return () => clearTimeout(timerRef.current)
    }, [])

    const login = async (loginVal, password) => {
        const res = await authApi.login(loginVal, password)
        if (res.ok) {
            setAccessToken(res.data.access_token)
            localStorage.setItem(REFRESH_KEY, res.data.refresh_token)
            scheduleRefresh(res.data.expires_in)
        }
        return res
    }

    const logout = async () => {
        const stored = localStorage.getItem(REFRESH_KEY)
        if (accessToken && stored) {
            await authApi.logout(accessToken, stored)
        }
        clearTimeout(timerRef.current)
        setAccessToken(null)
        localStorage.removeItem(REFRESH_KEY)
    }

    return (
        <AuthContext.Provider value={{
            accessToken,
            isAuth: !!accessToken,
            loading,
            login,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
