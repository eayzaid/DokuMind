import pypdf
import io
from app.core.logging import get_logger

logger = get_logger(__name__)

def load_pdf(file_bytes: bytes, filename: str) -> list[dict]:
    """
    Takes a PDF as raw bytes, returns a list of pages.
    Each page is a dict with the text content and metadata.
    """
    logger.info(f"Loading PDF: {filename}")
    
    pages = []
    
    try:
        # Wrap bytes in a file-like object so pypdf can read it
        pdf_file = io.BytesIO(file_bytes)
        reader = pypdf.PdfReader(pdf_file)
        
        if len(reader.pages) == 0:
            raise ValueError(f"PDF '{filename}' has no pages")
        
        for page_num, page in enumerate(reader.pages):
            text = page.extract_text()
            
            # Skip empty pages (scanned PDFs return empty strings)
            if not text or not text.strip():
                logger.warning(f"Page {page_num + 1} of '{filename}' returned no text — possibly scanned")
                continue
            
            pages.append({
                "content": text.strip(),
                "metadata": {
                    "filename": filename,
                    "page": page_num + 1,
                    "total_pages": len(reader.pages)
                }
            })
        
        if not pages:
            raise ValueError(
                f"No text could be extracted from '{filename}'. "
                f"The file may be a scanned PDF (image-based). "
                f"Only text-based PDFs are supported in the MVP."
            )
        
        logger.info(f"Extracted {len(pages)} pages from '{filename}'")
        return pages
    
    except pypdf.errors.PdfReadError:
        raise ValueError(f"'{filename}' is not a valid or readable PDF file")