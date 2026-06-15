import { Loader2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DocumentViewer } from '@/components/DocumentViewer'
import { useDocuments } from '@/hooks/useDocuments'
import { DocumentTable } from '@/components/documents/DocumentTable'
import { DocumentUpload } from '@/components/documents/DocumentUpload'

export default function DocumentManagement() {
  const {
    documents,
    totalChunks,
    isLoading,
    isUploading,
    previewFilename,
    setPreviewFilename,
    fileInputRef,
    handleFileChange,
    handleDelete
  } = useDocuments()

  if (isLoading && documents.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl w-full mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Document Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload PDF documents to index them into the organizational knowledge base.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <DocumentUpload 
            isUploading={isUploading} 
            onFileChange={handleFileChange} 
            fileInputRef={fileInputRef} 
          />
          <p className="text-sm font-medium text-muted-foreground">
            {documents.length} indexed documents ({totalChunks} chunks)
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <Card className="bg-card border-border shadow-card">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-lg font-semibold text-card-foreground">Indexed Documents</CardTitle>
            <CardDescription>
              A list of all documents currently available to the assistant.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <DocumentTable 
              documents={documents} 
              onPreview={setPreviewFilename} 
              onDelete={handleDelete} 
            />
          </CardContent>
        </Card>
      </div>

      <DocumentViewer 
        filename={previewFilename} 
        isOpen={!!previewFilename} 
        onOpenChange={(open) => {
          if (!open) setPreviewFilename(null)
        }} 
      />
    </div>
  )
}
