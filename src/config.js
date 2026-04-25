// ─── Upload ────────────────────────────────────────────────────────────────
export const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024   // 500 MB
export const MAX_FILE_SIZE_LABEL = '500 MB'

export const MAX_DOWNLOADS_DEFAULT = 1
export const MAX_DOWNLOADS_LIMIT   = 10_000

export const TTL_OPTIONS = [
    { label: '1h',  value: '1h'   },
    { label: '6h',  value: '6h'   },
    { label: '24h', value: '24h'  },
    { label: '3d',  value: '72h'  },
    { label: '7d',  value: '168h' },
]
export const TTL_DEFAULT = '24h'
