import {useState} from 'react'
import styles from './css/AddModulePopup.module.css'

export default function AddModulePopup({isOpen, onConfirm, onCancel}) {
    const [name, setName] = useState('')
    const [logicAddress, setLogicAddress] = useState('')
    const [rfChannel, setRfChannel] = useState('')
    const [powerSaving, setPowerSaving] = useState(true)
    const [sleepAfterSend, setSleepAfterSend] = useState(true)
    const [defaultSleepDuration, setDefaultSleepDuration] = useState(3600000)
    const [jsonConfig, setJsonConfig] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    if (!isOpen) return null

    const handleConfirm = async () => {
        if (!name.trim()) {
            setError('Nazwa nie może być pusta')
            return
        }
        
        if (!logicAddress.trim()) {
            setError('Adres logiczny nie może być pusty')
            return
        }
        
        if (!rfChannel.trim()) {
            setError('Kanał radiowy nie może być pusty')
            return
        }

        const logicAddressNumber = parseInt(logicAddress)
        const rfChannelNumber = parseInt(rfChannel)
        
        if (isNaN(logicAddressNumber)) {
            setError('Adres logiczny musi być liczbą')
            return
        }
        
        if (isNaN(rfChannelNumber)) {
            setError('Kanał radiowy musi być liczbą')
            return
        }

        let additionalConfig = {}
        if (jsonConfig.trim()) {
            try {
                additionalConfig = JSON.parse(jsonConfig)
            } catch (e) {
                setError('Nieprawidłowy format JSON w dodatkowej konfiguracji')
                return
            }
        }

        const requestBody = {
            values: {
                name: name.trim(),
                logic_address: logicAddressNumber,
                config: {
                    connection: {
                        type: "radio",
                        rf_channel: rfChannelNumber
                    },
                    power_saving: powerSaving,
                    sleep_after_send: sleepAfterSend,
                    default_sleep_duration: defaultSleepDuration,
                    ...additionalConfig
                }
            }
        }

        setIsLoading(true)
        setError('')

        try {
            const success = await onConfirm(requestBody)
            if (success) {
                // Reset form only on success
                setName('')
                setLogicAddress('')
                setRfChannel('')
                setPowerSaving(true)
                setSleepAfterSend(true)
                setDefaultSleepDuration(3600000)
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
        setName('')
        setLogicAddress('')
        setRfChannel('')
        setPowerSaving(true)
        setSleepAfterSend(true)
        setDefaultSleepDuration(3600000)
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
                    <label className={styles.label}>Nazwa:</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nazwa modułu"
                        disabled={isLoading}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Adres logiczny:</label>
                    <input
                        type="number"
                        className={styles.input}
                        value={logicAddress}
                        onChange={(e) => setLogicAddress(e.target.value)}
                        placeholder="16"
                        disabled={isLoading}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Kanał radiowy:</label>
                    <input
                        type="number"
                        className={styles.input}
                        value={rfChannel}
                        onChange={(e) => setRfChannel(e.target.value)}
                        placeholder="32"
                        disabled={isLoading}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={powerSaving}
                            onChange={(e) => setPowerSaving(e.target.checked)}
                            disabled={isLoading}
                        />
                        Oszczędzanie energii
                    </label>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={sleepAfterSend}
                            onChange={(e) => setSleepAfterSend(e.target.checked)}
                            disabled={isLoading}
                        />
                        Usypianie po komunikacji
                    </label>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Domyślny czas uśpienia (ms):</label>
                    <input
                        type="number"
                        className={styles.input}
                        value={defaultSleepDuration}
                        onChange={(e) => setDefaultSleepDuration(parseInt(e.target.value) || 3600000)}
                        placeholder="3600000"
                        disabled={isLoading}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Dodatkowa konfiguracja JSON:</label>
                    <textarea
                        className={styles.textarea}
                        value={jsonConfig}
                        onChange={handleTextareaChange}
                        placeholder='{"custom_setting": "value", "another_option": true}'
                        rows={8}
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