import { useState, useRef, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { apiClient } from '@/services/apiClient'
import type { IngestedDocument } from '@/types/documents'

const RETRYABLE_STATUS_CODES = new Set([500, 502, 503, 504])

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function useDocuments() {
  const [documents, setDocuments] = useState<IngestedDocument[]>([])
  const [totalChunks, setTotalChunks] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [previewFilename, setPreviewFilename] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true)
    const maxAttempts = 3

    try {
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
          const response = await apiClient.get('/documents')
          const data = response.data
          setDocuments(data.documents || [])
          setTotalChunks(data.total_chunks || 0)
          return
        } catch (error: any) {
          const status = error?.response?.status
          const shouldRetry =
            attempt < maxAttempts && (!status || RETRYABLE_STATUS_CODES.has(status))

          if (shouldRetry) {
            await sleep(400 * attempt)
            continue
          }

          toast.error('Failed to load documents', {
            description: error.message || 'Check connection to RAG pipeline.',
          })
          return
        }
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Invalid file type', {
        description: 'Only PDF documents are supported.',
      })
      return
    }

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      const response = await apiClient.post('/documents/ingest', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const res = response.data
      toast.success('Document uploaded successfully', {
        description: res.pages_processed ? `Processed ${res.pages_processed} pages into ${res.chunks_stored} chunks.` : 'Document has been uploaded and processed.',
      })
      fetchDocuments()
    } catch (error: any) {
      toast.error('Upload failed', {
        description: error.response?.data?.detail || error.message,
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (filename: string) => {
    try {
      const response = await apiClient.delete('/documents', {
        params: { filename }
      })
      const res = response.data
      toast.success('Document deleted', {
        description: `Removed ${res.deleted_chunks} chunks for ${res.filename}`,
      })
      fetchDocuments()
    } catch (error: any) {
      toast.error('Delete failed', {
        description: error.response?.data?.detail || error.message,
      })
    }
  }

  return {
    documents,
    totalChunks,
    isLoading,
    isUploading,
    previewFilename,
    setPreviewFilename,
    fileInputRef,
    handleFileChange,
    handleDelete,
    fetchDocuments
  }
}
