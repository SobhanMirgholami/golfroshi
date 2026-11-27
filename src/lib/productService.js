import { supabase, isDemo } from './supabaseClient'
import { sampleBouquets, sampleCategories } from './sampleBouquets'

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
    try {
      localStorage.setItem('golfroshi-categories', JSON.stringify(sampleCategories))
    } catch {
      // storage blocked
    }
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

// ---------- categories ----------

const CATEGORY_KEY = 'golfroshi-categories'

// a readable id from the English name, e.g. "Wild & garden" -> "wild-garden"
export function categoryId(englishName, taken) {
  const base =
    englishName
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 32) || 'category'
  let id = base
  for (let n = 2; taken.includes(id); n++) id = `${base}-${n}`
  return id
}

const localCategories = {
  read() {
    try {
      const saved = JSON.parse(localStorage.getItem(CATEGORY_KEY))
      return Array.isArray(saved) ? saved : structuredClone(sampleCategories)
    } catch {
      return structuredClone(sampleCategories)
    }
  },
  write(list) {
    try {
      localStorage.setItem(CATEGORY_KEY, JSON.stringify(list))
    } catch (error) {
      throw new Error('Browser storage is blocked.', { cause: error })
    }
  },
  async list() {
    return localCategories.read()
  },
  async create(category) {
    const list = localCategories.read()
    const saved = { ...category, id: categoryId(category.name.en, list.map((c) => c.id)), position: list.length + 1 }
    localCategories.write([...list, saved])
    return saved
  },
  async remove(id) {
    if (readLocal().some((b) => b.category === id)) throw new Error('in-use')
    localCategories.write(localCategories.read().filter((c) => c.id !== id))
    return id
  },
}

const remoteCategories = {
  async list() {
    const { data, error } = await supabase.from('categories').select('id, name, position').order('position').order('created_at')
    if (error) throw error
    return data ?? []
  },
  async create(category) {
    const current = await remoteCategories.list()
    const row = {
      id: categoryId(category.name.en, current.map((c) => c.id)),
      name: category.name,
      position: Math.max(0, ...current.map((c) => c.position)) + 1,
    }
    const { data, error } = await supabase.from('categories').insert(row).select('id, name, position').single()
    if (error) throw error
    return data
  },
  async remove(id) {
    // the database refuses (foreign key) while a bouquet, even a sold-out one, still uses the category
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw new Error(error.code === '23503' ? 'in-use' : error.message, { cause: error })
    return id
  },
}

const categories = isDemo ? localCategories : remoteCategories

export const getCategories = () => categories.list()
export const createCategory = (category) => categories.create(category)
export const deleteCategory = (id) => categories.remove(id)
