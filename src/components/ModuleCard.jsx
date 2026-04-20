import styles from './css/ModuleCard.module.css'
import useSWR from "swr";

const fetcher = async (url) => {
    const res = await fetch(url)
    if (res.status === 404)  return null
    if (!res.ok)  throw new Error('Błąd pobierania danych')
    return res.json()
}

export default function ModuleCard({ module, onDelete, onClick }) {
    const {data: batteryData, error, isLoading} = useSWR(`${process.env.NEXT_PUBLIC_API_URL}/api/modules/${module.id}/devices/1/readings?limit=1`, fetcher)
    const batteryValue = batteryData?.device_readings?.[0]?.value

    const handleDeleteClick = (e) => {
        e.stopPropagation()
        onDelete?.(module)
    }

    const handleCardClick = () => {
        onClick?.()
    }

    return (
        <article className={styles.card} onClick={handleCardClick}>
            <div className={styles.cardTop}>
                <h2>{module.name}</h2>
                <button 
                    className={styles.deleteButton} 
                    onClick={handleDeleteClick}
                    title="Usuń moduł"
                >
                    ×
                </button>
            </div>

            <dl className={styles.details}>
                <div className={styles.detailRow}>
                    <dt>Adres logiczny</dt>
                    <dd>{module.logic_address}</dd>
                </div>

                <div className={styles.detailRow}>
                    <dt>Kanał radiowy</dt>
                    <dd>{module?.config?.connection?.rf_channel}</dd>
                </div>

                <div className={styles.detailRow}>
                    <dt>Naładowanie baterii</dt>
                    <dd>{isLoading
                        ? '...'
                        : batteryValue != null
                            ? `${batteryValue}%`
                            : 'brak danych'}</dd>
                </div>

                <div className={styles.detailRow}>
                    <dt>Ostatnio online</dt>
                    <dd>
                        {module.last_online
                            ? new Date(module.last_online).toLocaleString('pl-PL')
                            : 'Brak danych'}
                    </dd>
                </div>
            </dl>
        </article>
    )
}