import styles from './css/AddModuleCard.module.css'

export default function AddModuleCard({ onClick }) {
    return (
        <article className={styles.card} onClick={onClick}>
            <div className={styles.content}>
                <div className={styles.plusIcon}>+</div>
                <div className={styles.text}>Dodaj nowy moduł</div>
            </div>
        </article>
    )
}