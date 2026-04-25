import { fetchWithAuth } from './client'

export async function getUserFiles() {
    const res = await fetchWithAuth(`${import.meta.env.VITE_API_TARGET}/api/file/`)
    const data = await res.json().catch(() => ({}))
    return { ok: res.ok, status: res.status, files: data.files ?? [] }
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

export async function uploadFile({ file, ttl, maxDownloads, password }) {
    const form = new FormData()
    form.append('file', file)
    if (ttl)           form.append('ttl', ttl)
    if (maxDownloads)  form.append('max_downloads', String(maxDownloads))
    if (password)      form.append('password', password)

    const res = await fetchWithAuth(`${import.meta.env.VITE_API_TARGET}/api/upload`, {
        method: 'POST',
        body: form,
    })

    const data = await res.json().catch(() => ({}))
    return {
        ok:     res.ok,
        status: res.status,
        alias:  data.alias ?? '',
        errors: data.errors ?? [],
    }
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