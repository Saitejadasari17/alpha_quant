from typing import Any, Dict, Optional
import httpx
from app.config.settings import settings


class MLServiceClient:
    def __init__(self, base_url: Optional[str] = None):
        self.base_url = base_url or settings.ML_SERVICE_URL

    async def predict_spending(self, user_id: str, months_ahead: int = 1) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/api/v1/ml/predict/spending",
                    json={"user_id": user_id, "months_ahead": months_ahead},
                )
                if response.status_code == 200:
                    return response.json().get("data", {})
                return {}
            except Exception as e:
                print(f"[MLServiceClient] Error predicting spending: {e}")
                return {}

    async def get_investment_recommendations(self, user_id: str) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(
                    f"{self.base_url}/api/v1/ml/recommendations/investments",
                    params={"user_id": user_id},
                )
                if response.status_code == 200:
                    return response.json().get("data", {})
                return {}
            except Exception as e:
                print(f"[MLServiceClient] Error getting investment recommendations: {e}")
                return {}


ml_service_client = MLServiceClient()
