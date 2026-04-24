const BASE = `${import.meta.env.VITE_API_TARGET}/api/auth`

async function request(path, body) {
    const res = await fetch(`${BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
    
    const data = await res.json().catch(() => ({}))
    return { ok: res.ok, status: res.status, data }
}

export const login = (login, password) =>
    request('/login', { login, password })

export const register = (login, email, password) =>
    request('/register', { login, email, password })

export const logout = (access_token, refresh_token) =>
    request('/logout', { access_token, refresh_token })

export const refresh = (refresh_token) =>
    request('/refresh', { refresh_token })
