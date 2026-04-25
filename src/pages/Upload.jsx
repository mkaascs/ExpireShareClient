import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { uploadFile } from '../api/files'
import styles from './Upload.module.css'
import {
    TTL_OPTIONS,
    TTL_DEFAULT,
    MAX_FILE_SIZE_BYTES,
    MAX_FILE_SIZE_LABEL,
    MAX_DOWNLOADS_DEFAULT,
    MAX_DOWNLOADS_LIMIT,
} from '../config'

function formatSize(bytes) {
    if (bytes < 1024)              return `${bytes} B`
    if (bytes < 1024 * 1024)      return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function Upload() {
    const { isAuth } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!isAuth) navigate('/login')
    }, [isAuth])

    const [file, setFile]                   = useState(null)
    const [ttl, setTtl]                     = useState(TTL_DEFAULT)
    const [maxDownloads, setMaxDownloads]   = useState(String(MAX_DOWNLOADS_DEFAULT))
    const [password, setPassword]           = useState('')
    const [drag, setDrag]                   = useState(false)
    const [uploading, setUploading]         = useState(false)
    const [result, setResult]               = useState(null)  // { alias, fileName }
    const [error, setError]                 = useState('')
    const [copied, setCopied]               = useState(false)

    const inputRef = useRef(null)

    const pickFile = (f) => {
        if (!f) return
        if (f.size > MAX_FILE_SIZE_BYTES) {
            setError(`File exceeds the ${MAX_FILE_SIZE_LABEL} limit.`)
            return
        }
        setFile(f)
        setError('')
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDrag(false)
        pickFile(e.dataTransfer.files[0])
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!file || uploading) return

        setUploading(true)
        setError('')

        const res = await uploadFile({
            file,
            ttl,
            maxDownloads: parseInt(maxDownloads, 10),
            password:     password || undefined,
        })

        setUploading(false)

        if (res.ok) {
            setResult({ alias: res.alias, fileName: file.name })
        } else {
            setError(
                res.status === 413 ? 'File exceeds the server limit.' :
                res.status === 403 ? 'Upload limit reached. Delete unnecessary files.' :
                res.errors[0]     ?? 'Upload failed. Try again.'
            )
        }
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(`${window.location.origin}/download/${result.alias}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleReset = () => {
        setFile(null)
        setPassword('')
        setMaxDownloads(String(MAX_DOWNLOADS_DEFAULT))
        setResult(null)
        setError('')
    }

    const shareLink = result ? `${window.location.origin}/download/${result.alias}` : ''

    return (
        <div className={styles.root}>
            <nav className={styles.nav}>
                <Link to="/" className={styles.logo}>ES</Link>
            </nav>

            <main className={styles.main}>
                {result ? (
                    /* SUCCESS */
                    <div className={styles.successBlock}>
                        <div className={styles.successIcon}>✓</div>
                        <div className={styles.successTitle}>File uploaded</div>
                        <div className={styles.successFile}>{result.fileName}</div>

                        <div className={styles.linkBox}>
                            <span className={styles.linkText}>{shareLink}</span>
                            <button className={styles.copyBtn} onClick={handleCopy}>
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>

                        <div className={styles.successActions}>
                            <button className={styles.resetBtn} onClick={handleReset}>
                                Upload another
                            </button>
                            <Link to="/files" className={styles.filesLink}>Your files →</Link>
                        </div>
                    </div>
                ) : (
                    /* FORM */
                    <>
                        <div className={styles.header}>
                            <h1 className={styles.title}>Upload file</h1>
                        </div>

                        <form className={styles.form} onSubmit={handleSubmit}>
                            {/* DROP ZONE */}
                            <div
                                className={[
                                    styles.dropzone,
                                    drag  ? styles.dropzoneActive   : '',
                                    file  ? styles.dropzoneHasFile  : '',
                                ].join(' ')}
                                onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
                                onDragLeave={() => setDrag(false)}
                                onDrop={handleDrop}
                                onClick={() => !file && inputRef.current?.click()}
                            >
                                <input
                                    ref={inputRef}
                                    type="file"
                                    className={styles.fileInput}
                                    onChange={(e) => pickFile(e.target.files[0])}
                                />
                                {file ? (
                                    <div className={styles.fileInfo}>
                                        <span className={styles.fileName}>{file.name}</span>
                                        <span className={styles.fileSize}>{formatSize(file.size)}</span>
                                        <button
                                            type="button"
                                            className={styles.clearBtn}
                                            onClick={(e) => { e.stopPropagation(); setFile(null) }}
                                        >×</button>
                                    </div>
                                ) : (
                                    <div className={styles.dropPrompt}>
                                        <div className={styles.dropArrow}>↑</div>
                                        <div className={styles.dropText}>
                                            Drop file here or{' '}
                                            <span className={styles.dropAccent}>click to browse</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* OPTIONS */}
                            <div className={styles.options}>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.fieldLabel}>Expires in</label>
                                    <div className={styles.pillRow}>
                                        {TTL_OPTIONS.map(opt => (
                                            <button
                                                key={opt.label}
                                                type="button"
                                                className={[styles.pill, ttl === opt.value ? styles.pillActive : ''].join(' ')}
                                                onClick={() => setTtl(opt.value)}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.row}>
                                    <div className={styles.fieldGroup}>
                                        <label className={styles.fieldLabel}>Max downloads</label>
                                        <input
                                            className={styles.input}
                                            type="number"
                                            min="1"
                                            max={MAX_DOWNLOADS_LIMIT}
                                            value={maxDownloads}
                                            onChange={e => setMaxDownloads(e.target.value)}
                                        />
                                    </div>

                                    <div className={styles.fieldGroup}>
                                        <label className={styles.fieldLabel}>
                                            Password <span className={styles.optional}>optional</span>
                                        </label>
                                        <input
                                            className={styles.input}
                                            type="password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder="No password"
                                            autoComplete="new-password"
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && <div className={styles.errorMsg}>{error}</div>}

                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={!file || uploading}
                            >
                                {uploading
                                    ? <><span className={styles.spinner} />Uploading…</>
                                    : 'Upload'}
                            </button>
                        </form>
                    </>
                )}
            </main>
        </div>
    )
}
