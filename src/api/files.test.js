import { describe, it, expect } from 'vitest'
import { parseFilename, parseErrorMessage } from './files'

describe('parseFilename', () => {
    it('extracts unquoted filename', () => {
        expect(parseFilename('attachment; filename=report.pdf', 'fb')).toBe('report.pdf')
    })

    it('extracts double-quoted filename', () => {
        expect(parseFilename('attachment; filename="my file.pdf"', 'fb')).toBe('my file.pdf')
    })

    it('extracts single-quoted filename', () => {
        expect(parseFilename("attachment; filename='file.pdf'", 'fb')).toBe('file.pdf')
    })

    it('trims whitespace', () => {
        expect(parseFilename('attachment; filename=  spaced.pdf  ', 'fb')).toBe('spaced.pdf')
    })

    it('falls back when no filename present', () => {
        expect(parseFilename('attachment', 'fallback')).toBe('fallback')
        expect(parseFilename('', 'fallback')).toBe('fallback')
    })
})

describe('parseErrorMessage', () => {
    const jsonRes = (body) => ({ json: async () => body })

    it('returns first error from errors array', async () => {
        const res = jsonRes({ errors: ['not found', 'other'] })
        await expect(parseErrorMessage(res)).resolves.toBe('not found')
    })

    it('returns default when errors array is empty', async () => {
        const res = jsonRes({ errors: [] })
        await expect(parseErrorMessage(res)).resolves.toBe('Something went wrong.')
    })

    it('returns default when errors missing', async () => {
        const res = jsonRes({})
        await expect(parseErrorMessage(res)).resolves.toBe('Something went wrong.')
    })

    it('returns default when json parsing throws', async () => {
        const res = { json: async () => { throw new Error('bad json') } }
        await expect(parseErrorMessage(res)).resolves.toBe('Something went wrong.')
    })
})
