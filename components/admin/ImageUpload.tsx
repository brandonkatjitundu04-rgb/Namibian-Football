'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  label?: string
  accept?: string
}

export function ImageUpload({ value, onChange, label = 'Upload Image', accept = 'image/*' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setPreview(data.url)
      onChange(data.url)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload">
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? 'Uploading...' : label}
          </Button>
        </label>
        {preview && (
          <Button
            type="button"
            variant="outline"
            onClick={handleRemove}
            disabled={uploading}
          >
            Remove
          </Button>
        )}
      </div>

      {preview && (
        <div className="relative w-32 h-32 rounded-xl border border-secondary-surface overflow-hidden bg-secondary-surface">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-contain"
            unoptimized={preview.startsWith('data:') || preview.startsWith('blob:')}
          />
        </div>
      )}
    </div>
  )
}

