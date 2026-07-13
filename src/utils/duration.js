export function parseDuration(str) {
    if (!str) return 0
    let ms = 0
    for (const [, value, unit] of str.matchAll(/(\d+)([dhms])/g)) {
        const n = parseInt(value)
        if (unit === 'd') ms += n * 86_400_000
        if (unit === 'h') ms += n * 3_600_000
        if (unit === 'm') ms += n * 60_000
        if (unit === 's') ms += n * 1_000
    }
    return ms
}

export function timeUntil(str) {
    if (!str) return '—'
    const ms = parseDuration(str)
    if (ms <= 0) return 'expired'

    const totalMins = Math.floor(ms / 60000)
    const days  = Math.floor(totalMins / 1440)
    const hours = Math.floor((totalMins % 1440) / 60)
    const mins  = totalMins % 60

    const hh = String(hours).padStart(2, '0')
    const mm = String(mins).padStart(2, '0')

    if (days > 0) return `${days}d ${hh}:${mm}`
    return `${hh}:${mm}`
}
