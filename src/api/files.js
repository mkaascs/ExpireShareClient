import { fetchWithAuth } from './client'
import { API_BASE, ACCESS_KEY } from './config'

export async function getUserFiles(page = 1, limit = 10) {
    const res  = await fetchWithAuth(`${API_BASE}/file/?page=${page}&limit=${limit}`)
    const data = await res.json().catch(() => ({}))
    return {
        ok:     res.ok,
        status: res.status,
        files:  data.files ?? [],
        total:  data.total ?? 0,
    }
}

export async function getFileStats() {
    const res  = await fetchWithAuth(`${API_BASE}/file/stat`)
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
    const res = await fetchWithAuth(`${API_BASE}/file/${encodeURIComponent(alias)}`, {
        method: 'DELETE',
    })
    return { ok: res.ok, status: res.status }
}

export async function downloadFile(alias, password = '') {
    const headers = password ? { 'X-Resource-Password': password } : {}

    const res = await fetch(`${API_BASE}/download/${encodeURIComponent(alias)}`, {
        method: 'GET',
        headers,
    })

    const contentType = res.headers.get('Content-Type') || ''
    if (contentType.includes('text/html')) {
        return { ok: false, status: res.status || 500, message: 'Invalid server response (HTML instead of file)' }
    }

    if (!res.ok) {
        return { ok: false, status: res.status, message: await parseErrorMessage(res) }
    }

    const disposition = res.headers.get('Content-Disposition') || ''
    if (!disposition) {
        return { ok: false, status: 500, message: 'Missing Content-Disposition header' }
    }

    const blob = await res.blob()
    return { ok: true, blob, filename: parseFilename(disposition, alias) }
}

export function parseFilename(disposition, fallback) {
    const match = disposition.match(/filename[^;=\n]*=["']?([^"';\n]+)["']?/)
    return match?.[1]?.trim() ?? fallback
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
            try { data = JSON.parse(xhr.responseText) } catch { /* empty */ }
            resolve({
                ok:     xhr.status >= 200 && xhr.status < 300,
                status: xhr.status,
                alias:  data.alias  ?? '',
                errors: data.errors ?? [],
            })
        })

        const failed = { ok: false, status: 0, alias: '', errors: [] }
        xhr.addEventListener('error', () => resolve(failed))
        xhr.addEventListener('abort', () => resolve(failed))

        const token = localStorage.getItem(ACCESS_KEY)
        xhr.open('POST', `${API_BASE}/upload`)
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
        xhr.send(form)
    })
}

export async function parseErrorMessage(res) {
    try {
        const json = await res.json()
        if (Array.isArray(json.errors) && json.errors.length > 0) {
            return json.errors[0]
        }
    } catch { /* empty */ }
    return 'Something went wrong.'
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
