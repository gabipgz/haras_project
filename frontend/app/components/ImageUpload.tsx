'use client'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X } from "lucide-react"

interface ImageUploadProps {
  maxImages?: number
  onImagesChange: (images: File[]) => void
}

export default function ImageUpload({ maxImages = 5, onImagesChange }: ImageUploadProps) {
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remainingSlots = maxImages - images.length
    const newFiles = files.slice(0, remainingSlots)

    // Create preview URLs
    const newPreviews = newFiles.map(file => URL.createObjectURL(file))
    setPreviews(prev => [...prev, ...newPreviews])

    // Update images
    const updatedImages = [...images, ...newFiles]
    setImages(updatedImages)
    onImagesChange(updatedImages)
  }

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]) // Clean up preview URL
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    setImages(newImages)
    setPreviews(newPreviews)
    onImagesChange(newImages)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {previews.map((preview, index) => (
          <Card key={index} className="relative group">
            <img
              src={preview}
              alt={`Preview ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeImage(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </Card>
        ))}
        {images.length < maxImages && (
          <label className="border-2 border-dashed rounded-lg p-4 h-32 flex items-center justify-center cursor-pointer hover:border-primary">
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Click to upload
                <br />
                {images.length} of {maxImages} images
              </p>
            </div>
          </label>
        )}
      </div>
    </div>
  )
} 