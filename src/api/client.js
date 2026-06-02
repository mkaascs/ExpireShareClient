import { refresh } from './auth'
import { ACCESS_KEY, REFRESH_KEY } from './config'

let inFlightRefresh = null
let onTokensUpdated = null

export function registerTokenSync(callback) {
    onTokensUpdated = callback
}

export async function fetchWithAuth(url, options = {}) {
    const res = await doFetch(url, options)
    if (res.status !== 401) return res

    const newAccessToken = await refreshTokens()
    if (!newAccessToken) {
        clearAuth()
        redirectToLogin()
        return res
    }

    return doFetch(url, options, newAccessToken)
}

function refreshTokens() {
    if (inFlightRefresh) return inFlightRefresh

    inFlightRefresh = doRefresh().finally(() => {
        inFlightRefresh = null
    })
    return inFlightRefresh
}

async function doRefresh() {
    const refreshToken = localStorage.getItem(REFRESH_KEY)
    if (!refreshToken) return null

    const res = await refresh(refreshToken)
    if (!res.ok) return null

    const { access_token, refresh_token } = res.data
    localStorage.setItem(ACCESS_KEY, access_token)
    localStorage.setItem(REFRESH_KEY, refresh_token)
    onTokensUpdated?.(access_token, refresh_token)
    return access_token
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

function clearAuth() {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
    onTokensUpdated?.(null, null)
}

function redirectToLogin() {
    window.location.href = '/login'
}
