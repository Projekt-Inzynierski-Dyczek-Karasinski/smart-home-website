import styles from './css/DeleteConfirmationPopup.module.css'

export default function DeleteConfirmationPopup({ isOpen, moduleName, onConfirm, onCancel }) {
    if (!isOpen) return null

    return (
        <div className={styles.overlay} onClick={onCancel}>
            <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
                <h3 className={styles.title}>
                    Czy napewno chcesz usunąć moduł `{moduleName}`?
                </h3>
                <div className={styles.buttons}>
                    <button
                        className={`${styles.button} ${styles.confirmButton}`}
                        onClick={onConfirm}
                    >
                        Tak
                    </button>
                    <button
                        className={`${styles.button} ${styles.cancelButton}`}
                        onClick={onCancel}
                    >
                        Nie
                    </button>
                </div>
            </div>
        </div>
    )
}