import React from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DocumentUploadProps {
  isUploading: boolean
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
}

export function DocumentUpload({ isUploading, onFileChange, fileInputRef }: DocumentUploadProps) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-border/60 bg-background/80 px-3 py-2 shadow-sm backdrop-blur">
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
        className="h-11 gap-2 rounded-full bg-primary px-5 text-primary-foreground shadow-[0_10px_24px_rgba(157,116,116,0.24)] hover:bg-primary/90"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {isUploading ? 'Uploading and processing...' : 'Upload PDF'}
      </Button>
    </div>
  )
}
