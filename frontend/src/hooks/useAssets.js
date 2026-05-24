import { useState, useEffect, useCallback } from 'react'
import { assetApi } from '../services/api'
import { toast } from '../components/ui'

export function useAssets(filters = {}) {
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await assetApi.getAll(filters)
      setAssets(res.data.data)
    } catch (err) {
      setError(err.response?.data?.message ?? 'โหลดข้อมูลล้มเหลว')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)])

  useEffect(() => {
    const t = setTimeout(fetch, 300)
    return () => clearTimeout(t)
  }, [fetch])

  const createAsset = useCallback(async (data) => {
    await assetApi.create(data)
    toast('เพิ่มอุปกรณ์สำเร็จ')
    fetch()
  }, [fetch])

  const updateAsset = useCallback(async (id, data) => {
    await assetApi.update(id, data)
    toast('แก้ไขข้อมูลสำเร็จ')
    fetch()
  }, [fetch])

  const deleteAsset = useCallback(async (id) => {
    await assetApi.delete(id)
    toast('ลบอุปกรณ์สำเร็จ')
    fetch()
  }, [fetch])

  const checkoutAsset = useCallback(async (asset) => {
    await assetApi.checkout(asset.id)
    toast(`เบิก ${asset.name} สำเร็จ`)
    fetch()
  }, [fetch])

  const checkinAsset = useCallback(async (asset) => {
    await assetApi.checkin(asset.id)
    toast(`คืน ${asset.name} สำเร็จ`)
    fetch()
  }, [fetch])

  return {
    assets,
    loading,
    error,
    refetch: fetch,
    createAsset,
    updateAsset,
    deleteAsset,
    checkoutAsset,
    checkinAsset,
  }
}
