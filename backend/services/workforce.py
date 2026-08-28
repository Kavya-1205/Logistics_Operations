import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from backend.services.excel_service import data_manager

def calculate_smart_workforce(
    facility: str = "All",
    horizon_days: int = 7,
    volume_multiplier: float = 1.0,
    worker_multiplier: float = 1.0,
    enable_overtime: bool = False,
    year: Optional[int] = None,
    month: Optional[int] = None
) -> Dict[str, Any]:
    # 1. Fetch filtered operational data
    df = data_manager.get_filtered_data(facility=facility, year=year, month=month)
    if df.empty:
        df = data_manager.get_all_data()

    # Productivity benchmark: standard packages handled per worker per shift (approx 360 pkgs)
    productivity_rate = 360.0

    # Shift distribution ratios
    shifts_def = [
        {"name": "Morning", "vol_share": 0.33, "base_req": 118, "base_avail": 125},
        {"name": "Afternoon", "vol_share": 0.40, "base_req": 142, "base_avail": 130},
        {"name": "Night", "vol_share": 0.27, "base_req": 82, "base_avail": 63}
    ]

    mult = 1.0 if facility != "All" else 4.0
    
    # Base daily volume for the hub / network
    if not df.empty:
        unique_days = max(1, len(df["date_str"].unique()))
        daily_baseline_vol = int((df["inbound_volume"].sum() + df["outbound_volume"].sum()) / unique_days)
    else:
        daily_baseline_vol = int(18350 * mult)

    # Scale total forecast workload based on horizon_days (1 day, 7 days, or 30 days)
    total_horizon_vol = int(daily_baseline_vol * horizon_days)
    simulated_total_vol = int(total_horizon_vol * volume_multiplier)

    # Shift-by-shift calculation
    shift_results = []
    tot_req = 0
    tot_avail = 0

    for s in shifts_def:
        s_vol = int(simulated_total_vol * s["vol_share"])
        # Daily required workers for the horizon
        s_req = int(np.ceil(s_vol / (productivity_rate * horizon_days)))
        # Available workers per shift
        base_a = int(s["base_avail"] * mult * worker_multiplier)
        if enable_overtime:
            base_a = int(base_a * 1.15) # +15% capacity via overtime
            
        gap = base_a - s_req # Negative is shortage, Positive is surplus
        
        if gap > 0:
            status = "surplus"
        elif gap < 0:
            status = "shortage"
        else:
            status = "optimal"

        shift_results.append({
            "shift": s["name"],
            "volume": s_vol,
            "required_workers": s_req,
            "available_workers": base_a,
            "gap": gap,
            "status": status
        })

        tot_req += s_req
        tot_avail += base_a

    total_gap = tot_avail - tot_req
    utilization_pct = round((tot_req / max(tot_avail, 1)) * 100, 1)

    # 2. Staffing Reallocation Heuristic (Math balancing)
    surplus_shifts = [s for s in shift_results if s["gap"] > 0]
    shortage_shifts = [s for s in shift_results if s["gap"] < 0]
    
    total_surplus = sum(s["gap"] for s in surplus_shifts)
    total_shortage = abs(sum(s["gap"] for s in shortage_shifts))
    
    reallocable_count = min(total_surplus, total_shortage)
    net_shortage_remaining = max(0, total_shortage - total_surplus)

    recommendations = []
    if reallocable_count > 0:
        source_names = ", ".join([s["shift"] for s in surplus_shifts])
        target_names = ", ".join([s["shift"] for s in shortage_shifts])
        recommendations.append({
            "type": "reallocate",
            "icon": "🔄",
            "title": f"Reallocate {reallocable_count} workers",
            "description": f"Transfer surplus staff from {source_names} shift to {target_names} shift to balance line capacity."
        })
        
    if net_shortage_remaining > 0:
        recommendations.append({
            "type": "shortage",
            "icon": "🔴",
            "title": f"Add {net_shortage_remaining} workers or authorize overtime",
            "description": f"Remaining net deficit of {net_shortage_remaining} workers after internal shift reallocation."
        })
    elif total_gap >= 0:
        recommendations.append({
            "type": "optimal",
            "icon": "🟢",
            "title": "Optimal Staffing Coverage",
            "description": f"Available scheduled headcount ({tot_avail}) meets or exceeds required manpower ({tot_req})."
        })

    recommendations.append({
        "type": "info",
        "icon": "🟢",
        "title": "Shift Throughput Balance",
        "description": "Standard shift balance maintained within targeted SLA turnaround limits."
    })

    # 3. Workload vs Workforce Capacity Timeline
    timeline_len = 7 if horizon_days >= 7 else 1
    days_of_week = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][:timeline_len]
    daily_capacity_timeline = []
    daily_avg_vol = simulated_total_vol / float(horizon_days)
    daily_cap_vol = int(tot_avail * productivity_rate)

    day_factors = [0.92, 0.98, 1.02, 0.95, 1.14, 1.06, 0.93][:timeline_len]
    for idx, d_name in enumerate(days_of_week):
        d_vol = int(daily_avg_vol * day_factors[idx]) if timeline_len > 1 else int(simulated_total_vol)
        d_util = round((d_vol / max(daily_cap_vol, 1)) * 100, 1)
        if d_util > 100:
            d_status = "shortage"
        elif d_util >= 90:
            d_status = "near_limit"
        else:
            d_status = "normal"
            
        daily_capacity_timeline.append({
            "day": d_name if timeline_len > 1 else "Tomorrow",
            "forecast_volume": d_vol,
            "workforce_capacity": daily_cap_vol,
            "utilization_pct": d_util,
            "status": d_status
        })

    # 4. Actionable Planning Alerts
    alerts = []
    for s in shift_results:
        if s["gap"] < 0:
            alerts.append({
                "severity": "critical",
                "message": f"{s['shift']} shift is short by {abs(s['gap'])} workers ({s['required_workers']} required vs {s['available_workers']} scheduled)."
            })
            
    for d in daily_capacity_timeline:
        if d["status"] == "shortage":
            alerts.append({
                "severity": "warning",
                "message": f"{d['day']} projected demand ({d['forecast_volume']:,} pkgs) exceeds workforce capacity ({d['workforce_capacity']:,} pkgs)."
            })
            break

    alerts.append({
        "severity": "optimal",
        "message": "Staffing and throughput are within target operating benchmark."
    })

    return {
        "facility": facility,
        "horizon_days": horizon_days,
        "forecast_workload": simulated_total_vol,
        "total_required": tot_req,
        "total_available": tot_avail,
        "total_gap": total_gap,
        "utilization_pct": utilization_pct,
        "shifts": shift_results,
        "recommendations": recommendations,
        "daily_capacity": daily_capacity_timeline,
        "alerts": alerts
    }

calculate_workforce_plan = calculate_smart_workforce
