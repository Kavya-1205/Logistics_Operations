from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from backend.services.workforce import calculate_smart_workforce

router = APIRouter(prefix="/api", tags=["Workforce"])

class WorkforceRequest(BaseModel):
    facility: Optional[str] = "All"
    horizon_days: Optional[int] = 7
    year: Optional[int] = None
    month: Optional[int] = None
    shift: Optional[str] = "All"
    volume_multiplier: Optional[float] = 1.0
    worker_multiplier: Optional[float] = 1.0
    enable_overtime: Optional[bool] = False

@router.post("/workforce")
def post_workforce(request: WorkforceRequest):
    result = calculate_smart_workforce(
        facility=request.facility or "All",
        horizon_days=request.horizon_days or 7,
        volume_multiplier=request.volume_multiplier or 1.0,
        worker_multiplier=request.worker_multiplier or 1.0,
        enable_overtime=request.enable_overtime or False,
        year=request.year,
        month=request.month
    )
    return {
        "status": "success",
        "data": result
    }
