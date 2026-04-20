'use client'
import {useState, useEffect} from 'react'
import useSWR from 'swr'

import ModuleCard from '@/components/ModuleCard'
import ModuleDetails from "@/components/ModuleDetails";
import DeleteConfirmationPopup from "@/components/DeleteConfirmationPopup";
import AddModuleCard from "@/components/AddModuleCard";
import AddModulePopup from "@/components/AddModulePopup";

import styles from "./page.module.css";

const fetcher = (...args) => fetch(...args).then(res => res.json())

export default function Home() {
    const [selectedModule, setSelectedModule] = useState(null)
    const [moduleToDelete, setModuleToDelete] = useState(null)
    const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false)
    const [isAddPopupOpen, setIsAddPopupOpen] = useState(false)

    const {data: moduleData, error, isLoading, mutate} = useSWR(`${process.env.NEXT_PUBLIC_API_URL}/api/modules`, fetcher)
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

    const handleDeleteRequest = (module) => {
        setModuleToDelete(module)
        setIsDeletePopupOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (moduleToDelete) {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/modules/${moduleToDelete.id}`, {
                    method: 'DELETE',
                })
                
                if (response.ok) {
                    const updatedData = {
                        ...moduleData,
                        modules: moduleData.modules.filter(m => m.id !== moduleToDelete.id)
                    }

                    mutate(updatedData, false)

                    if (selectedModule?.id === moduleToDelete.id) {
                        setSelectedModule(null)
                    }
                }
            } catch (error) {
                console.error(error)
            }
        }
        setIsDeletePopupOpen(false)
        setModuleToDelete(null)
    }

    const handleDeleteCancel = () => {
        setIsDeletePopupOpen(false)
        setModuleToDelete(null)
    }

    const handleAddModule = () => {
        setIsAddPopupOpen(true)
    }

    const handleAddConfirm = async (config) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/modules`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(config),
            })

            if (response.ok) {

                await new Promise(resolve => setTimeout(resolve, 1000))

                await mutate()
                setIsAddPopupOpen(false)
                return true // Success
            } else {
                return false // Failure
            }
        } catch (error) {
            return false // Failure
        }
    }

    const handleAddCancel = () => {
        setIsAddPopupOpen(false)
    }

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
                                <div key={module.id}>
                                    <ModuleCard
                                        module={module}
                                        onDelete={handleDeleteRequest}
                                        onClick={() => setSelectedModule(module)}
                                    />
                                </div>
                            ))}
                            <div>
                                <AddModuleCard onClick={handleAddModule} />
                            </div>
                        </section>
                    </>)
                }
            </main>
            
            <DeleteConfirmationPopup
                isOpen={isDeletePopupOpen}
                moduleName={moduleToDelete?.name}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
            />
            
            <AddModulePopup
                isOpen={isAddPopupOpen}
                onConfirm={handleAddConfirm}
                onCancel={handleAddCancel}
            />
        </div>
    )
}
