'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, FileText, Image as ImageIcon, Download } from "lucide-react"
import Image from 'next/image'

interface FileUploadProps {
  maxFiles?: number
  allowedFileTypes?: string[] // e.g. ['image/jpeg', 'image/png', 'application/pdf']
  templatePdfPath?: string
  templateLabel?: string
  onFilesChange: (files: File[]) => void
}

export default function FileUpload({ 
  maxFiles = 3, 
  allowedFileTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  templatePdfPath = '/assets/HorseIdentificationForm.pdf',
  templateLabel = 'Horse Identification Form Template',
  onFilesChange 
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const remainingSlots = maxFiles - files.length
    const validFiles = selectedFiles
      .slice(0, remainingSlots)
      .filter(file => allowedFileTypes.includes(file.type))

    // Create preview URLs
    const newPreviews = await Promise.all(
      validFiles.map(async (file) => {
        if (file.type.startsWith('image/')) {
          return URL.createObjectURL(file)
        }
        // For non-image files, return null to show icon instead
        return null
      })
    )

    setPreviews(prev => [...prev, ...newPreviews.filter(preview => preview !== null) as string[]])
    const updatedFiles = [...files, ...validFiles]
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }

  const removeFile = (index: number) => {
    if (previews[index]) {
      URL.revokeObjectURL(previews[index])
    }
    const newFiles = files.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    setFiles(newFiles)
    setPreviews(newPreviews)
    onFilesChange(newFiles)
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-12 w-12 text-muted-foreground" />
    }
    return <FileText className="h-12 w-12 text-muted-foreground" />
  }

  return (
    <div className="space-y-6">
      {/* Template Section - Modified for PDF */}
      {templatePdfPath && (
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-medium mb-2">Template</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-muted-foreground mr-2" />
              <span className="text-sm text-muted-foreground">{templateLabel}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => {
                const link = document.createElement('a')
                link.href = templatePdfPath
                link.download = 'HorseIdentificationForm.pdf'
                link.click()
              }}
            >
              <Download className="h-4 w-4" />
              Download Template
            </Button>
          </div>
        </div>
      )}

      {/* File Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {files.map((file, index) => (
          <Card key={index} className="relative group p-4">
            {previews[index] ? (
              <img
                src={previews[index]}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-32 flex items-center justify-center">
                {getFileIcon(file)}
                <span className="ml-2 text-sm text-muted-foreground">{file.name}</span>
              </div>
            )}
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeFile(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </Card>
        ))}
        
        {files.length < maxFiles && (
          <label className="border-2 border-dashed rounded-lg p-4 h-32 flex flex-col items-center justify-center cursor-pointer hover:border-primary">
            <input
              type="file"
              multiple
              accept={allowedFileTypes.join(',')}
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Click to upload files
                <br />
                {files.length} of {maxFiles} files
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supported formats: Images, PDF, DOC
              </p>
            </div>
          </label>
        )}
      </div>
    </div>
  )
}
