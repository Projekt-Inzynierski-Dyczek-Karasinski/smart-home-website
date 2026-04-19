import {useState} from 'react'
import styles from './css/AddModulePopup.module.css'

export default function AddModulePopup({isOpen, onConfirm, onCancel}) {
    const [jsonConfig, setJsonConfig] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    if (!isOpen) return null

    const handleConfirm = async () => {
        if (!jsonConfig.trim()) {
            setError('Konfiguracja nie może być pusta')
            return
        }

        let parsedConfig
        try {
            parsedConfig = JSON.parse(jsonConfig)
        } catch (e) {
            setError('Nieprawidłowy format JSON')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const success = await onConfirm(parsedConfig)
            if (success) {
                // Reset form only on success
                setJsonConfig('')
                setError('')
            } else {
                setError('Błędna konfiguracja')
            }
        } catch (e) {
            setError('Błędna konfiguracja')
        } finally {
            setIsLoading(false)
        }
    }



    const handleCancel = () => {
        if (isLoading) return // Prevent closing while loading
        onCancel()
        setJsonConfig('')
        setError('')
    }

    const handleTextareaChange = (e) => {
        if (isLoading) return // Prevent editing while loading
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
                        placeholder='{"name": "Nowy moduł", "logic_address": "0x1234", ...}'
                        rows={20}
                        disabled={isLoading}
                    />
                    {error && <div className={styles.error}>{error}</div>}
                </div>

                <div className={styles.buttons}>
                    <button
                        className={`${styles.button} ${styles.confirmButton} ${isLoading ? styles.loading : ''}`}
                        onClick={handleConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Dodawanie...' : 'Zatwierdź'}
                    </button>
                    <button
                        className={`${styles.button} ${styles.cancelButton}`}
                        onClick={handleCancel}
                        disabled={isLoading}
                    >
                        Anuluj
                    </button>
                </div>
            </div>
        </div>
    )
}