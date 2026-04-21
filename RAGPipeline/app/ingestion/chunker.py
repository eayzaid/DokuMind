from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.core.logging import get_logger

logger = get_logger(__name__)

def chunk_pages(pages: list[dict], filename: str) -> list[dict]:
    """
    Takes the list of pages from loader.py and splits them into chunks.
    Returns a list of chunks, each with content and metadata.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=150,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""]
    )
    
    all_chunks = []
    
    for page in pages:
        raw_chunks = splitter.split_text(page["content"])
        
        for i, chunk_text in enumerate(raw_chunks):
            # Skip chunks that are too short to be meaningful
            if len(chunk_text.strip()) < 50:
                continue
            
            all_chunks.append({
                "content": chunk_text.strip(),
                "metadata": {
                    "filename": page["metadata"]["filename"],
                    "page": page["metadata"]["page"],
                    "chunk_index": i,
                    # Unique ID for this chunk in ChromaDB
                    "chunk_id": f"{filename}_p{page['metadata']['page']}_c{i}"
                }
            })
    
    logger.info(f"Created {len(all_chunks)} chunks from {len(pages)} pages of '{filename}'")
    return all_chunks