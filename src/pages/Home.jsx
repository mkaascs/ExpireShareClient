import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Home.module.css'

export default function Home() {
    const [alias, setAlias] = useState('')
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()
        const trimmed = alias.trim()
        if (trimmed) navigate(`/download/${encodeURIComponent(trimmed)}`)
    }

    return (
        <div className={styles.root}>
            <nav className={styles.nav}>
                <span className={styles.logoMark}>ES</span>
            </nav>

            <main className={styles.main}>
                <div className={styles.eyebrow}>File sharing, simplified</div>

                <h1 className={styles.headline}>
                    Files that{' '}
                    <em className={styles.script}>disappear</em>
                    <br />when their work is done.
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
                        placeholder="Enter file alias"
                    />
                    <button
                        type="submit"
                        className={styles.cta}
                        disabled={!alias.trim()}
                    >
                        Download →
                    </button>
                </form>
            </main>

            <footer className={styles.features}>
                <div className={styles.feature}>
                    <div className={styles.featureNum}>I</div>
                    <div className={styles.featureTitle}>Download limit</div>
                    <div className={styles.featureDesc}>
                        Set a maximum number of downloads. The file removes itself after the last one.
                    </div>
                </div>
                <div className={styles.featureDivider} />
                <div className={styles.feature}>
                    <div className={styles.featureNum}>II</div>
                    <div className={styles.featureTitle}>TTL expiration</div>
                    <div className={styles.featureDesc}>
                        Files expire automatically. 1h, 24h, 7 days — your choice.
                    </div>
                </div>
                <div className={styles.featureDivider} />
                <div className={styles.feature}>
                    <div className={styles.featureNum}>III</div>
                    <div className={styles.featureTitle}>Password lock</div>
                    <div className={styles.featureDesc}>
                        Protect a file with a password. Only those who know it can open it.
                    </div>
                </div>
            </footer>
        </div>
    )
}
