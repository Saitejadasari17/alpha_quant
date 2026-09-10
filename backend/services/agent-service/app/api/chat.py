from fastapi import APIRouter, Header, HTTPException
from typing import Optional
from app.agent.supervisor import supervisor
from app.schemas.chat import ChatRequest, ChatResponse, PlanStep, ToolExecutionTrace

router = APIRouter(prefix="/api/v1/agent", tags=["agent"])


@router.post("/chat", response_model=ChatResponse)
async def agent_chat(payload: ChatRequest, authorization: Optional[str] = Header(None)):
    try:
        state = await supervisor.process_request(
            query=payload.message,
            user_id=payload.user_id or "user_default",
            auth_header=authorization,
            confirmed_tool_call=payload.confirmed_tool_call,
        )

        plan_steps = [PlanStep(**step) for step in state.plan_steps]
        traces = [ToolExecutionTrace(**trace) for trace in state.traces]

        return ChatResponse(
            success=True,
            response=state.final_response,
            capability=state.capability,
            plan=plan_steps,
            traces=traces,
            pending_confirmation=state.pending_confirmation,
            digital_twin_comparison=state.digital_twin_comparison,
        )
    except Exception as e:
        print(f"[AgentChatError] {e}")
        raise HTTPException(status_code=500, detail=str(e))
