import { fetchWithAuth } from './client'
import { ACCESS_KEY } from '../context/AuthContext'

export async function getUserFiles(page = 1, limit = 10) {
    const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_TARGET}/api/file/?page=${page}&limit=${limit}`
    )
    const data = await res.json().catch(() => ({}))
    return {
        ok:    res.ok,
        status: res.status,
        files:  data.files ?? [],
        total:  data.total ?? 0,
    }
}

export async function getFileStats() {
    const res = await fetchWithAuth(`${import.meta.env.VITE_API_TARGET}/api/file/stat`)
    const data = await res.json().catch(() => ({}))
    return {
        ok:            res.ok,
        status:        res.status,
        count:         data.count         ?? 0,
        max_count:     data.max_count     ?? 50,
        occupied_size: data.occupied_size ?? 0,
        max_size:      data.max_size      ?? 0,
    }
}

export async function deleteFile(alias) {
    const res = await fetchWithAuth(`${import.meta.env.VITE_API_TARGET}/api/file/${encodeURIComponent(alias)}`, {
        method: 'DELETE',
    })
    return { ok: res.ok, status: res.status }
}

export async function downloadFile(alias, password = '') {
    const headers = {}
    if (password) headers['X-Resource-Password'] = password

    const res = await fetch(`${import.meta.env.VITE_API_TARGET}/download/${encodeURIComponent(alias)}`, {
        method: 'GET',
        headers,
    })

    const contentType = res.headers.get('Content-Type') || ''
    const disposition = res.headers.get('Content-Disposition') || ''

    if (contentType.includes('text/html')) {
        return {
            ok: false,
            status: res.status || 500,
            message: 'Invalid server response (HTML instead of file)'
        }
    }

    if (res.ok) {
        if (!disposition) {
            return {
                ok: false,
                status: 500,
                message: 'Missing Content-Disposition header'
            }
        }

        const blob = await res.blob()

        const match = disposition.match(/filename[^;=\n]*=["']?([^"';\n]+)["']?/)
        const filename = match?.[1]?.trim() ?? alias

        return { ok: true, blob, filename }
    }

    let message = 'Something went wrong.'

    try {
        const json = await res.json()
        if (Array.isArray(json.errors) && json.errors.length > 0) {
            message = json.errors[0]
        }
    } catch { /* empty */ }

    return { ok: false, status: res.status, message }
}

export function uploadFile({ file, ttl, maxDownloads, password, onProgress }) {
    return new Promise((resolve) => {
        const form = new FormData()
        form.append('file', file)
        if (ttl)          form.append('ttl', ttl)
        if (maxDownloads) form.append('max_downloads', String(maxDownloads))
        if (password)     form.append('password', password)

        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100))
        })

        xhr.addEventListener('load', () => {
            let data = {}
            try { data = JSON.parse(xhr.responseText) } catch {}
            resolve({
                ok:     xhr.status >= 200 && xhr.status < 300,
                status: xhr.status,
                alias:  data.alias  ?? '',
                errors: data.errors ?? [],
            })
        })

        xhr.addEventListener('error', () => resolve({ ok: false, status: 0, alias: '', errors: [] }))
        xhr.addEventListener('abort', () => resolve({ ok: false, status: 0, alias: '', errors: [] }))

        const token = localStorage.getItem(ACCESS_KEY)
        xhr.open('POST', `${import.meta.env.VITE_API_TARGET}/api/upload`)
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
        xhr.send(form)
    })
}

export function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = filename

    document.body.appendChild(a)
    a.click()
    a.remove()

    URL.revokeObjectURL(url)
}