from groq import Groq
from app.core.config import settings
from app.core.logging import get_logger
from typing import Generator

logger = get_logger(__name__)

client = Groq(api_key=settings.groq_api_key)

def generate(prompt: str) -> str:
    """
    Sends prompt to Groq and returns full response.
    """
    logger.info(f"Sending prompt to Groq: {settings.groq_model}")
    
    response = client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a document assistant. "
                    "Answer ONLY based on the documents provided. "
                    "If the answer is not in the documents, say exactly: "
                    "'I don't have information on this topic in your company documents.' "
                    "Never use general knowledge to fill gaps."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.1,
        max_tokens=1024,
    )
    
    return response.choices[0].message.content

def stream(prompt: str) -> Generator[str, None, None]:
    """
    Streams response token by token from Groq.
    """
    logger.info(f"Streaming from Groq: {settings.groq_model}")
    
    response = client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a document assistant. "
                    "Answer ONLY based on the documents provided. "
                    "If the answer is not in the documents, say exactly: "
                    "'I don't have information on this topic in your company documents.' "
                    "Never use general knowledge to fill gaps."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.1,
        max_tokens=1024,
        stream=True,
    )
    
    for chunk in response:
        token = chunk.choices[0].delta.content
        if token:
            yield token