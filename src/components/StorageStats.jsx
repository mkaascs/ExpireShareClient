import { formatBytes } from '../utils/format'
import styles from './StorageStats.module.css'

const R    = 36
const CIRC = 2 * Math.PI * R

function ringColor(pct) {
    if (pct >= 0.9)  return 'var(--error)'
    if (pct >= 0.75) return '#c9974a'
    return 'var(--accent)'
}

function DonutSection({ pct, label, value, sub }) {
    const clamped = Math.min(Math.max(pct, 0), 1)
    const color   = ringColor(clamped)
    const offset  = CIRC * (1 - clamped)

    return (
        <div className={styles.section}>
            <svg viewBox="0 0 100 100" className={styles.donut}>
                <circle
                    cx="50" cy="50" r={R}
                    fill="none"
                    style={{ stroke: 'rgba(var(--accent-rgb), 0.1)' }}
                    strokeWidth="9"
                />
                <circle
                    className={styles.donutFill}
                    cx="50" cy="50" r={R}
                    fill="none"
                    style={{ stroke: color }}
                    strokeWidth="9"
                    strokeDasharray={CIRC}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                />
                <text x="50" y="50" className={styles.donutText} style={{ fill: color }}>
                    {Math.round(clamped * 100)}%
                </text>
            </svg>
            <div className={styles.info}>
                <span className={styles.label}>{label}</span>
                <span className={styles.value}>{value}</span>
                <span className={styles.sub}>{sub}</span>
            </div>
        </div>
    )
}

export default function StorageStats({ stats }) {
    if (!stats) return null

    const { occupied_size, max_size } = stats
    const sizePct = max_size > 0 ? occupied_size / max_size : 0

    return (
        <div className={styles.card}>
            <DonutSection
                pct={sizePct}
                label="Storage"
                value={`${formatBytes(occupied_size, '0 KB')} / ${formatBytes(max_size, '0 KB')}`}
                sub={`${formatBytes(max_size - occupied_size, '0 KB')} free`}
            />
        </div>
    )
}
