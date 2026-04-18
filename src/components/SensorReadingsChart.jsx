'use client'

import {useMemo, useState} from 'react'
import styles from './css/SensorReadingsChart.module.css'

const fetcher = async (url) => {
    const res = await fetch(url)
    if (!res.ok) {
        throw new Error('Błąd pobierania danych')
    }
    return res.json()
}

const toInputDateTime = (value) => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    const pad = (n) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const getDisplayValue = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => (item != null ? Number(item) : null)).filter((item) => item != null)
    }
    if (value == null) return null
    const parsed = Number(value)
    return Number.isNaN(parsed) ? null : parsed
}

const createYAxisTicks = (min, max, tickCount = 5) => {
    if (!Number.isFinite(min) || !Number.isFinite(max)) return []

    if (min === max) {
        return [min]
    }

    const step = (max - min) / (tickCount - 1)
    return Array.from({ length: tickCount }, (_, index) => min + step * index)
}

export default function SensorReadingsChart({ sensors = [], moduleId }) {
    const defaultFrom = useMemo(() => {
        const now = new Date()
        now.setDate(now.getDate() - 1)
        return toInputDateTime(now.toISOString())
    }, [])

    const defaultTo = useMemo(() => toInputDateTime(new Date().toISOString()), [])

    const [selectedLogicId, setSelectedLogicId] = useState(sensors[0]?.logic_id ?? '')
    const [from, setFrom] = useState(defaultFrom)
    const [to, setTo] = useState(defaultTo)
    const [limit, setLimit] = useState(1000)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [series, setSeries] = useState([])

    const handleFetch = async () => {
        if (!selectedLogicId || !moduleId) return

        setLoading(true)
        setError('')

        try {
            const url = `${process.env.NEXT_PUBLIC_API_URL}/api/modules/${moduleId}/devices/${selectedLogicId}/readings?limit=${encodeURIComponent(limit)}&from=${encodeURIComponent(new Date(from).toISOString())}&to=${encodeURIComponent(new Date(to).toISOString())}`
            const data = await fetcher(url)

            const readings = data?.device_readings ?? []
            const normalized = readings.map((reading) => {
                const displayValue = getDisplayValue(reading?.value)
                const y = Array.isArray(displayValue)
                    ? displayValue[0]
                    : displayValue

                return {
                    timestamp: reading.timestamp,
                    value: y,
                }
            }).filter((item) => item.timestamp && item.value != null)

            setSeries(normalized)
        } catch (e) {
            setError('Nie udało się pobrać danych')
            setSeries([])
        } finally {
            setLoading(false)
        }
    }

    const chartData = series
    const width = 900
    const height = 320
    const padding = 40

    const values = chartData.map((item) => item.value)
    const rawMinY = values.length ? Math.min(...values) : 0
    const rawMaxY = values.length ? Math.max(...values) : 1

    const yPadding = rawMinY === rawMaxY ? 1 : (rawMaxY - rawMinY)
    const minY = rawMinY
    const maxY = rawMaxY 
    const rangeY = maxY - minY || 1

    const yTicks = createYAxisTicks(minY, maxY, 5)

    const points = chartData.map((item, index) => {
        const x = chartData.length <= 1
            ? padding
            : padding + (index / (chartData.length - 1)) * (width - padding * 2)

        const y = height - padding - ((item.value - minY) / rangeY) * (height - padding * 2)

        return { x, y, ...item }
    })

    const path = points
        .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
        .join(' ')

    const xTickStep = Math.max(1, Math.ceil(points.length / 6))

    return (
        <section className={styles.chartBox}>
            <h2>Wykres odczytów sensora</h2>

            <div className={styles.controls}>
                <label className={styles.field}>
                    <span>Sensor</span>
                    <select
                        value={selectedLogicId}
                        onChange={(e) => setSelectedLogicId(e.target.value)}
                    >
                        {sensors.map((sensor) => (
                            <option key={sensor.id} value={sensor.logic_id} className={styles.selectOption}>
                                {sensor.name}
                            </option>
                        ))}
                    </select>
                </label>

                <label className={styles.field}>
                    <span>Od</span>
                    <input
                        type="datetime-local"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                    />
                </label>

                <label className={styles.field}>
                    <span>Do</span>
                    <input
                        type="datetime-local"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                    />
                </label>

                <label className={styles.field}>
                    <span>Limit</span>
                    <input
                        type="number"
                        min="1"
                        max="5000"
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                    />
                </label>

                <button type="button" className={styles.showButton} onClick={handleFetch} disabled={loading}>
                    {loading ? 'Ładowanie...' : 'Wyświetl'}
                </button>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.chartArea}>
                {points.length === 0 ? (
                    <p className={styles.empty}>Brak danych do wyświetlenia</p>
                ) : (
                    <svg viewBox={`0 0 ${width} ${height}`} className={styles.svg}>
                        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className={styles.axis} />
                        <line x1={padding} y1={padding} x2={padding} y2={height - padding} className={styles.axis} />

                        {yTicks.map((tick) => {
                            const tickY = height - padding - ((tick - minY) / rangeY) * (height - padding * 2)

                            return (
                                <g key={tick}>
                                    <line
                                        x1={padding - 6}
                                        y1={tickY}
                                        x2={padding}
                                        y2={tickY}
                                        className={styles.axis}
                                    />
                                    <text x={padding - 10} y={tickY + 4} textAnchor="end" className={styles.yLabel}>
                                        {Math.round(tick * 100) / 100}
                                    </text>
                                </g>
                            )
                        })}

                        {path && <path d={path} className={styles.line} />}

                        {points.map((point, index) => (
                            <g key={`${point.timestamp}-${index}`}>
                                {index % xTickStep === 0 || index === points.length - 1 ? (
                                    <text
                                        x={point.x}
                                        y={height - 10}
                                        textAnchor="middle"
                                        className={styles.xLabel}
                                    >
                                        {new Date(point.timestamp).toLocaleString('pl-PL', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </text>
                                ) : null}
                            </g>
                        ))}
                    </svg>
                )}
            </div>
        </section>
    )
}