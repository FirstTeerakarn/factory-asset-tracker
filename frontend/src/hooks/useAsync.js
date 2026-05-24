import { useState, useCallback } from 'react'
import { toast } from '../components/ui'

/**
 * useAsync — wraps any async function with loading + error state
 *
 * const { run, loading } = useAsync()
 * await run(() => someApi.call(), 'success message')
 */
export function useAsync() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const run = useCallback(async (fn, successMsg) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fn()
      if (successMsg) toast(successMsg)
      return result
    } catch (err) {
      const msg = err.response?.data?.message ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่'
      setError(msg)
      toast(msg, 'error')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { run, loading, error }
}
