import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { getUserFiles, deleteFile, getFileStats } from '../api/files'
import StorageStats from '../components/StorageStats'
import { formatBytes } from '../utils/format'
import { timeUntil } from '../utils/duration'
import styles from './Profile.module.css'

const LIMIT = 10

export default function Profile() {
    const { isAuth } = useAuth()
    const navigate = useNavigate()

    const [files, setFiles]       = useState([])
    const [total, setTotal]       = useState(0)
    const [page, setPage]         = useState(1)
    const [refetchKey, setRefetchKey] = useState(0)
    const [stats, setStats]       = useState(null)
    const [loading, setLoading]   = useState(true)
    const [error, setError]       = useState('')
    const [deleting, setDeleting] = useState(null)
    const [confirmFile, setConfirmFile] = useState(null)
    const [copiedAlias, setCopiedAlias] = useState(null)

    useEffect(() => { document.title = 'Your files · ExpireShare' }, [])

    useEffect(() => {
        if (!isAuth) { navigate('/login'); return }

        let cancelled = false

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true)
        setError('')

        Promise.all([getUserFiles(page, LIMIT), getFileStats()])
            .then(([filesRes, statsRes]) => {
                if (cancelled) return
                if (filesRes.ok) {
                    setFiles(filesRes.files)
                    setTotal(filesRes.total)
                } else {
                    setError('Failed to load files.')
                }
                if (statsRes.ok) setStats(statsRes)
            })
            .finally(() => { if (!cancelled) setLoading(false) })

        return () => { cancelled = true }
    }, [isAuth, page, refetchKey, navigate])

    const handleCopy = (alias) => {
        navigator.clipboard.writeText(`${window.location.origin}/download/${alias}`)
        setCopiedAlias(alias)
        setTimeout(() => setCopiedAlias(null), 2000)
    }

    const handleDeleteConfirm = async () => {
        const { alias } = confirmFile
        setConfirmFile(null)
        setDeleting(alias)
        const res = await deleteFile(alias)
        setDeleting(null)
        if (res.ok) {
            if (files.length === 1 && page > 1) {
                setPage(p => p - 1)
            } else {
                setRefetchKey(k => k + 1)
            }
        }
    }

    const totalPages = Math.ceil(total / LIMIT)

    return (
        <div className={styles.root}>
            <nav className={styles.nav}>
                <Link to="/" className={styles.logo}>ES</Link>
            </nav>

            <main className={styles.main}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Your files</h1>
                    {!loading && !error && (
                        <span className={styles.count}>{total}</span>
                    )}
                </div>

                <div className={styles.content}>
                    <div className={styles.listSection}>
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
                                <div className={styles.emptyDesc}>Upload a file to get started.</div>
                                <Link to="/upload" className={styles.emptyLink}>Upload a file</Link>
                            </div>
                        )}

                        {!loading && !error && files.length > 0 && (
                            <>
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
                                                <span className={styles.metaTag}>{formatBytes(file.filesize)}</span>
                                                <span className={styles.metaDot}>·</span>
                                                <span className={styles.metaTag}>
                                                    {file.downloads_left == null ? '∞' : `${file.downloads_left} left`}
                                                </span>
                                                <span className={styles.metaDot}>·</span>
                                                <span className={styles.metaTag}>{timeUntil(file.expires_at)}</span>
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

                                {totalPages > 1 && (
                                    <div className={styles.pagination}>
                                        <button
                                            className={styles.pageBtn}
                                            onClick={() => setPage(p => p - 1)}
                                            disabled={page === 1}
                                        >
                                            ← Prev
                                        </button>
                                        <span className={styles.pageInfo}>{page} / {totalPages}</span>
                                        <button
                                            className={styles.pageBtn}
                                            onClick={() => setPage(p => p + 1)}
                                            disabled={page === totalPages}
                                        >
                                            Next →
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className={styles.sidebar}>
                        <StorageStats stats={stats} />
                    </div>
                </div>
            </main>

            {confirmFile && (
                <div className={styles.overlay} onClick={() => setConfirmFile(null)}>
                    <div className={styles.dialog} onClick={e => e.stopPropagation()}>
                        <div className={styles.dialogTitle}>Delete file?</div>
                        <div className={styles.dialogFile}>{confirmFile.filename}</div>
                        <div className={styles.dialogDesc}>This action cannot be undone.</div>
                        <div className={styles.dialogActions}>
                            <button className={styles.dialogCancel} onClick={() => setConfirmFile(null)}>
                                Cancel
                            </button>
                            <button className={styles.dialogDelete} onClick={handleDeleteConfirm}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
