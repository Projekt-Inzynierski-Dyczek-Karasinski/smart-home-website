'use client'

import {useState} from 'react'
import useSWR from 'swr'
import styles from './css/ActuatorCard.module.css'

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function ActuatorCard({ device, moduleId }) {
    const [toggleLoading, setToggleLoading] = useState(false)
    const [toggleError, setToggleError] = useState(false)

    const deviceId = device?.id

    const {
        data: valueData,
        error: valueError,
        isLoading: valueLoading,
        mutate,
    } = useSWR(
        deviceId ? `${process.env.NEXT_PUBLIC_API_URL}/api/devices/${deviceId}/value?force=false` : null,
        fetcher
    )

    const values = device.config?.values ?? []
    const currentValue = valueData?.result

    const getToggleLabel = () => {
        if (currentValue === 2) return 'Włącz'
        if (currentValue === 1) return 'Wyłącz'
        return 'Błąd'
    }

    const handleToggle = async () => {
        if (currentValue !== 1 && currentValue !== 2) {
            return
        }

        setToggleLoading(true)
        setToggleError(false)

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/modules/${moduleId}/actuators/toggle`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ logic_id: device.logic_id }),
                }
            )

            if (!res.ok) {
                throw new Error('Błąd przełączania')
            }

            // await mutate()
            // TODO change back to await mutate() when backed API will be fixed
            await mutate({ ...valueData, result: nextValue }, false)
        } catch (error) {
            // TODO delete when backed API will be fixed
            const nextValue = currentValue === 1 ? 2 : 1
            await mutate({ ...valueData, result: nextValue }, false)

            // setToggleError(true) // TODO uncomment when backed API will be fixed
        } finally {
            setToggleLoading(false)
        }
    }

    return (
        <article className={styles.deviceCard}>
            <div className={styles.sensorHeader}>
                <h3>{device.name}</h3>

                <div className={styles.btnWrapper}>
                    <button
                        type="button"
                        className={styles.forceReadButton}
                        onClick={handleToggle}
                        disabled={toggleLoading || toggleError || (currentValue !== 1 && currentValue !== 2)}
                    >
                        {toggleLoading ? 'Ładowanie...' : toggleError ? "Błąd" : getToggleLabel()}
                    </button>
                </div>
            </div>

            {values.length > 0 && (
                <div className={styles.lastValues}>
                    <div className={styles.valuesList}>
                        {values.map((value) => (
                            <div key={value.index} className={styles.valueRow}>
                                <span className={styles.valueLabel}>{value.label ?? '—'}</span>
                                <div className={styles.valueWithUnit}>
                                    <span className={styles.valuePlaceholder}>
                                        {valueLoading
                                            ? 'Ładowanie...'
                                            : valueError || currentValue == null
                                                ? 'Niewiadomy'
                                                : currentValue === 1 ? "Włączony" : currentValue === 2 ? "Wyłączony" : "Niewiadomy"}
                                    </span>
                                    {value.unit && (
                                        <span className={styles.valueUnit}>{value.unit}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </article>
    )
}