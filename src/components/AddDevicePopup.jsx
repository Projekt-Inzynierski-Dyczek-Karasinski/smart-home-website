'use client'

import { useState } from 'react'
import styles from './css/AddDevicePopup.module.css'

export default function AddDevicePopup({ isOpen, onClose, deviceType, moduleId, onDeviceAdded }) {
    const [formData, setFormData] = useState({
        name: '',
        logic_id: '',
        jsonConfig: ''
    })
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const resetForm = () => {
        setFormData({
            name: '',
            logic_id: '',
            jsonConfig: ''
        })
        setError('')
    }

    const handleClose = () => {
        if (isSubmitting) return // Prevent closing while loading
        resetForm()
        onClose()
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError('')

        // Walidacja
        if (!formData.name.trim()) {
            setError('Nazwa nie może być pusta')
            setIsSubmitting(false)
            return
        }

        if (!formData.logic_id.trim()) {
            setError('Logic ID nie może być puste')
            setIsSubmitting(false)
            return
        }

        const logicIdNumber = parseInt(formData.logic_id)
        if (isNaN(logicIdNumber)) {
            setError('Logic ID musi być liczbą')
            setIsSubmitting(false)
            return
        }

        // Parsowanie JSON config
        let config = {}
        if (formData.jsonConfig.trim()) {
            try {
                config = JSON.parse(formData.jsonConfig)
            } catch (e) {
                setError('Nieprawidłowy format JSON w konfiguracji')
                setIsSubmitting(false)
                return
            }
        }

        // Przygotowanie body zapytania
        const requestBody = {
            values: {
                name: formData.name.trim(),
                logic_id: logicIdNumber,
                type: deviceType,
                module_id: moduleId,
                config: config
            }
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/devices`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || `Błąd podczas dodawania ${deviceType}a`)
            }

            const result = await response.json()
            console.log(`${deviceType} został dodany pomyślnie:`, result)

            // Wywołaj callback aby odświeżyć listę urządzeń
            if (onDeviceAdded) {
                onDeviceAdded()
            }

            handleClose()
        } catch (error) {
            console.error(`Błąd podczas dodawania ${deviceType}a:`, error)
            setError(error.message || `Błąd podczas dodawania ${deviceType}a`)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleInputChange = (field, value) => {
        if (isSubmitting) return // Prevent editing while loading
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
        if (error) setError('') // Clear error when user starts typing
    }

    const handleJsonConfigChange = (e) => {
        if (isSubmitting) return // Prevent editing while loading
        handleInputChange('jsonConfig', e.target.value)
    }

    if (!isOpen) return null

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
                <h3 className={styles.title}>Dodaj {deviceType === 'sensor' ? 'Sensor' : 'Aktuator'}</h3>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Nazwa *</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder={`Nazwa ${deviceType === 'sensor' ? 'sensora' : 'aktuatora'}`}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Logic ID *</label>
                        <input
                            type="number"
                            className={styles.input}
                            value={formData.logic_id}
                            onChange={(e) => handleInputChange('logic_id', e.target.value)}
                            placeholder="Logic ID urządzenia"
                            min="0"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Konfiguracja JSON:</label>
                        <textarea
                            className={styles.textarea}
                            value={formData.jsonConfig}
                            onChange={handleJsonConfigChange}
                            rows={3}
                            disabled={isSubmitting}
                        />
                        {error && <div className={styles.error}>{error}</div>}
                    </div>

                    <div className={styles.buttons}>
                        <button 
                            type="submit" 
                            className={`${styles.button} ${styles.confirmButton}`}
                            disabled={isSubmitting || !formData.name || !formData.logic_id}
                        >
                            {isSubmitting ? 'Dodawanie...' : 'Dodaj'}
                        </button>
                        <button 
                            type="button" 
                            className={`${styles.button} ${styles.cancelButton}`} 
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Anuluj
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}