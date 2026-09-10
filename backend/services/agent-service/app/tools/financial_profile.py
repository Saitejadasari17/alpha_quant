from typing import Any, Dict, Optional
from app.clients.user_service import user_service_client


async def get_financial_profile(auth_header: Optional[str] = None) -> Dict[str, Any]:
    """Retrieves user income, age, email, and basic profile metadata."""
    profile = await user_service_client.get_user_profile(auth_header)
    return {
        "userId": profile.get("id"),
        "fullName": profile.get("fullName") or profile.get("name"),
        "email": profile.get("email"),
        "monthlyIncome": profile.get("monthlyIncome", 0),
        "age": profile.get("age"),
    }
