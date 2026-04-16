import os
import logging
from typing import Dict
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

from embeddings import EmbeddingModel
from db import Database
from retriever import Retriever, ApiRetriever
from judge import LLMJudge
from report_generator import ReportGenerator

logger = logging.getLogger(__name__)


class LegalRAGPipeline:
    """
    Orchestrates the full RAG pipeline:

    Stage 1  — Query Embedding        (embeddings.py)
    Stage 2  — Vector Retrieval       (db.py)
    Stage 3  — Context Assembly       (retriever.py)
    Stage 4  — LLM-as-Judge Filtering (judge.py)   50 → 20 → 10 → 5
    Stage 5  — Report Generation      (report_generator.py)
    """

    def __init__(self):

        logger.info("Initializing Legal RAG Pipeline...")

        # Shared Groq client
        groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

        judge_model    = os.getenv("GROQ_JUDGE_MODEL",  "llama-3.1-8b-instant")
        analysis_model = os.getenv("GROQ_KIWI_MODEL",   "llama-3.3-70b-versatile")
        rag_mode       = os.getenv("RAG_MODE", "local").strip().lower()

        # Instantiate modules
        self.db        = Database()
        self.judge     = LLMJudge(groq_client, judge_model)
        self.reporter  = ReportGenerator(groq_client, analysis_model)

        if rag_mode == "api":
            logger.info("Using API-based retrieval mode for RAG")
            self.retriever = ApiRetriever(self.db)
        else:
            try:
                self.embedder = EmbeddingModel()
                self.retriever = Retriever(self.db, self.embedder)
            except Exception as e:
                logger.warning(
                    "Local embeddings unavailable; falling back to API-based retrieval. "
                    "Set RAG_MODE=local once torch/transformers are installed."
                )
                self.embedder = None
                self.retriever = ApiRetriever(self.db)

        logger.info("RAG Pipeline initialized")

    # ------------------------------------------------------------------
    # Main entry point called by app.py
    # ------------------------------------------------------------------

    def generate_report(
        self,
        product_description: str,
        country: str,
        domain: str,
    ) -> Dict:

        # Stage 1-3: embed + retrieve + assemble (limit=50 per spec)
        contexts = self.retriever.retrieve(
            query=product_description,
            country=country,
            limit=50,
        )

        # Stage 4: 3-pass LLM-as-Judge filtering  50 → 20 → 10 → 5
        filtered = self.judge.filter(
            chunks=contexts,
            product_description=product_description,
            domain=domain,
        )

        # Stage 5: structured report generation
        report = self.reporter.generate(
            product_description=product_description,
            country=country,
            domain=domain,
            contexts=filtered,
        )

        return report

    # ------------------------------------------------------------------
    # Graceful shutdown
    # ------------------------------------------------------------------

    def close(self):
        self.db.close()
