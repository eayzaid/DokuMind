import React from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DocumentUploadProps {
  isUploading: boolean
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  fileInputRef: React.RefObject<HTMLInputElement>
}

export function DocumentUpload({ isUploading, onFileChange, fileInputRef }: DocumentUploadProps) {
  return (
    <div className="flex items-center gap-4">
      <input
        type="file"
        accept="application/pdf"
        className="hidden"
        ref={fileInputRef}
        onChange={onFileChange}
        disabled={isUploading}
      />
      <Button 
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {isUploading ? 'Uploading & Processing...' : 'Upload PDF'}
      </Button>
    </div>
  )
}
