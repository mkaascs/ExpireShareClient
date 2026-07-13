import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('./auth', () => ({
    refresh: vi.fn(),
}))

let fetchWithAuth
let registerTokenSync
let refresh

beforeEach(async () => {
    vi.resetModules()
    ;({ fetchWithAuth, registerTokenSync } = await import('./client'))
    ;({ refresh } = await import('./auth'))

    globalThis.fetch = vi.fn()
    globalThis.localStorage = createStorage()
    globalThis.window = { location: { href: '' } }

    localStorage.setItem('access_token', 'access-old')
    localStorage.setItem('refresh_token', 'refresh-old')
})

afterEach(() => {
    vi.clearAllMocks()
})

function createStorage() {
    const store = new Map()
    return {
        getItem: (k) => store.get(k) ?? null,
        setItem: (k, v) => store.set(k, String(v)),
        removeItem: (k) => store.delete(k),
        clear: () => store.clear(),
    }
}

const okResponse   = (body = {}) => ({ ok: true,  status: 200, json: async () => body })
const unauthorized = ()          => ({ ok: false, status: 401, json: async () => ({}) })

describe('fetchWithAuth', () => {
    it('passes through non-401 responses without refresh', async () => {
        fetch.mockResolvedValueOnce(okResponse())

        const res = await fetchWithAuth('/api/anything')

        expect(res.status).toBe(200)
        expect(refresh).not.toHaveBeenCalled()
    })

    it('refreshes token on 401 and retries with new access token', async () => {
        fetch
            .mockResolvedValueOnce(unauthorized())
            .mockResolvedValueOnce(okResponse())

        refresh.mockResolvedValueOnce({
            ok: true,
            data: { access_token: 'access-new', refresh_token: 'refresh-new' },
        })

        const res = await fetchWithAuth('/api/anything')

        expect(res.status).toBe(200)
        expect(refresh).toHaveBeenCalledOnce()
        expect(localStorage.getItem('access_token')).toBe('access-new')
        expect(localStorage.getItem('refresh_token')).toBe('refresh-new')

        const retryOpts = fetch.mock.calls[1][1]
        expect(retryOpts.headers.Authorization).toBe('Bearer access-new')
    })

    it('deduplicates concurrent refresh requests', async () => {
        fetch
            .mockResolvedValueOnce(unauthorized())
            .mockResolvedValueOnce(unauthorized())
            .mockResolvedValueOnce(okResponse())
            .mockResolvedValueOnce(okResponse())

        refresh.mockResolvedValueOnce({
            ok: true,
            data: { access_token: 'access-new', refresh_token: 'refresh-new' },
        })

        const [r1, r2] = await Promise.all([
            fetchWithAuth('/api/one'),
            fetchWithAuth('/api/two'),
        ])

        expect(r1.status).toBe(200)
        expect(r2.status).toBe(200)
        expect(refresh).toHaveBeenCalledOnce()
    })

    it('clears tokens and redirects when refresh fails', async () => {
        fetch.mockResolvedValueOnce(unauthorized())
        refresh.mockResolvedValueOnce({ ok: false, data: {} })

        await fetchWithAuth('/api/anything')

        expect(localStorage.getItem('access_token')).toBeNull()
        expect(localStorage.getItem('refresh_token')).toBeNull()
        expect(window.location.href).toBe('/login')
    })

    it('notifies registered token sync callback on refresh', async () => {
        fetch
            .mockResolvedValueOnce(unauthorized())
            .mockResolvedValueOnce(okResponse())

        refresh.mockResolvedValueOnce({
            ok: true,
            data: { access_token: 'a-new', refresh_token: 'r-new' },
        })

        const sync = vi.fn()
        registerTokenSync(sync)

        await fetchWithAuth('/api/anything')

        expect(sync).toHaveBeenCalledWith('a-new', 'r-new')
    })

    it('notifies sync callback with nulls when refresh fails', async () => {
        fetch.mockResolvedValueOnce(unauthorized())
        refresh.mockResolvedValueOnce({ ok: false, data: {} })

        const sync = vi.fn()
        registerTokenSync(sync)

        await fetchWithAuth('/api/anything')

        expect(sync).toHaveBeenCalledWith(null, null)
    })
})
