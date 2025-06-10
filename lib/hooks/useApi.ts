"use client"

import { useState, useEffect, useCallback } from "react"
import { useAppStore } from "../store"

export function useApi<T>(apiCall: () => Promise<T>, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addNotification } = useAppStore()

  const fetchData = useCallback(async () => {
    const isMounted = true

    try {
      setLoading(true)
      setError(null)
      const result = await apiCall()

      if (isMounted) {
        setData(result)
      }
    } catch (err) {
      if (isMounted) {
        const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue"
        setError(errorMessage)
        addNotification({
          id: Date.now().toString(),
          type: "error",
          title: "Erreur",
          message: errorMessage,
          timestamp: new Date(),
          read: false,
        })
      }
    } finally {
      if (isMounted) {
        setLoading(false)
      }
    }
  }, [apiCall, addNotification])

  useEffect(() => {
    fetchData()

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const isMounted = false
    }
  }, dependencies)

  return { data, loading, error, refetch: () => fetchData() }
}

export function useMutation<T, P>(apiCall: (params: P) => Promise<T>) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { addNotification } = useAppStore()

  const mutate = async (params: P): Promise<T | null> => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiCall(params)

      addNotification({
        id: Date.now().toString(),
        type: "success",
        title: "Succès",
        message: "Opération réalisée avec succès",
        timestamp: new Date(),
        read: false,
      })

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue"
      setError(errorMessage)
      addNotification({
        id: Date.now().toString(),
        type: "error",
        title: "Erreur",
        message: errorMessage,
        timestamp: new Date(),
        read: false,
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error }
}
