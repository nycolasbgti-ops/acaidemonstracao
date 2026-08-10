import { supabase } from '../lib/supabaseClient'

const TRANSPARENCY_TYPES = new Set(['image/png', 'image/webp', 'image/gif'])
const EXT_BY_TYPE = { 'image/png': 'png', 'image/jpeg': 'jpg' }

function compressImage(file, maxWidth = 1000, quality = 0.8) {
  const outputType = TRANSPARENCY_TYPES.has(file.type) ? 'image/png' : 'image/jpeg'

  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale  = Math.min(1, maxWidth / img.width)
      const w      = Math.round(img.width * scale)
      const h      = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width  = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, w, h)
      ctx.drawImage(img, 0, 0, w, h)
      canvas.toBlob(
        blob => resolve({ blob: blob ?? file, type: blob ? outputType : file.type }),
        outputType,
        quality,
      )
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve({ blob: file, type: file.type }) }
    img.src = url
  })
}

export async function uploadImage(file) {
  const { blob: compressed, type } = await compressImage(file)
  const ext      = EXT_BY_TYPE[type] || file.name.split('.').pop().toLowerCase()
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filename, compressed, { contentType: type })
  if (uploadError) throw new Error(uploadError.message)

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(filename)

  return { url: publicUrl }
}
