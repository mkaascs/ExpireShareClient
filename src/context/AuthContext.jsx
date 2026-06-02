import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import * as authApi from '../api/auth'
import { registerTokenSync } from '../api/client'
import { ACCESS_KEY, REFRESH_KEY } from '../api/config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [accessToken, setAccessToken] = useState(() => localStorage.getItem(ACCESS_KEY))

    const updateTokens = useCallback((access, refresh) => {
        if (access && refresh) {
            localStorage.setItem(ACCESS_KEY, access)
            localStorage.setItem(REFRESH_KEY, refresh)
            setAccessToken(access)
        } else {
            localStorage.removeItem(ACCESS_KEY)
            localStorage.removeItem(REFRESH_KEY)
            setAccessToken(null)
        }
    }, [])

    useEffect(() => {
        registerTokenSync(updateTokens)
        return () => registerTokenSync(null)
    }, [updateTokens])

    const login = async (loginVal, password) => {
        const res = await authApi.login(loginVal, password)
        if (res.ok) {
            updateTokens(res.data.access_token, res.data.refresh_token)
        }
        return res
    }

    const logout = async () => {
        const access  = localStorage.getItem(ACCESS_KEY)
        const refresh = localStorage.getItem(REFRESH_KEY)
        if (access && refresh) {
            await authApi.logout(access, refresh)
        }
        updateTokens(null, null)
    }

    return (
        <AuthContext.Provider value={{
            accessToken,
            isAuth: !!accessToken,
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
