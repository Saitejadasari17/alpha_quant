from typing import Any, Dict, List
from app.rag.vector_store import knowledge_store


async def search_financial_knowledge(query: str) -> List[Dict[str, Any]]:
    """Searches curated financial guides and educational rules of thumb."""
    return knowledge_store.search(query, limit=3)
