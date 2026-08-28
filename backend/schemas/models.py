from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# Filter Request
class FilterParams(BaseModel):
    year: Optional[int] = None
    month: Optional[int] = None
    facility: Optional[str] = "All"
    shift: Optional[str] = "All"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    anchor_date: Optional[str] = None

# Forecast Request
class ForecastRequest(BaseModel):
    facility: Optional[str] = "All"
    horizon_days: Optional[int] = 7
    year: Optional[int] = None
    month: Optional[int] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    anchor_date: Optional[str] = None
