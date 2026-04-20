'use client'

import useSWR from 'swr'
import styles from './css/ModuleDetails.module.css'
import { useState } from 'react'

import SensorCard from "@/components/SensorCard";
import ActuatorCard from "@/components/ActuatorCard";
import SensorReadingsChart from "@/components/SensorReadingsChart";
import AddDevicePopup from "@/components/AddDevicePopup";

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function ModuleDetails({ module, onBack }) {
    const [isEditing, setIsEditing] = useState(false)
    const [editedValues, setEditedValues] = useState({
        logic_address: module?.logic_address ?? '',
        rf_channel: module?.config?.connection?.rf_channel ?? ''
    })
    const [hasChanges, setHasChanges] = useState(false)
    const [showAddDevicePopup, setShowAddDevicePopup] = useState(false)
    const [deviceTypeToAdd, setDeviceTypeToAdd] = useState(null)

    const { data: moduleDevicesData, error: devicesError, isLoading: devicesLoading, mutate: mutateDevices } = useSWR(
        module ? `${process.env.NEXT_PUBLIC_API_URL}/api/modules/${module.id}/devices` : null,
        fetcher
    )

    const { data: batteryData, error: batteryError, isLoading: batteryIsLoading } = useSWR(
        `${process.env.NEXT_PUBLIC_API_URL}/api/modules/${module.id}/devices/1/readings?limit=1`,
        fetcher
    )
    const batteryValue = batteryData?.device_readings?.[0]?.value

    const devices = moduleDevicesData?.module_devices ?? []
    const sensors = devices.filter(device => device.type === 'sensor')
    const actuators = devices.filter(device => device.type === 'actuator')

    const handleEditClick = () => {
        setIsEditing(true)
    }

    const handleCancelClick = () => {
        setIsEditing(false)
        setEditedValues({
            logic_address: module?.logic_address ?? '',
            rf_channel: module?.config?.connection?.rf_channel ?? ''
        })
        setHasChanges(false)
    }

    const handleAddDeviceClick = (deviceType) => {
        setDeviceTypeToAdd(deviceType)
        setShowAddDevicePopup(true)
    }

    const handleCloseAddDevicePopup = () => {
        setShowAddDevicePopup(false)
        setDeviceTypeToAdd(null)
    }

    const handleDeviceAdded = () => {
        // Odśwież listę urządzeń po dodaniu nowego
        mutateDevices()
    }

    const handleSaveClick = async () => {
        try {
            const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/modules/${module.id}`;

            // Sprawdź czy logic_address się zmienił
            if (editedValues.logic_address !== (module?.logic_address ?? '')) {
                const response1 = await fetch(baseUrl, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        mode: "overwrite",
                        path: "logic_address",
                        value: parseInt(editedValues.logic_address) || editedValues.logic_address
                    })
                });

                if (!response1.ok) {
                    throw new Error('Błąd podczas aktualizacji logic_address');
                }
            }

            // Sprawdź czy rf_channel się zmienił
            if (editedValues.rf_channel !== (module?.config?.connection?.rf_channel ?? '')) {
                const response2 = await fetch(baseUrl, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        mode: "overwrite",
                        path: "config.connection.rf_channel",
                        value: parseInt(editedValues.rf_channel) || editedValues.rf_channel
                    })
                });

                if (!response2.ok) {
                    throw new Error('Błąd podczas aktualizacji rf_channel');
                }
            }

            console.log('Zmiany zostały zapisane pomyślnie');

            // Aktualizuj lokalne wartości modułu tylko po udanym zapisie
            module.logic_address = editedValues.logic_address;
            if (module.config && module.config.connection) {
                module.config.connection.rf_channel = editedValues.rf_channel;
            }

            setIsEditing(false);
            setHasChanges(false);

            // Opcjonalnie: odświeżenie danych modułu
            // mutate() jeśli używasz SWR do pobierania danych modułu

        } catch (error) {
            console.error('Błąd podczas zapisywania zmian:', error);
            alert('Błąd');
        }
    }

    const handleInputChange = (field, value) => {
        setEditedValues(prev => ({
            ...prev,
            [field]: value
        }))
        setHasChanges(true)
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
                    <div className={styles.detailBoxHeader}>
                        <h2>Informacje o module</h2>
                        {!isEditing ? (
                            <button className={styles.editButton} onClick={handleEditClick}>
                                Edytuj
                            </button>
                        ) : (
                            <div className={styles.editControls}>
                                <button className={styles.cancelButton} onClick={handleCancelClick}>
                                    Anuluj
                                </button>
                                {hasChanges && (
                                    <button className={styles.saveButton} onClick={handleSaveClick}>
                                        Zapisz
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    <dl className={styles.detailsList}>
                        <div className={styles.detailRow}>
                            <dt>Kanał radiowy</dt>
                            {isEditing ? (
                                <dd>
                                    <input
                                        type="text"
                                        value={editedValues.rf_channel}
                                        onChange={(e) => handleInputChange('rf_channel', e.target.value)}
                                        className={styles.editInput}
                                    />
                                </dd>
                            ) : (
                                <dd>{module?.config?.connection?.rf_channel ?? '—'}</dd>
                            )}
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
                            {isEditing ? (
                                <dd>
                                    <input
                                        type="text"
                                        value={editedValues.logic_address}
                                        onChange={(e) => handleInputChange('logic_address', e.target.value)}
                                        className={styles.editInput}
                                    />
                                </dd>
                            ) : (
                                <dd>{module.logic_address ?? '—'}</dd>
                            )}
                        </div>

                        <div className={styles.detailRow}>
                            <dt>Naładowanie baterii</dt>
                            <dd>{batteryIsLoading
                                ? '...'
                                : batteryValue != null
                                    ? `${batteryValue}%`
                                    : 'brak danych'}</dd>
                        </div>
                    </dl>
                </div>

                <div className={styles.detailBox}>
                    <div className={styles.deviceSectionHeader}>
                        <h2>Sensory</h2>
                        <button 
                            className={styles.addDeviceButton}
                            onClick={() => handleAddDeviceClick('sensor')}
                        >
                            Dodaj Sensor
                        </button>
                    </div>

                    {sensors.length === 0 ? (
                        <p className={styles.emptyState}>Brak sensorów</p>
                    ) : (
                        <div className={styles.devicesList}>
                            {sensors.map(device => (
                                <SensorCard key={device.id} device={device} moduleId={module.id} />
                            ))}
                        </div>
                    )}
                </div>
                <SensorReadingsChart sensors={sensors} moduleId={module.id} />

                <div className={styles.detailBox}>
                    <div className={styles.deviceSectionHeader}>
                        <h2>Aktuatory</h2>
                        <button 
                            className={styles.addDeviceButton}
                            onClick={() => handleAddDeviceClick('actuator')}
                        >
                            Dodaj Aktuator
                        </button>
                    </div>

                    {actuators.length === 0 ? (
                        <p className={styles.emptyState}>Brak aktuatorów</p>
                    ) : (
                        <div className={styles.devicesList}>
                            {actuators.map(device => (
                                <ActuatorCard device={device} moduleId={module.id} key={device.id} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <AddDevicePopup
                isOpen={showAddDevicePopup}
                onClose={handleCloseAddDevicePopup}
                deviceType={deviceTypeToAdd}
                moduleId={module.id}
                onDeviceAdded={handleDeviceAdded}
            />
        </div>
    )
}