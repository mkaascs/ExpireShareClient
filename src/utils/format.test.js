import { describe, it, expect } from 'vitest'
import { formatBytes } from './format'

describe('formatBytes', () => {
    it('returns fallback for zero or nullish', () => {
        expect(formatBytes(0)).toBe('—')
        expect(formatBytes(null)).toBe('—')
        expect(formatBytes(undefined)).toBe('—')
    })

    it('uses custom fallback', () => {
        expect(formatBytes(0, '0 KB')).toBe('0 KB')
    })

    it('formats KB with no decimals', () => {
        expect(formatBytes(1024)).toBe('1 KB')
        expect(formatBytes(1536)).toBe('2 KB')
        expect(formatBytes(500 * 1024)).toBe('500 KB')
    })

    it('formats MB with one decimal', () => {
        expect(formatBytes(1024 * 1024)).toBe('1.0 MB')
        expect(formatBytes(1.5 * 1024 * 1024)).toBe('1.5 MB')
        expect(formatBytes(500 * 1024 * 1024)).toBe('500.0 MB')
    })

    it('formats GB with two decimals', () => {
        expect(formatBytes(1024 * 1024 * 1024)).toBe('1.00 GB')
        expect(formatBytes(2.5 * 1024 * 1024 * 1024)).toBe('2.50 GB')
    })

    it('crosses unit boundaries at 1024, not 1000', () => {
        expect(formatBytes(1024 * 1024 - 1)).toMatch(/KB$/)
        expect(formatBytes(1024 * 1024)).toMatch(/MB$/)
    })
})
