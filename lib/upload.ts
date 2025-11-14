import { createClient } from "@/lib/supabase/client"

export async function uploadImage(file: File, bucket: string, userId: string): Promise<string> {
  const supabase = createClient()

  // Generate unique filename
  const fileExt = file.name.split(".").pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`

  // Upload file
  const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
    cacheControl: "3600",
    upsert: true,
  })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  // Get public URL
  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)

  return data.publicUrl
}

export async function deleteImage(url: string, bucket: string): Promise<void> {
  const supabase = createClient()

  // Extract path from URL
  const path = url.split(`/${bucket}/`)[1]

  if (!path) return

  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Please upload a JPG, PNG, or WebP image" }
  }

  if (file.size > maxSize) {
    return { valid: false, error: "Image must be less than 5MB" }
  }

  return { valid: true }
}
