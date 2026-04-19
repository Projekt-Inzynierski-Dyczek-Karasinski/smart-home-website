import { useState } from 'react'
import styles from './css/AddModulePopup.module.css'

export default function AddModulePopup({ isOpen, onConfirm, onCancel }) {
    const [jsonConfig, setJsonConfig] = useState('')
    const [error, setError] = useState('')

    if (!isOpen) return null

    const handleConfirm = () => {
        if (!jsonConfig.trim()) {
            setError('Konfiguracja nie może być pusta')
            return
        }

        try {
            const parsedConfig = JSON.parse(jsonConfig)
            onConfirm(parsedConfig)
            setJsonConfig('')
            setError('')
        } catch (e) {
            setError('Nieprawidłowy format JSON')
        }
    }

    const handleCancel = () => {
        onCancel()
        setJsonConfig('')
        setError('')
    }

    const handleTextareaChange = (e) => {
        setJsonConfig(e.target.value)
        if (error) setError('')
    }

    return (
        <div className={styles.overlay} onClick={handleCancel}>
            <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
                <h3 className={styles.title}>Dodaj nowy moduł</h3>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Konfiguracja JSON:</label>
                    <textarea
                        className={styles.textarea}
                        value={jsonConfig}
                        onChange={handleTextareaChange}
                        placeholder='{
                          "values": {
                            "name": "nazwa",
                            "logic_address": 123,
                            "config": {
                              "connection": {"type": "radio", "rf_channel": 55},
                              "power_saving": true,
                              "sleep_after_send": true,
                              "default_sleep_duration": 3600000
                            }
                          },
                          "returning": "*"
                        }'
                        rows={20}
                    />
                    {error && <div className={styles.error}>{error}</div>}
                </div>

                <div className={styles.buttons}>
                    <button
                        className={`${styles.button} ${styles.confirmButton}`}
                        onClick={handleConfirm}
                    >
                        Zatwierdź
                    </button>
                    <button
                        className={`${styles.button} ${styles.cancelButton}`}
                        onClick={handleCancel}
                    >
                        Anuluj
                    </button>
                </div>
            </div>
        </div>
    )
}