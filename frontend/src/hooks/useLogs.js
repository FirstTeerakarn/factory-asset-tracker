import { useState, useEffect, useCallback } from 'react'
import { logApi } from '../services/api'

export function useLogs(filters = {}) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await logApi.getAll(filters)
      setLogs(res.data.data)
    } catch (err) {
      setError(err.response?.data?.message ?? 'โหลดข้อมูลล้มเหลว')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)])

  useEffect(() => { fetch() }, [fetch])

  return { logs, loading, error, refetch: fetch }
}
