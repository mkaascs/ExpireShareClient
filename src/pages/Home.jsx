import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Home.module.css'

const HEADLINE = "Files that disappear\nwhen their work is done."
const ACCENT_START = 11  // index of 'd' in 'disappear'
const ACCENT_END   = 20  // index of '\n' (exclusive end of 'disappear')

function renderTyped(str) {
    const len = str.length
    const before = str.slice(0, Math.min(len, ACCENT_START))
    const accent  = len > ACCENT_START ? str.slice(ACCENT_START, Math.min(len, ACCENT_END)) : ''
    const hasBreak = len > ACCENT_END
    const after   = len > ACCENT_END + 1 ? str.slice(ACCENT_END + 1) : ''

    return (
        <>
            {before}
            {accent && <span className={styles.accentWord}>{accent}</span>}
            {hasBreak && <br />}
            {after}
        </>
    )
}

export default function Home() {
    const [alias, setAlias] = useState('')
    const navigate = useNavigate()
    const { isAuth } = useAuth()

    const [typed, setTyped]           = useState('')
    const [typingDone, setTypingDone] = useState(false)

    useEffect(() => {
        let i = 0
        const id = setInterval(() => {
            i++
            setTyped(HEADLINE.slice(0, i))
            if (i >= HEADLINE.length) {
                clearInterval(id)
                setTypingDone(true)
            }
        }, 30)
        return () => clearInterval(id)
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault()
        const trimmed = alias.trim()
        if (trimmed) navigate(`/download/${encodeURIComponent(trimmed)}`)
    }

    return (
        <div className={styles.root}>
            <nav className={styles.nav}>
                <span className={styles.logoMark}>ES</span>
                <div className={styles.navActions}>
                    {isAuth ? (
                        <Link to="/files" className={styles.navBtn}>Files</Link>
                    ) : (
                        <>
                            <Link to="/login" className={styles.navLink}>Sign in</Link>
                            <Link to="/register" className={styles.navBtn}>Register</Link>
                        </>
                    )}
                </div>
            </nav>

            <div className={styles.content}>
                <main className={styles.main}>
                    <div className={styles.eyebrow}>
                        <span className={styles.eyebrowDot} />
                        File sharing, simplified
                    </div>

                    <h1 className={styles.headline}>
                        {renderTyped(typed)}
                        {!typingDone && (
                            <span className={styles.cursor} aria-hidden="true">|</span>
                        )}
                    </h1>

                    <p className={styles.body}>
                        Upload a file with a time limit and download cap.
                        Share the link. It's gone when it's supposed to be.
                    </p>

                    <form onSubmit={handleSubmit} className={styles.aliasForm}>
                        <input
                            className={styles.aliasInput}
                            value={alias}
                            onChange={e => setAlias(e.target.value)}
                            placeholder="Enter file alias…"
                        />
                        <button
                            type="submit"
                            className={styles.cta}
                            disabled={!alias.trim()}
                        >
                            Download
                        </button>
                    </form>
                </main>

                <aside className={styles.features}>
                    <div className={styles.feature}>
                        <div className={styles.featureHeader}>
                            <span className={styles.featureNum}>01</span>
                            <span className={styles.featureTitle}>Download limit</span>
                        </div>
                        <div className={styles.featureDesc}>
                            Set a maximum number of downloads. The file removes itself after the last one.
                        </div>
                    </div>
                    <div className={styles.featureDivider} />
                    <div className={styles.feature}>
                        <div className={styles.featureHeader}>
                            <span className={styles.featureNum}>02</span>
                            <span className={styles.featureTitle}>TTL expiration</span>
                        </div>
                        <div className={styles.featureDesc}>
                            Files expire automatically. 1h, 24h, 7 days — your choice.
                        </div>
                    </div>
                    <div className={styles.featureDivider} />
                    <div className={styles.feature}>
                        <div className={styles.featureHeader}>
                            <span className={styles.featureNum}>03</span>
                            <span className={styles.featureTitle}>Password lock</span>
                        </div>
                        <div className={styles.featureDesc}>
                            Protect a file with a password. Only those who know it can open it.
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    )
}
