from fastapi import APIRouter
from backend.schemas.models import ForecastRequest
from backend.services.forecasting import generate_forecast

router = APIRouter(prefix="/api", tags=["Forecasting"])

@router.post("/forecast")
def post_forecast(request: ForecastRequest):
    facility = request.facility or "All"
    horizon = request.horizon_days or 7
    result = generate_forecast(
        facility=facility,
        horizon_days=horizon,
        anchor_date=request.anchor_date,
        year=request.year,
        month=request.month,
        start_date=request.start_date,
        end_date=request.end_date
    )
    return {
        "status": "success",
        "data": result
    }
