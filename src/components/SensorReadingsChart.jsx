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

const parseReadingValue = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => {
            const parsed = Number(item)
            return Number.isNaN(parsed) ? null : parsed
        })
    }

    if (typeof value === 'string') {
        const trimmed = value.trim()

        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            try {
                const parsedArray = JSON.parse(trimmed)
                if (Array.isArray(parsedArray)) {
                    return parsedArray.map((item) => {
                        const parsed = Number(item)
                        return Number.isNaN(parsed) ? null : parsed
                    })
                }
            } catch (error) {
                // fallback below
            }
        }

        const parsed = Number(trimmed)
        return Number.isNaN(parsed) ? [] : [parsed]
    }

    if (value == null) return []
    const parsed = Number(value)
    return Number.isNaN(parsed) ? [] : [parsed]
}

const createYAxisTicks = (min, max, tickCount = 5) => {
    if (!Number.isFinite(min) || !Number.isFinite(max)) return []

    if (min === max) {
        return [min]
    }

    const step = (max - min) / (tickCount - 1)
    return Array.from({ length: tickCount }, (_, index) => min + step * index)
}

const COLORS = ['#ff9f7c', '#7ce7b2', '#76a9ff', '#d58cff', '#ffd36e']

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
    const [hasFetched, setHasFetched] = useState(false)

    const selectedSensor = sensors.find((sensor) => String(sensor.logic_id) === String(selectedLogicId))
    const chartLabels = selectedSensor?.config?.values ?? []

    const handleSensorChange = (e) => {
        setSelectedLogicId(e.target.value)
        setSeries([])
        setError('')
        setHasFetched(false)
    }

    const handleFetch = async () => {
        if (!selectedLogicId || !moduleId) return

        setLoading(true)
        setError('')

        try {
            const url = `${process.env.NEXT_PUBLIC_API_URL}/api/modules/${moduleId}/devices/${selectedLogicId}/readings?limit=${encodeURIComponent(limit)}&from=${encodeURIComponent(new Date(from).toISOString())}&to=${encodeURIComponent(new Date(to).toISOString())}`
            const data = await fetcher(url)

            const readings = data?.device_readings.reverse() ?? []
            const normalized = readings
                .map((reading) => ({
                    timestamp: reading.timestamp,
                    values: parseReadingValue(reading?.value),
                }))
                .filter((item) => item.timestamp && item.values.length > 0)

            setSeries(normalized)
            setHasFetched(true)
        } catch (e) {
            setError('Nie udało się pobrać danych')
            setSeries([])
            setHasFetched(true)
        } finally {
            setLoading(false)
        }
    }

    const width = 900
    const height = 320
    const padding = 40

    const chartIndexes = chartLabels.map((item) => Number(item.index)).filter((index) => Number.isFinite(index))
    const xTickStep = Math.max(1, Math.ceil(series.length / 6))

    const chartConfigs = chartIndexes.map((valueIndex, chartPos) => {
        const labelInfo = chartLabels.find((item) => Number(item.index) === Number(valueIndex))

        const valuesForSeries = series
            .map((item) => item.values[valueIndex])
            .filter((value) => value != null)

        const minY = valuesForSeries.length ? Math.min(...valuesForSeries) : 0
        const maxY = valuesForSeries.length ? Math.max(...valuesForSeries) : 1
        const rangeY = maxY - minY || 1

        const yTicks = createYAxisTicks(minY, maxY, 5)

        const points = series
            .map((item, index) => {
                const value = item.values[valueIndex]
                if (value == null) return null

                const x = series.length <= 1
                    ? padding
                    : padding + (index / (series.length - 1)) * (width - padding * 2)

                const y = height - padding - ((value - minY) / rangeY) * (height - padding * 2)

                return { x, y, value, timestamp: item.timestamp }
            })
            .filter(Boolean)

        const path = points
            .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
            .join(' ')

        return {
            valueIndex,
            chartPos,
            label: labelInfo?.label ?? `Wartość ${valueIndex}`,
            unit: labelInfo?.unit ?? '',
            precision: labelInfo?.precision ?? 2,
            points,
            path,
            yTicks,
            minY,
            maxY,
            color: COLORS[chartPos % COLORS.length],
        }
    })

    return (
        <section className={styles.chartBox}>
            <h2>Wykres odczytów sensora</h2>

            <div className={styles.controls}>
                <label className={styles.field}>
                    <span>Sensor</span>
                    <select
                        value={selectedLogicId}
                        onChange={handleSensorChange}
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

            {hasFetched && (
                <div className={styles.chartArea}>
                    {chartConfigs.length === 0 ? (
                        <p className={styles.empty}>Brak danych do wyświetlenia</p>
                    ) : (
                        <div className={styles.multiCharts}>
                            {chartConfigs.map((chart) => (
                                <div key={chart.valueIndex} className={styles.singleChart}>
                                    <h3 className={styles.chartTitle}>
                                        {chart.label}
                                        {chart.unit ? ` (${chart.unit})` : ''}
                                    </h3>

                                    <svg viewBox={`0 0 ${width} ${height}`} className={styles.svg}>
                                        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className={styles.axis} />
                                        <line x1={padding} y1={padding} x2={padding} y2={height - padding} className={styles.axis} />

                                        {chart.yTicks.map((tick) => {
                                            const tickY = height - padding - ((tick - chart.minY) / (chart.maxY - chart.minY || 1)) * (height - padding * 2)

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
                                                        {Number(tick).toFixed(chart.precision)}
                                                    </text>
                                                </g>
                                            )
                                        })}

                                        {chart.path && (
                                            <path
                                                d={chart.path}
                                                className={styles.line}
                                                style={{ stroke: chart.color }}
                                            />
                                        )}

                                        {series.map((point, index) => (
                                            index % xTickStep === 0 || index === series.length - 1 ? (
                                                <text
                                                    key={`${point.timestamp}-${index}`}
                                                    x={series.length <= 1 ? padding : padding + (index / (series.length - 1)) * (width - padding * 2)}
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
                                            ) : null
                                        ))}
                                    </svg>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
    )
}