'use client'

import useSWR from 'swr'
import styles from './css/ModuleDetails.module.css'

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
                                <article key={device.id} className={styles.deviceCard}>
                                    <h3>{device.name}</h3>

                                    <div className={styles.deviceMeta}>
                                        <div className={styles.deviceMetaItem}>
                                            <span className={styles.deviceMetaLabel}>Parametry</span>
                                            <div className={styles.valuesList}>
                                                {(device.config?.values ?? []).map((value) => (
                                                    <div key={value.index} className={styles.valueRow}>
                                                        <span>{value.label ?? '—'}</span>
                                                        <span>{value.unit ?? '—'}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className={styles.deviceMetaItem}>
                                            <span className={styles.deviceMetaLabel}>Ostatnia wartość</span>
                                            <span className={styles.placeholderValue}>
                                                Tutaj pojawi się ostatnia wartość po osobnym fetche
                                            </span>
                                        </div>
                                    </div>
                                </article>
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