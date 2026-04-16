import logging
from typing import List, Dict
from db import Database
from embeddings import EmbeddingModel

logger = logging.getLogger(__name__)


class Retriever:

    def __init__(self, db: Database, embedder: EmbeddingModel):
        self.db = db
        self.embedder = embedder

    def retrieve(
        self,
        query: str,
        country: str = "",
        limit: int = 100,
    ) -> List[Dict]:
        """
        Stage 1+2+3 of the RAG pipeline:
        - Embed the query
        - Run vector search
        - Assemble enriched context entries
        """
        logger.info(f"Embedding query ({len(query)} chars)")
        embedding = self.embedder.embed(query)

        logger.info(f"Running vector search (limit={limit}, country='{country}')")
        raw_chunks = self.db.vector_search(embedding, country, limit)

        logger.info(f"Retrieved {len(raw_chunks)} chunks from DB")
        return self._assemble_contexts(raw_chunks)

    def _assemble_contexts(self, raw_chunks: List[Dict]) -> List[Dict]:
        contexts = []
        for chunk in raw_chunks:
            contexts.append({
                "chunk_text":      chunk["chunk_text"],
                "document_id":     chunk["document_id"],
                "section_id":      chunk["section_id"],
                "section_title":   chunk["section_title"],
                "country":         chunk["country"],
                "publish_date":    chunk["publish_date"],
                "similarity_score": chunk["similarity_score"],
            })
        return contexts


class ApiRetriever:
    """API-based retrieval that uses SQL text search instead of local embeddings."""

    def __init__(self, db: Database):
        self.db = db

    def retrieve(
        self,
        query: str,
        country: str = "",
        limit: int = 100,
    ) -> List[Dict]:
        logger.info(f"API-based retrieval for query ({len(query)} chars), country='{country}'")
        raw_chunks = self.db.text_search(query, country, limit)
        logger.info(f"Retrieved {len(raw_chunks)} chunks from DB via API mode")
        return self._assemble_contexts(raw_chunks)

    def _assemble_contexts(self, raw_chunks: List[Dict]) -> List[Dict]:
        contexts = []
        for chunk in raw_chunks:
            contexts.append({
                "chunk_text":      chunk["chunk_text"],
                "document_id":     chunk["document_id"],
                "section_id":      chunk["section_id"],
                "section_title":   chunk["section_title"],
                "country":         chunk["country"],
                "publish_date":    chunk["publish_date"],
                "similarity_score": chunk["similarity_score"],
            })
        return contexts
