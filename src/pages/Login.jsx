import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Auth.module.css'

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()

    const [form, setForm] = useState({ login: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const res = await login(form.login, form.password)

        setLoading(false)

        if (res.ok) {
            navigate('/')
            return
        }

        if (res.status === 401) {
            setError('Invalid login or password.')
        } else if (res.status === 429) {
            setError('Too many attempts. Please wait and try again.')
        } else if (res.status === 422 || res.data?.errors?.length) {
            setError(res.data.errors[0])
        } else {
            setError('Something went wrong. Try again.')
        }
    }

    return (
        <div className={styles.root}>
            <nav className={styles.nav}>
                <Link to="/" className={styles.back}>← ExpireShare</Link>
            </nav>

            <main className={styles.main}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Sign in</h1>
                    <p className={styles.subtitle}>
                        No account?{' '}
                        <Link to="/register" className={styles.subtitleLink}>Register</Link>
                    </p>
                </div>

                <form className={styles.card} onSubmit={handleSubmit}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Login</label>
                        <input
                            className={styles.input}
                            value={form.login}
                            onChange={set('login')}
                            placeholder="your_login"
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Password</label>
                        <input
                            className={styles.input}
                            type="password"
                            value={form.password}
                            onChange={set('password')}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {error && <div className={styles.errorMsg}>{error}</div>}

                    <button className={styles.btn} type="submit" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>
            </main>
        </div>
    )
}
