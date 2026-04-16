import os
import logging
import numpy as np

logger = logging.getLogger(__name__)

# Must match the model used during ingestion if local embeddings are used
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "nlpaueb/legal-bert-base-uncased")
EMBEDDING_DIM = int(os.getenv("EMBEDDING_DIM", 768))


class EmbeddingModel:
    """Local embedding model wrapper with lazy imports."""

    def __init__(self):
        try:
            import torch
            from transformers import AutoTokenizer, AutoModel
        except ImportError as e:
            raise ImportError(
                "Local embedding dependencies are not installed. "
                "Install torch and transformers, or set RAG_MODE=api to use API-based retrieval."
            ) from e

        self.torch = torch
        self.tokenizer = AutoTokenizer.from_pretrained(EMBEDDING_MODEL)
        self.model = AutoModel.from_pretrained(EMBEDDING_MODEL)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        logger.info(f"Loading embedding model: {EMBEDDING_MODEL}")
        self.model.to(self.device)
        self.model.eval()
        logger.info(f"Embedding model loaded on {self.device}")

    def embed(self, text: str) -> np.ndarray:
        """Generate an embedding for a query string."""
        inputs = self.tokenizer(
            text,
            padding=True,
            truncation=True,
            max_length=512,
            return_tensors="pt",
        )
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        with self.torch.no_grad():
            outputs = self.model(**inputs)

        embedding = outputs.last_hidden_state[:, 0, :]
        return embedding.cpu().numpy()[0]
