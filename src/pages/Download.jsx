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
    const attemptedAliasRef = useRef(null)

    useEffect(() => {
        if (attemptedAliasRef.current === alias) return
        attemptedAliasRef.current = alias
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
            setMessage('Network error. Check server availability.')
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

            case 429:
                setStatus(STATUS.ERROR)
                setMessage('Too many download attempts. Please wait and try again.')
                break

            default:
                setStatus(STATUS.ERROR)
                setMessage(result.message)
        }
    }

    return (
        <div className={styles.root}>
            <nav className={styles.nav}>
                <Link to="/" className={styles.back}>← ExpireShare</Link>
            </nav>

            <main className={styles.main}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Download file</h1>
                    <div className={styles.aliasBadge}>{alias}</div>
                </div>

                <div className={styles.card}>
                    {status === STATUS.LOADING && (
                        <div className={styles.stateBlock}>
                            <div className={styles.spinner} />
                            <div className={styles.stateText}>Fetching file...</div>
                        </div>
                    )}

                    {status === STATUS.SUCCESS && (
                        <div className={styles.stateBlock}>
                            <div className={styles.stateIcon}>✓</div>
                            <div className={styles.stateTitle}>Download started</div>
                            <div className={styles.stateDesc}>Your file is being saved.</div>
                        </div>
                    )}

                    {status === STATUS.NOT_FOUND && (
                        <div className={styles.stateBlock}>
                            <div className={`${styles.stateIcon} ${styles.stateIconMuted}`}>—</div>
                            <div className={styles.stateTitle}>File not found</div>
                            <div className={styles.stateDesc}>
                                Expired, download limit reached, or invalid alias.
                            </div>
                        </div>
                    )}

                    {status === STATUS.PASSWORD && (
                        <>
                            <div className={styles.passwordHint}>
                                {message}
                            </div>
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
                            <button className={styles.btn} onClick={() => attempt(true)}>
                                Download
                            </button>
                        </>
                    )}

                    {status === STATUS.ERROR && (
                        <div className={styles.stateBlock}>
                            <div className={`${styles.stateIcon} ${styles.stateIconError}`}>!</div>
                            <div className={styles.stateTitle}>Something went wrong</div>
                            <div className={`${styles.stateDesc} ${styles.stateDescError}`}>{message}</div>
                            <button className={styles.retryBtn} onClick={() => attempt(false)}>
                                Try again
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
