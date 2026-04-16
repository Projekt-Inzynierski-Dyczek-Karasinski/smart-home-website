'use client'

import useSWR from 'swr'
import styles from './css/ModuleDetails.module.css'

import SensorCard from "@/components/SensorCard";

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function ModuleDetails({ module, onBack }) {
    const {
        data: moduleDevicesData,
        error: devicesError,
        isLoading: devicesLoading,
    } = useSWR(
        module ? `${process.env.NEXT_PUBLIC_API_URL}/api/modules/${module.id}/devices` : null,
        fetcher
    )

    const devices = moduleDevicesData?.module_devices ?? []
    const sensors = devices.filter((device) => device.type === 'sensor')
    const actuators = devices.filter((device) => device.type === 'actuator')

    if (devicesError) {
        return (
            <div className={styles.wrapper}>
                <button className={styles.backButton} onClick={onBack}>
                    ← Wróć do listy
                </button>
                <div className={styles.state}>Nie udało się załadować szczegółów modułu</div>
            </div>
        )
    }

    if (devicesLoading) {
        return (
            <div className={styles.wrapper}>
                <button className={styles.backButton} onClick={onBack}>
                    ← Wróć do listy
                </button>
                <div className={styles.state}>Ładowanie szczegółów...</div>
            </div>
        )
    }

    return (
        <div className={styles.wrapper}>
            <button className={styles.backButton} onClick={onBack}>
                ← Wróć do listy
            </button>

            <section className={styles.header}>
                <h1>{module.name}</h1>
            </section>

            <section className={styles.detailsView}>
                <div className={styles.detailBox}>
                    <h2>Informacje o module</h2>
                    <dl className={styles.detailsList}>
                        <div className={styles.detailRow}>
                            <dt>Kanał radiowy</dt>
                            <dd>{module?.config?.connection?.rf_channel ?? '—'}</dd>
                        </div>

                        <div className={styles.detailRow}>
                            <dt>Ostatnio online</dt>
                            <dd>
                                {module.last_online
                                    ? new Date(module.last_online).toLocaleString('pl-PL')
                                    : 'Brak danych'}
                            </dd>
                        </div>

                        <div className={styles.detailRow}>
                            <dt>Adres logiczny</dt>
                            <dd>{module.logic_address ?? '—'}</dd>
                        </div>
                    </dl>
                </div>

                <div className={styles.detailBox}>
                    <h2>Sensory</h2>

                    {sensors.length === 0 ? (
                        <p className={styles.emptyState}>Brak sensorów</p>
                    ) : (
                        <div className={styles.devicesList}>
                            {sensors.map((device) => (
                                <SensorCard key={device.id} device={device} moduleId={module.id} />
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.detailBox}>
                    <h2>Aktuatory</h2>

                    {actuators.length === 0 ? (
                        <p className={styles.emptyState}>Brak aktuatorów</p>
                    ) : (
                        <div className={styles.devicesList}>
                            {actuators.map((device) => (
                                <article key={device.id} className={styles.deviceCard}>
                                    <h3>{device.name}</h3>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}