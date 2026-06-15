import { useEffect, useState } from "react"

import { useMediaQuery } from "@/hooks/use-media-query"
import { apiClient } from "@/services/apiClient"
import { Loader2 } from "lucide-react"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface DocumentViewerProps {
  filename: string | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function DocumentViewer({ filename, isOpen, onOpenChange }: DocumentViewerProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !filename) return

    let currentBlobUrl = ""

    const fetchDocument = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await apiClient.get(`/documents/preview/${encodeURIComponent(filename)}`, {
          responseType: 'blob'
        })
        
        const blob = new Blob([response.data], { type: 'application/pdf' })
        currentBlobUrl = URL.createObjectURL(blob)
        setBlobUrl(currentBlobUrl)
      } catch (err: any) {
        setError(err.message || 'Failed to load document preview')
      } finally {
        setLoading(false)
      }
    }

    fetchDocument()

    return () => {
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl)
      }
      setBlobUrl(null)
    }
  }, [isOpen, filename])

  if (!filename) {
    return null
  }

  const ViewerContent = (
    <div 
      className="h-full w-full flex-1 overflow-hidden rounded-md border border-border flex items-center justify-center bg-muted/20 animate-in fade-in zoom-in-95 duration-300"
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Loading preview...</p>
        </div>
      ) : error ? (
        <div className="text-destructive p-4 text-center">
          <p>{error}</p>
        </div>
      ) : blobUrl ? (
        <iframe
          src={blobUrl}
          className="h-full w-full border-0"
          title={`Preview of ${filename}`}
        />
      ) : null}
    </div>
  )

  if (isDesktop) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-[95vw] sm:max-w-[95vw] flex flex-col p-4 sm:p-6">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-xl font-semibold break-words whitespace-normal">{filename}</SheetTitle>
            <SheetDescription>
              Document Preview
            </SheetDescription>
          </SheetHeader>
          {ViewerContent}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[90vh] flex flex-col">
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-xl font-semibold break-words whitespace-normal">{filename}</DrawerTitle>
          <DrawerDescription>
            Document Preview
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-hidden p-4 pt-0">
          {ViewerContent}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
