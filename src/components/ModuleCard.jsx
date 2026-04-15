import styles from './css/ModuleCard.module.css'

export default function ModuleCard({ module }) {
    return (
        <article className={styles.card}>
            <div className={styles.cardTop}>
                <h2>{module.name}</h2>
            </div>

            <dl className={styles.details}>
                <div className={styles.detailRow}>
                    <dt>Ostatnio online</dt>
                    <dd>
                        {module.last_online
                            ? new Date(module.last_online).toLocaleString('pl-PL')
                            : 'Brak danych'}
                    </dd>
                </div>

                <div className={styles.detailRow}>
                    <dt>Kanał radiowy</dt>
                    <dd>{module?.config?.connection?.rf_channel}</dd>
                </div>

                <div className={styles.detailRow}>
                    <dt>Adres logiczny</dt>
                    <dd>{module.logic_address}</dd>
                </div>
            </dl>
        </article>
    )
}