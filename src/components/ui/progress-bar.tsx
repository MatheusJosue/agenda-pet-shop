import styles from './progress-bar.module.css'

interface ProgressBarProps {
  current: number
  total: number
  showLabel?: boolean
  size?: 'sm' | 'md'
}

export function ProgressBar({ current, total, showLabel = true, size = 'md' }: ProgressBarProps) {
  const percentage = Math.max(0, Math.min(100, (current / total) * 100))
  const isLow = percentage <= 25

  return (
    <div className={styles.container}>
      {showLabel && (
        <span className={styles.label}>
          {current} de {total}
        </span>
      )}
      <div className={`${styles.track} ${styles[size]}`}>
        <div
          className={`${styles.fill} ${isLow ? styles.low : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
