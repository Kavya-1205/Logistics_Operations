from fastapi import APIRouter
from typing import Optional
from backend.services.kpi_service import get_dashboard_kpis

router = APIRouter(prefix="/api", tags=["Dashboard"])

@router.get("/dashboard")
def get_dashboard(
    facility: Optional[str] = "All",
    year: Optional[int] = None,
    month: Optional[int] = None,
    shift: Optional[str] = "All"
):
    result = get_dashboard_kpis(
        facility=facility or "All",
        year=year,
        month=month,
        shift=shift or "All"
    )
    return {
        "status": "success",
        "data": result
    }
