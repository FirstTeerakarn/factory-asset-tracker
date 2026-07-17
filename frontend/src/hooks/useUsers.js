import { useState, useEffect, useCallback } from 'react'
import { userApi } from '../services/api'
import { toast } from '../components/ui'

export function useUsers(filters = {}) {
  const [users, setUsers] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await userApi.getAll(filters)
      setUsers(res.data.data)
      setMeta(res.data.meta)
    } catch (err) {
      setError(err.response?.data?.message ?? 'โหลดข้อมูลล้มเหลว')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const createUser = useCallback(async (data) => {
    await userApi.create(data)
    toast('เพิ่มพนักงานสำเร็จ')
    fetch()
  }, [fetch])

  const updateUser = useCallback(async (id, data) => {
    // ไม่ส่ง password ถ้าว่าง
    const payload = { ...data }
    if (!payload.password) delete payload.password
    await userApi.update(id, payload)
    toast('แก้ไขข้อมูลสำเร็จ')
    fetch()
  }, [fetch])

  const deleteUser = useCallback(async (id) => {
    await userApi.delete(id)
    toast('ลบพนักงานสำเร็จ')
    fetch()
  }, [fetch])

  return {
    users,
    meta,
    loading,
    error,
    refetch: fetch,
    createUser,
    updateUser,
    deleteUser,
  }
}
