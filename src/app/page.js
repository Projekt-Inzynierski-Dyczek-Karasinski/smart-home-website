'use client'
import {useState, useEffect} from 'react'
import useSWR from 'swr'

import Image from "next/image";
import styles from "./page.module.css";

import Link from 'next/link'

const fetcher = (...args) => fetch(...args).then(res => res.json())

export default function Home() {

  const [dane, setDane] = useState(null)
  const [loading, setLoading] = useState(true)
  const { data, error, isLoading } = useSWR(`${process.env.NEXT_PUBLIC_API_URL}/api/modules`, fetcher)

  const [test, setTest] = useState("nie")
  console.log("tak")
  useEffect(() => {
    console.log(`${process.env.NEXT_PUBLIC_API_URL}`)
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/status`)
        .then(res => res.json())
        .then(data => {

          setDane(data)
          setLoading(false)
          console.log(data)
        })
  }, [])
  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading...</div>
  return (
      <div className={styles.page}>
        <main className={styles.main}>
          <pre>{JSON.stringify(dane, null, 2)}</pre>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </main>
      </div>
  );
}
