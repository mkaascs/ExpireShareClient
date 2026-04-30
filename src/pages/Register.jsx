import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as authApi from '../api/auth'
import styles from './Auth.module.css'

export default function Register() {
    const navigate = useNavigate()

    const [form, setForm] = useState({ login: '', email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const res = await authApi.register(form.login, form.email, form.password)
        setLoading(false)

        if (res.ok) {
            navigate('/login')
            return
        }

        if (res.status === 409) {
            setError('Login or email already taken.')
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
                    <h1 className={styles.title}>Create account</h1>
                    <p className={styles.subtitle}>
                        Already have one?{' '}
                        <Link to="/login" className={styles.subtitleLink}>Sign in</Link>
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
                            minLength={3}
                            required
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Email</label>
                        <input
                            className={styles.input}
                            type="email"
                            value={form.email}
                            onChange={set('email')}
                            placeholder="you@example.com"
                            autoComplete="email"
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
                            autoComplete="new-password"
                            minLength={5}
                            required
                        />
                    </div>

                    {error && <div className={styles.errorMsg}>{error}</div>}

                    <button className={styles.btn} type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create account'}
                    </button>
                </form>
            </main>
        </div>
    )
}
