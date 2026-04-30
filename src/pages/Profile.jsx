import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserFiles, deleteFile } from '../api/files'
import styles from './Profile.module.css'

function parseDuration(str) {
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

function timeUntil(str) {
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

export default function Profile() {
    const { isAuth } = useAuth()
    const navigate = useNavigate()

    const [files, setFiles] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [deleting, setDeleting] = useState(null)
    const [confirmFile, setConfirmFile] = useState(null)
    const [copiedAlias, setCopiedAlias] = useState(null)

    const handleCopy = (alias) => {
        const url = `${window.location.origin}/download/${alias}`
        navigator.clipboard.writeText(url)
        setCopiedAlias(alias)
        setTimeout(() => setCopiedAlias(null), 2000)
    }

    const fetchedRef = useRef(false)

    useEffect(() => {
        if (!isAuth) {
            navigate('/login')
            return
        }

        if (fetchedRef.current) return
        fetchedRef.current = true

        getUserFiles()
            .then(res => {
                if (res.ok) {
                    setFiles(res.files)
                } else {
                    setError('Failed to load files.')
                }
            })
            .finally(() => setLoading(false))
    }, [isAuth])

    const handleDeleteConfirm = async () => {
        const { alias } = confirmFile
        setConfirmFile(null)
        setDeleting(alias)
        const res = await deleteFile(alias)
        if (res.ok) {
            setFiles(f => f.filter(file => file.alias !== alias))
        }
        setDeleting(null)
    }

    return (
        <div className={styles.root}>
            <nav className={styles.nav}>
                <Link to="/" className={styles.logo}>ES</Link>
            </nav>

            <main className={styles.main}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Your files</h1>
                    {!loading && !error && (
                        <span className={styles.count}>{files.length}</span>
                    )}
                </div>

                {loading && (
                    <div className={styles.centerBlock}>
                        <div className={styles.spinner} />
                    </div>
                )}

                {error && (
                    <div className={styles.centerBlock}>
                        <div className={styles.errorMsg}>{error}</div>
                    </div>
                )}

                {!loading && !error && files.length === 0 && (
                    <div className={styles.empty}>
                        <div className={styles.emptyTitle}>No files yet</div>
                        <div className={styles.emptyDesc}>Files you upload will appear here.</div>
                    </div>
                )}

                {!loading && !error && files.length > 0 && (
                    <ul className={styles.list}>
                        {files.map(file => (
                            <li key={file.alias} className={styles.item}>
                                <div
                                    className={styles.itemMain}
                                    onClick={() => handleCopy(file.alias)}
                                    title="Copy download link"
                                >
                                    <span className={styles.filename}>{file.filename}</span>
                                    <span className={copiedAlias === file.alias ? styles.aliasCopied : styles.alias}>
                                        {copiedAlias === file.alias ? 'Copied!' : file.alias}
                                    </span>
                                </div>
                                <div className={styles.itemMeta}>
                                    <span className={styles.metaTag}>
                                        {file.downloads_left == null
                                            ? '∞ downloads'
                                            : `${file.downloads_left} left`}
                                    </span>
                                    <span className={styles.metaDot}>·</span>
                                    <span className={styles.metaTag}>
                                        {timeUntil(file.expires_at)}
                                    </span>
                                </div>
                                <button
                                    className={styles.deleteBtn}
                                    onClick={() => setConfirmFile({ alias: file.alias, filename: file.filename })}
                                    disabled={deleting === file.alias}
                                    title="Delete file"
                                >
                                    {deleting === file.alias ? '...' : '×'}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </main>

            {confirmFile && (
                <div className={styles.overlay} onClick={() => setConfirmFile(null)}>
                    <div className={styles.dialog} onClick={e => e.stopPropagation()}>
                        <div className={styles.dialogTitle}>Delete file?</div>
                        <div className={styles.dialogFile}>{confirmFile.filename}</div>
                        <div className={styles.dialogDesc}>
                            This action cannot be undone.
                        </div>
                        <div className={styles.dialogActions}>
                            <button
                                className={styles.dialogCancel}
                                onClick={() => setConfirmFile(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.dialogDelete}
                                onClick={handleDeleteConfirm}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
