import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../context/StoreContext'
import { useLang } from '../context/LanguageContext'
import { catLabel } from '../i18n/translations'
import { SIZE_PRESETS } from '../data/sizePresets'
import { supabase } from '../lib/supabaseClient'

const EMPTY = { name: '', sizes: [], price: '', salePrice: '', image: '', isNew: false }

/**
 * ฟอร์มเพิ่มสินค้าใหม่ / แก้ไขสินค้าเดิม — ขอบเขตอยู่ในหมวดหมู่เดียว (category มาจากแท็บที่เลือกใน AdminDashboard)
 * ตัวเลือกไซซ์จะเปลี่ยนอัตโนมัติตามหมวดหมู่: รองเท้า → 38-44, เสื้อผ้า → S-XXL (ดู src/data/sizePresets.js)
 */
export default function ProductForm({ category, editing, onDone }) {
  const { addProduct, updateProduct } = useStore()
  const { t } = useLang()
  const [form, setForm] = useState(EMPTY)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  // ไซซ์มาตรฐานของหมวดหมู่นี้ + ไซซ์เดิมของสินค้าที่แก้ไข (เผื่อเป็นไซซ์นอกมาตรฐานจากข้อมูลเก่า)
  const sizeOptions = useMemo(() => {
    const preset = SIZE_PRESETS[category] || []
    const legacy = (editing?.sizes || []).filter((s) => !preset.includes(s))
    return [...preset, ...legacy]
  }, [category, editing])

  // เมื่อกด Edit จากตาราง หรือสลับแท็บหมวดหมู่ → รีเซ็ตฟอร์ม
  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        sizes: editing.sizes,
        price: editing.price,
        salePrice: editing.salePrice ?? '',
        image: editing.image,
        isNew: !!editing.isNew,
      })
    } else {
      setForm(EMPTY)
    }
  }, [editing, category])

  const set = (field) => (e) =>
    setForm({ ...form, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const toggleSize = (s) =>
    setForm((f) => ({ ...f, sizes: f.sizes.includes(s) ? f.sizes.filter((x) => x !== s) : [...f.sizes, s] }))

  // อัปโหลดรูปสินค้าขึ้น Supabase Storage bucket "product-images" (ดู supabase/schema.sql)
  const handleImageFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const path = `${category}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('product-images').upload(path, file)
    if (!error) {
      const { data } = supabase.storage.from('product-images').getPublicUrl(path)
      setForm((f) => ({ ...f, image: data.publicUrl }))
    }
    setUploading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.sizes.length === 0) return // ต้องเลือกไซซ์อย่างน้อย 1 ไซซ์
    const payload = {
      name: form.name.trim(),
      category,
      sizes: form.sizes,
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      image:
        form.image ||
        `https://placehold.co/700x700/ececec/171717.png?text=${encodeURIComponent(form.name.trim())}`,
      isNew: form.isNew,
    }
    setSaving(true)
    const result = editing
      ? await updateProduct({ ...payload, id: editing.id })
      : await addProduct(payload)
    setSaving(false)
    if (!result.ok) return
    setForm(EMPTY)
    onDone()
  }

  const inputCls =
    'w-full border border-neutral-300 rounded-xl px-4 py-2.5 text-sm font-medium bg-white outline-none focus:border-primary transition'

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-4">
      <div>
        <h3 className="font-black uppercase text-sm tracking-wider">
          {editing ? t('pf_edit') : t('pf_add')}
        </h3>
        <p className="text-xs font-bold uppercase tracking-wider text-accent mt-1">{catLabel(t, category)}</p>
      </div>

      <input className={inputCls} placeholder={t('pf_name')} value={form.name} onChange={set('name')} required />

      {/* ตัวเลือกไซซ์เฉพาะกลุ่ม: รองเท้า 38-44 / เสื้อผ้า S-XXL */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">{t('pf_sizes')}</p>
        <div className="flex flex-wrap gap-2">
          {sizeOptions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSize(s)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-bold border-2 transition cursor-pointer ${
                form.sizes.includes(s)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-neutral-600 border-neutral-300 hover:border-primary'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {form.sizes.length === 0 && (
          <p className="text-xs text-accent mt-2">{t('pf_sizes_required')}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input className={inputCls} type="number" min="0" placeholder={t('pf_price')} value={form.price} onChange={set('price')} required />
        <input className={inputCls} type="number" min="0" placeholder={t('pf_sale')} value={form.salePrice} onChange={set('salePrice')} />
      </div>

      {/* อัปโหลดรูปสินค้าขึ้น Supabase Storage — พร้อมพรีวิวรูปที่เลือก */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">{t('pf_image')}</p>
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 rounded-xl bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200">
            {form.image && <img src={form.image} alt="" className="h-full w-full object-cover" />}
          </div>
          <label className="flex-1 cursor-pointer">
            <input type="file" accept="image/*" onChange={handleImageFile} className="hidden" disabled={uploading} />
            <span className="block text-center border-2 border-dashed border-neutral-300 rounded-xl px-4 py-3 text-sm font-bold text-neutral-600 hover:border-primary transition">
              {uploading ? '...' : t('pf_image_upload')}
            </span>
          </label>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
        <input type="checkbox" checked={form.isNew} onChange={set('isNew')} className="accent-primary h-4 w-4" />
        {t('pf_new_check')}
      </label>

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={saving || uploading} className="flex-1 py-3 bg-accent text-primary rounded-full font-bold uppercase text-sm hover:bg-accent-dark disabled:opacity-60 transition cursor-pointer">
          {editing ? t('pf_submit_save') : t('pf_submit_add')}
        </button>
        {editing && (
          <button type="button" onClick={onDone} className="px-5 py-3 border-2 border-neutral-300 rounded-full font-bold uppercase text-sm hover:border-primary transition cursor-pointer">
            {t('cancel')}
          </button>
        )}
      </div>
    </form>
  )
}
