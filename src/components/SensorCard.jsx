'use client'

import useSWR from 'swr'
import styles from './css/ModuleDetails.module.css'

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function SensorCard({ device, moduleId }) {
    const { data: readingsData } = useSWR(
        `${process.env.NEXT_PUBLIC_API_URL}/api/modules/${moduleId}/devices/${device.logic_id}/readings?limit=1`,
        fetcher
    )

    const reading = readingsData?.device_readings?.[0]
    const rawValues = Array.isArray(reading?.value) ? reading.value : [reading?.value]

    const values = device.config?.values ?? []
    const sectionLabel = values.length > 1
        ? 'Ostatnie odczytane wartości'
        : 'Ostatnia odczytana wartość'

    return (
        <article className={styles.deviceCard}>
            <h3>{device.name}</h3>

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