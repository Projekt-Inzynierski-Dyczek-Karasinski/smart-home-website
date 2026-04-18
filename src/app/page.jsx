'use client'
import {useState, useEffect} from 'react'
import useSWR from 'swr'

import ModuleCard from '@/components/ModuleCard'
import ModuleDetails from "@/components/ModuleDetails";

import styles from "./page.module.css";

const fetcher = (...args) => fetch(...args).then(res => res.json())

export default function Home() {
    const [selectedModule, setSelectedModule] = useState(null)

    const {data: moduleData, error, isLoading} = useSWR(`${process.env.NEXT_PUBLIC_API_URL}/api/modules`, fetcher)
    const {
        data: moduleDevicesData,
        error: devicesError,
        isLoading: devicesLoading,
    } = useSWR(
        selectedModule
            ? `${process.env.NEXT_PUBLIC_API_URL}/api/modules/${selectedModule.id}/devices`
            : null,
        fetcher
    )

    if (error) return (
        <div className={styles.page}>
            <main className={styles.main}>
                <h1>Nie udało się załadować danych o modułach</h1>
            </main>
        </div>
    )

    if (isLoading) return (
        <div className={styles.page}>
            <main className={styles.main}>
                <h1>Ładowanie...</h1>
            </main>
        </div>
    )

    const modules = [...(moduleData?.modules ?? [])].sort((a, b) => a.id - b.id)
    return (
        <div className={styles.page}>
            <main className={styles.main}>
                {
                    selectedModule ? (
                        <ModuleDetails module={selectedModule} onBack={() => setSelectedModule(null)}/>
                    ) : (<>
                        <section className={styles.header}>
                            <h1>Moduły</h1>
                        </section>

                        <section className={styles.grid}>
                            {modules.map((module) => (
                                <div key={module.id} onClick={() => {
                                    setSelectedModule(module)
                                }}>
                                    <ModuleCard module={module}/>
                                </div>
                            ))}
                        </section>
                    </>)
                }
            </main>
        </div>
    )
}
