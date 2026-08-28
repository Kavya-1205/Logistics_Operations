from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from backend.services.optimization import calculate_optimization

router = APIRouter(prefix="/api", tags=["Optimization"])

class OptimizationRequest(BaseModel):
    facility: Optional[str] = "All"
    volume_multiplier: Optional[float] = 1.0
    resource_multiplier: Optional[float] = 1.0
    peak_mode: Optional[bool] = False
    year: Optional[int] = None
    month: Optional[int] = None
    shift: Optional[str] = "All"

@router.post("/optimization")
def post_optimization(request: OptimizationRequest):
    result = calculate_optimization(
        facility=request.facility or "All",
        volume_multiplier=request.volume_multiplier or 1.0,
        resource_multiplier=request.resource_multiplier or 1.0,
        peak_mode=request.peak_mode or False,
        year=request.year,
        month=request.month,
        shift=request.shift or "All"
    )
    return {
        "status": "success",
        "data": result
    }
