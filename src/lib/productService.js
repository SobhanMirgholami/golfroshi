import { supabase, isDemo } from './supabaseClient'
import { sampleBouquets } from './sampleBouquets'

const STORAGE_KEY = 'golfroshi-bouquets'
const BUCKET = 'bouquet-images'
const COLUMNS = 'id, name, description, price, category, is_available, image_url, image_path, created_at'

export function toBouquet(row) {
  return {
    id: row.id,
    name: row.name ?? {},
    description: row.description ?? {},
    price: Number(row.price),
    category: row.category,
    isAvailable: row.is_available,
    image: row.image_url,
    imagePath: row.image_path,
    createdAt: row.created_at,
  }
}

function toRow(bouquet) {
  return {
    name: bouquet.name,
    description: bouquet.description,
    price: bouquet.price,
    category: bouquet.category,
    is_available: bouquet.isAvailable,
  }
}

// ---------- demo mode: everything lives in localStorage ----------

function readLocal() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === null) return structuredClone(sampleBouquets)
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : structuredClone(sampleBouquets)
  } catch {
    return structuredClone(sampleBouquets)
  }
}

function writeLocal(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (error) {
    throw new Error(error?.name === 'QuotaExceededError' ? 'Browser storage is full. Delete a bouquet or use a smaller photo.' : 'Browser storage is blocked.', { cause: error })
  }
}

const local = {
  async list() {
    return readLocal()
  },
  async create(bouquet) {
    const saved = { ...bouquet, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    writeLocal([...readLocal(), saved])
    return saved
  },
  async update(bouquet) {
    const list = readLocal()
    const current = list.find((item) => item.id === bouquet.id)
    if (!current) throw new Error('Bouquet not found.')
    const saved = { ...current, ...bouquet, image: bouquet.image || current.image }
    writeLocal(list.map((item) => (item.id === saved.id ? saved : item)))
    return saved
  },
  async setAvailability(id, isAvailable) {
    return local.update({ id, isAvailable })
  },
  async remove(id) {
    writeLocal(readLocal().filter((item) => item.id !== id))
    return id
  },
  async reset() {
    const list = structuredClone(sampleBouquets)
    writeLocal(list)
    return list
  },
}

// ---------- Supabase ----------

async function uploadImage(dataUrl) {
  const file = await (await fetch(dataUrl)).blob()
  if (!['image/webp', 'image/jpeg', 'image/png'].includes(file.type)) throw new Error('The photo must be JPG, PNG or WebP.')
  if (file.size > 2 * 1024 * 1024) throw new Error('The photo must be 2 MB or smaller.')

  const imagePath = `${crypto.randomUUID()}.${file.type.split('/')[1].replace('jpeg', 'jpg')}`
  const { error } = await supabase.storage.from(BUCKET).upload(imagePath, file, {
    contentType: file.type,
    cacheControl: '31536000',
    upsert: false,
  })
  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(imagePath)
  return { image_url: data.publicUrl, image_path: imagePath }
}

// Only removes a photo when no bouquet points at it any more; a failed cleanup never blocks the save
async function removeImage(imagePath) {
  if (!imagePath) return
  try {
    const { data } = await supabase.from('bouquets').select('id').eq('image_path', imagePath).limit(1)
    if (Array.isArray(data) && data.length === 0) await supabase.storage.from(BUCKET).remove([imagePath])
  } catch {
    // an orphaned photo is harmless; it can be cleaned up from the dashboard
  }
}

const isNewImage = (image) => typeof image === 'string' && image.startsWith('data:image/')

const remote = {
  async list() {
    const { data, error } = await supabase
      .from('bouquets')
      .select(COLUMNS)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true })
    if (error) throw error
    return (data ?? []).map(toBouquet)
  },
  async create(bouquet) {
    const image = await uploadImage(bouquet.image)
    const { data, error } = await supabase.from('bouquets').insert({ ...toRow(bouquet), ...image }).select(COLUMNS).single()
    if (error) {
      await removeImage(image.image_path)
      throw error
    }
    return toBouquet(data)
  },
  async update(bouquet) {
    const changes = toRow(bouquet)
    let oldPath = null
    if (isNewImage(bouquet.image)) {
      oldPath = bouquet.imagePath
      Object.assign(changes, await uploadImage(bouquet.image))
    }
    const { data, error } = await supabase.from('bouquets').update(changes).eq('id', bouquet.id).select(COLUMNS).single()
    if (error) {
      if (changes.image_path) await removeImage(changes.image_path)
      throw error
    }
    if (oldPath && oldPath !== changes.image_path) await removeImage(oldPath)
    return toBouquet(data)
  },
  async setAvailability(id, isAvailable) {
    const { data, error } = await supabase.from('bouquets').update({ is_available: isAvailable }).eq('id', id).select(COLUMNS).single()
    if (error) throw error
    return toBouquet(data)
  },
  async remove(id) {
    const { data, error } = await supabase.from('bouquets').delete().eq('id', id).select('id, image_path').single()
    if (error) throw error
    await removeImage(data.image_path)
    return data.id
  },
}

const service = isDemo ? local : remote

export const getBouquets = () => service.list()
export const createBouquet = (bouquet) => service.create(bouquet)
export const updateBouquet = (bouquet) => service.update(bouquet)
export const setBouquetAvailability = (id, isAvailable) => service.setAvailability(id, isAvailable)
export const deleteBouquet = (id) => service.remove(id)
export const resetDemoBouquets = () => local.reset()
