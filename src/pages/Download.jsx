import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { downloadFile, triggerDownload } from '../api/files.js'
import styles from './Download.module.css'

const STATUS = {
    LOADING: 'loading',
    PASSWORD: 'password',
    SUCCESS: 'success',
    NOT_FOUND: 'not_found',
    ERROR: 'error',
}

export default function Download() {
    const { alias } = useParams()
    const [password, setPassword] = useState('')
    const [status, setStatus] = useState(STATUS.LOADING)
    const [message, setMessage] = useState('')

    const passwordRef = useRef(null)

    useEffect(() => {
        attempt(false)
    }, [alias])

    useEffect(() => {
        if (status === STATUS.PASSWORD) {
            passwordRef.current?.focus()
        }
    }, [status])

    const attempt = async (withPassword) => {
        setStatus(STATUS.LOADING)
        setMessage('')

        let result
        try {
            result = await downloadFile(alias, withPassword ? password : '')
        } catch {
            setStatus(STATUS.ERROR)
            setMessage('Network error. Check CORS or server availability.')
            return
        }

        if (result.ok) {
            triggerDownload(result.blob, result.filename)
            setStatus(STATUS.SUCCESS)
            return
        }

        switch (result.status) {
            case 401:
                setStatus(STATUS.PASSWORD)
                setMessage('This file is password-protected.')
                break

            case 403:
                setStatus(STATUS.PASSWORD)
                setMessage('Incorrect password. Try again.')
                setPassword('')
                setTimeout(() => passwordRef.current?.focus(), 50)
                break

            case 404:
                setStatus(STATUS.NOT_FOUND)
                break

            default:
                setStatus(STATUS.ERROR)
                setMessage(result.message)
        }
    }

    const isLoading = status === STATUS.LOADING

    return (
        <div className={styles.root}>
            <nav className={styles.nav}>
                <Link to="/" className={styles.back}>← ExpireShare</Link>
            </nav>

            <main className={styles.main}>
                <div className={styles.label}>Download file</div>
                <h1 className={styles.heading}>
                    <em className={styles.script}>{alias}</em>
                </h1>

                <div className={styles.card}>
                    {status === STATUS.LOADING && (
                        <div className={styles.loadingBlock}>
                            <div className={styles.spinner} />
                        </div>
                    )}

                    {status === STATUS.SUCCESS && (
                        <div className={styles.successBlock}>
                            <div className={styles.successIcon}>✓</div>
                            <div className={styles.successTitle}>File downloaded successfully</div>
                        </div>
                    )}

                    {status === STATUS.NOT_FOUND && (
                        <div className={styles.notFoundBlock}>
                            <div className={styles.notFoundTitle}>File not found</div>
                            <div className={styles.notFoundDesc}>
                                Expired, download limit reached, or invalid alias.
                            </div>
                        </div>
                    )}

                    {status === STATUS.PASSWORD && (
                        <>
                            {message && (
                                <div className={styles.errorMsg}>{message}</div>
                            )}
                            <div className={styles.fieldGroup}>
                                <label className={styles.fieldLabel}>Password</label>
                                <input
                                    ref={passwordRef}
                                    className={styles.input}
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && attempt(true)}
                                    placeholder="Enter file password"
                                />
                            </div>
                            <button
                                className={styles.btn}
                                onClick={() => attempt(true)}
                            >
                                Download
                            </button>
                        </>
                    )}

                    {status === STATUS.ERROR && (
                        <>
                            <div className={styles.errorMsg}>{message}</div>
                            <button
                                className={styles.btn}
                                onClick={() => attempt(false)}
                            >
                                Try again
                            </button>
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}
