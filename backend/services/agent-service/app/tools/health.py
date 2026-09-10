from typing import Any, Dict, Optional
from app.clients.finance_service import finance_service_client


async def calculate_financial_health(auth_header: Optional[str] = None) -> Dict[str, Any]:
    """Retrieves overall financial health score (0-100) and metric breakdowns."""
    health_data = await finance_service_client.get_health_score(auth_header)
    return health_data
