import { useTheme } from '../context/ThemeContext'
import styles from './ThemeToggle.module.css'

export default function ThemeToggle() {
    const { theme, toggle } = useTheme()
    return (
        <button
            className={styles.btn}
            onClick={toggle}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {theme === 'dark' ? '☀' : '☾'}
        </button>
    )
}
