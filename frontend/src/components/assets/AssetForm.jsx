import React, { useState } from 'react'
import { Spinner } from '../ui'

const EMPTY_FORM = { asset_code: '', name: '', category: '', status: 'available' }

export default function AssetForm({ initial = EMPTY_FORM, existingCategories = [], onSave, loading }) {
  const [form, setForm] = useState(initial)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">รหัสอุปกรณ์</label>
          <input className="input" placeholder="TL-001" value={form.asset_code} onChange={(e) => set('asset_code', e.target.value)} />
        </div>
        <div>
          <label className="label">หมวดหมู่</label>
          {/* ใช้ input คู่กับ datalist เพื่อให้เลือกของเดิม หรือพิมพ์ใหม่ก็ได้ */}
          <input 
            className="input" 
            list="category-options"
            placeholder="เลือกหรือพิมพ์ใหม่..." 
            value={form.category} 
            onChange={(e) => set('category', e.target.value)} 
          />
          <datalist id="category-options">
            {existingCategories.map(cat => <option key={cat} value={cat} />)}
          </datalist>
        </div>
      </div>
      <div>
        <label className="label">ชื่ออุปกรณ์</label>
        <input className="input" placeholder="กรอกชื่ออุปกรณ์" value={form.name} onChange={(e) => set('name', e.target.value)} />
      </div>
      <div>
        <label className="label">สถานะ</label>
        <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
          <option value="available">ว่าง (Available)</option>
          <option value="in_use">กำลังใช้ (In Use)</option>
          <option value="maintenance">ซ่อมบำรุง (Maintenance)</option>
        </select>
      </div>
      <button onClick={() => onSave(form)} disabled={loading} className="btn-primary w-full justify-center mt-1">
        {loading ? <Spinner size="sm" /> : 'บันทึก'}
      </button>
    </div>
  )
}
