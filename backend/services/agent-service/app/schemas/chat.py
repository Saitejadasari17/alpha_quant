from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(..., description="User prompt or question")
    user_id: Optional[str] = Field(default="user_default", description="User ID context")
    confirmed_tool_call: Optional[Dict[str, Any]] = Field(
        default=None, description="Confirmed tool payload if user approved a restricted action"
    )


class ToolExecutionTrace(BaseModel):
    tool: str
    args: Dict[str, Any]
    result: Any
    permission_tier: str = "AUTOMATIC"
    duration_ms: float = 0.0


class PlanStep(BaseModel):
    step_number: int
    capability: str
    description: str
    status: str = "completed"  # pending, in_progress, completed, failed


class ChatResponse(BaseModel):
    success: bool = True
    response: str
    capability: str
    plan: List[PlanStep] = []
    traces: List[ToolExecutionTrace] = []
    pending_confirmation: Optional[Dict[str, Any]] = None
    digital_twin_comparison: Optional[Dict[str, Any]] = None
