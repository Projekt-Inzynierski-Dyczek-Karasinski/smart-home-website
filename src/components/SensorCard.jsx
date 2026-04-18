'use client'

import {useState} from 'react'
import useSWR from 'swr'
import styles from './css/SensorCard.module.css'

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function SensorCard({ device, moduleId }) {
    const [forceLoading, setForceLoading] = useState(false)
    const [forceError, setForceError] = useState(false)
    const [forcedReading, setForcedReading] = useState(null)

    const { data: readingsData, mutate } = useSWR(
        `${process.env.NEXT_PUBLIC_API_URL}/api/modules/${moduleId}/devices/${device.logic_id}/readings?limit=1`,
        fetcher
    )

    const reading = forcedReading ?? readingsData?.device_readings?.[0]
    const rawValues = Array.isArray(reading?.value) ? reading.value : [reading?.value]

    const values = device.config?.values ?? []
    const sectionLabel = values.length > 1
        ? 'Ostatnie odczytane wartości'
        : 'Ostatnia odczytana wartość'

    const handleForceRead = async () => {
        setForceLoading(true)
        setForceError(false)

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/modules/${moduleId}/devices/${device.logic_id}/value?force=true`
            )

            if (!res.ok) {
                throw new Error('Błąd odczytu')
            }

            const data = await res.json()
            if (data?.result == null) {
                throw new Error('Błąd odczytu')
            }

            setForcedReading({
                value: data.result,
                timestamp: new Date().toISOString(),
            })

            await mutate()
        } catch (error) {
            setForceError(true)
        } finally {
            setForceLoading(false)
        }
    }

    return (
        <article className={styles.deviceCard}>
            <div className={styles.sensorHeader}>
                <h3>{device.name}</h3>

                <div className={styles.btnWrapper}>{forceError && (
                    <p className={styles.readError}>Błąd odczytu</p>
                )}

                    <button
                        type="button"
                        className={styles.forceReadButton}
                        onClick={handleForceRead}
                        disabled={forceLoading}
                    >
                        {forceLoading ? 'Ładowanie...' : 'Wymuś nowy odczyt'}
                    </button>
                </div>

            </div>


            {values.length > 0 && (
                <div className={styles.lastValues}>
                    <span className={styles.lastValuesLabel}>{sectionLabel}</span>
                    <div className={styles.valuesList}>
                        {values.map((value) => {
                            const raw = rawValues[value.index]
                            const precision = value.precision ?? 0
                            const displayValue = raw != null
                                ? Number(raw).toFixed(precision)
                                : '—'

                            return (
                                <div key={value.index} className={styles.valueRow}>
                                    <span className={styles.valueLabel}>{value.label ?? '—'}</span>
                                    <div className={styles.valueWithUnit}>
                                        <span className={styles.valuePlaceholder}>{displayValue}</span>
                                        {value.unit && (
                                            <span className={styles.valueUnit}>{value.unit}</span>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    {reading?.timestamp && (
                        <span className={styles.readingTimestamp}>
                            {new Date(reading.timestamp).toLocaleString('pl-PL')}
                        </span>
                    )}
                </div>
            )}
        </article>
    )
}