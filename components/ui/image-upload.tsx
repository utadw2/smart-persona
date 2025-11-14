"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { uploadImage, validateImageFile } from "@/lib/upload"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  bucket: string
  userId: string
  label?: string
  className?: string
  showAvatar?: boolean
  fallbackText?: string
}

export function ImageUpload({
  value,
  onChange,
  bucket,
  userId,
  label = "Upload Image",
  className,
  showAvatar = false,
  fallbackText = "U",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(value || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      setError(validation.error!)
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload file
      const url = await uploadImage(file, bucket, userId)
      onChange(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
      setPreview(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}

      <div className="flex items-center gap-4">
        {showAvatar && (
          <Avatar className="h-20 w-20">
            <AvatarImage src={preview || undefined} />
            <AvatarFallback className="text-xl">{fallbackText}</AvatarFallback>
          </Avatar>
        )}

        {!showAvatar && preview && (
          <div className="relative h-32 w-32 rounded-lg overflow-hidden border">
            <img src={preview || "/placeholder.svg"} alt="Preview" className="h-full w-full object-cover" />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {preview ? "Change" : "Upload"}
              </>
            )}
          </Button>

          {preview && (
            <Button type="button" variant="ghost" size="sm" onClick={handleRemove} disabled={isUploading}>
              <X className="mr-2 h-4 w-4" />
              Remove
            </Button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">JPG, PNG or WebP. Max 5MB.</p>
    </div>
  )
}
