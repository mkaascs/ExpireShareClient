import { refresh } from './auth'
import { ACCESS_KEY, REFRESH_KEY } from '../context/AuthContext'

export async function fetchWithAuth(url, options = {}) {
    const res = await doFetch(url, options)

    if (res.status !== 401) return res

    // Получили 401 — пробуем refresh
    const refreshToken = localStorage.getItem(REFRESH_KEY)
    if (!refreshToken) {
        redirectToLogin()
        return res
    }

    const refreshRes = await refresh(refreshToken)
    if (!refreshRes.ok) {
        localStorage.removeItem(ACCESS_KEY)
        localStorage.removeItem(REFRESH_KEY)
        redirectToLogin()
        return res
    }

    localStorage.setItem(ACCESS_KEY, refreshRes.data.access_token)
    localStorage.setItem(REFRESH_KEY, refreshRes.data.refresh_token)

    return doFetch(url, options, refreshRes.data.access_token)
}

function doFetch(url, options, tokenOverride) {
    const token = tokenOverride ?? localStorage.getItem(ACCESS_KEY)
    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    })
}

function redirectToLogin() {
    window.location.href = '/login'
}
