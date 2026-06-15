import React from 'react'
import { FileText, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { IngestedDocument } from '@/types/documents'
import { motion } from 'framer-motion'

const MotionTableBody = motion.create(TableBody)
const MotionTableRow = motion.create(TableRow)

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
}

interface DocumentTableProps {
  documents: IngestedDocument[]
  onPreview: (filename: string) => void
  onDelete: (filename: string) => void
}

export function DocumentTable({ documents, onPreview, onDelete }: DocumentTableProps) {
  if (documents.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/20 border-dashed"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
        </motion.div>
        <h3 className="text-lg font-medium text-foreground">No documents uploaded</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-1">
          Upload your first PDF document to begin processing it for the knowledge base.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[400px]">Document Name</TableHead>
            <TableHead>Chunks</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <MotionTableBody variants={containerVariants} initial="hidden" animate="show">
          {documents.map((doc) => (
            <MotionTableRow key={doc.filename} variants={itemVariants}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  {doc.filename}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {doc.chunks} chunks
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onPreview(doc.filename)}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    title="Preview Document"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Preview</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(doc.filename)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </TableCell>
            </MotionTableRow>
          ))}
        </MotionTableBody>
      </Table>
    </div>
  )
}
