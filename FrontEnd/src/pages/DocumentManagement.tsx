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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <Card className="glass-surface border-border/60">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">
              Knowledge base
            </p>
            <CardTitle className="text-2xl tracking-tight">
              Document Management
            </CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-6">
              Upload PDF documents to index them into the organizational
              knowledge base.
            </CardDescription>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <DocumentUpload
              isUploading={isUploading}
              onFileChange={handleFileChange}
              fileInputRef={fileInputRef}
            />
            <div className="grid gap-2 text-sm text-muted-foreground sm:text-right">
              <span className="font-medium text-foreground">
                {documents.length} indexed documents
              </span>
              <span>{totalChunks} chunks ready for retrieval</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="overflow-hidden border-border/60 bg-card/80 shadow-[0_20px_50px_rgba(70,53,53,0.10)] backdrop-blur">
        <CardHeader className="border-b border-border/60 px-6 py-5">
          <CardTitle className="text-lg font-semibold tracking-tight">
            Indexed Documents
          </CardTitle>
          <CardDescription>
            A list of all documents currently available to the assistant.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <DocumentTable
            documents={documents}
            onPreview={setPreviewFilename}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

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
