from typing import Any, Dict, List
from app.rag.seed_data import KNOWLEDGE_DOCUMENTS


class VectorKnowledgeStore:
    def __init__(self):
        self.documents = KNOWLEDGE_DOCUMENTS

    def search(self, query: str, limit: int = 3) -> List[Dict[str, Any]]:
        query_words = set(query.lower().split())
        scored = []
        for doc in self.documents:
            text = (doc["title"] + " " + doc["content"]).lower()
            score = sum(1 for word in query_words if word in text)
            if score > 0:
                scored.append((score, doc))

        scored.sort(key=lambda x: x[0], reverse=True)
        results = [doc for _, doc in scored[:limit]]
        if not results:
            results = self.documents[:limit]
        return results


knowledge_store = VectorKnowledgeStore()
