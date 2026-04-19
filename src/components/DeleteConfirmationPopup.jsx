import { useState } from 'react'
import styles from './css/DeleteConfirmationPopup.module.css'

export default function DeleteConfirmationPopup({ isOpen, moduleName, onConfirm, onCancel }) {
    const [isLoading, setIsLoading] = useState(false)

    if (!isOpen) return null

    const handleConfirm = async () => {
        setIsLoading(true)
        try {
            await onConfirm()
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = () => {
        if (isLoading) return // Prevent closing while loading
        onCancel()
    }

    return (
        <div className={styles.overlay} onClick={handleCancel}>
            <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
                <h3 className={styles.title}>
                    Czy napewno chcesz usunąć moduł `{moduleName}`?
                </h3>
                <div className={styles.buttons}>
                    <button 
                        className={`${styles.button} ${styles.confirmButton} ${isLoading ? styles.loading : ''}`} 
                        onClick={handleConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Usuwanie...' : 'Tak'}
                    </button>
                    <button 
                        className={`${styles.button} ${styles.cancelButton}`} 
                        onClick={handleCancel}
                        disabled={isLoading}
                    >
                        Nie
                    </button>
                </div>
            </div>
        </div>
    )
}