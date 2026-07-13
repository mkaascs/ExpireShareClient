import { describe, it, expect } from 'vitest'
import { parseDuration, timeUntil } from './duration'

describe('parseDuration', () => {
    it('returns 0 for empty input', () => {
        expect(parseDuration('')).toBe(0)
        expect(parseDuration(null)).toBe(0)
        expect(parseDuration(undefined)).toBe(0)
    })

    it('parses single unit', () => {
        expect(parseDuration('1s')).toBe(1_000)
        expect(parseDuration('1m')).toBe(60_000)
        expect(parseDuration('1h')).toBe(3_600_000)
        expect(parseDuration('1d')).toBe(86_400_000)
    })

    it('sums multiple units', () => {
        expect(parseDuration('1h30m')).toBe(3_600_000 + 30 * 60_000)
        expect(parseDuration('2d3h')).toBe(2 * 86_400_000 + 3 * 3_600_000)
    })

    it('ignores unknown chars', () => {
        expect(parseDuration('abc1h')).toBe(3_600_000)
    })
})

describe('timeUntil', () => {
    it('returns em dash for empty input', () => {
        expect(timeUntil('')).toBe('—')
        expect(timeUntil(null)).toBe('—')
    })

    it('returns "expired" for zero duration', () => {
        expect(timeUntil('0s')).toBe('expired')
    })

    it('formats hh:mm when under a day', () => {
        expect(timeUntil('2h5m')).toBe('02:05')
        expect(timeUntil('23h59m')).toBe('23:59')
    })

    it('prepends days when over a day', () => {
        expect(timeUntil('1d2h30m')).toBe('1d 02:30')
        expect(timeUntil('7d')).toBe('7d 00:00')
    })

    it('pads single-digit hours and minutes', () => {
        expect(timeUntil('1h1m')).toBe('01:01')
    })
})
