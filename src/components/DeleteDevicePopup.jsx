'use client'

import styles from './css/DeleteConfirmationPopup.module.css'

export default function DeleteDevicePopup({ isOpen, onConfirm, onCancel, deviceName, deviceType, isLoading }) {
    if (!isOpen) return null

    return (
        <div className={styles.overlay} onClick={onCancel}>
            <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
                <p className={styles.message}>
                    Czy napewno chcesz usunąć <strong>{deviceName}</strong>?
                </p>
                <br/>

                <div className={styles.buttons}>
                    <button
                        className={`${styles.button} ${styles.confirmButton}`}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Usuwanie...' : 'Tak'}
                    </button>
                    <button
                        className={`${styles.button} ${styles.cancelButton}`}
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Nie
                    </button>
                </div>
            </div>
        </div>
    )
}