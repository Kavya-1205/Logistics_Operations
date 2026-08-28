import io
import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple, Optional, List
from datetime import datetime

REQUIRED_CONCEPTUAL_COLUMNS = [
    "date",
    "facility",
    "shift",
    "inbound",
    "outbound",
    "inventory",
    "workers"
]

COLUMN_SYNONYMS = {
    "date": ["date", "timestamp", "datetime", "record_date", "operations_date", "Date"],
    "facility": ["facility", "facility_id", "hub", "location", "facility_name", "center", "Facility"],
    "shift": ["shift", "shift_name", "work_shift", "Shift"],
    "inbound": ["inbound", "inbound_volume", "inbound_packages", "inflow", "inbound_pkgs", "Inbound"],
    "outbound": ["outbound", "outbound_volume", "outbound_packages", "outflow", "outbound_pkgs", "Outbound"],
    "inventory": ["inventory", "inventory_volume", "current_inventory", "stock_level", "inventory_pkgs", "Inventory"],
    "workers": ["available_workers", "workers", "available_worker", "actual_workers", "scheduled_workers", "worker_count", "Available_Workers"],
    "processed": ["processed_volume", "processed_packages", "actual_processed", "Processed"],
    "backlog": ["backlog_volume", "backlog_packages", "pending_volume", "Backlog"],
    "operating_hours": ["operating_hours", "shift_hours", "hours", "Operating_Hours", "shift_duration"],
    "cycle_time": ["avg_cycle_time_minutes", "cycle_time", "processing_time_mins", "Actual_Processing_Time", "cycle_time_minutes"],
    "throughput": ["throughput_packages_per_hour", "throughput", "pkg_per_hour", "hourly_throughput"],
    "cost": ["operational_cost", "cost", "total_cost", "expenses"],
    "holiday": ["is_holiday", "holiday", "Holiday"],
    "peak": ["is_peak_period", "peak_period", "is_peak", "Peak_Period"]
}

def identify_column_mapping(df_columns: List[str]) -> Dict[str, str]:
    mapping = {}
    lower_to_orig = {col.strip().lower(): col for col in df_columns}
    
    for standard_col, synonyms in COLUMN_SYNONYMS.items():
        found = False
        for syn in synonyms:
            syn_lower = syn.lower()
            if syn_lower in lower_to_orig:
                mapping[standard_col] = lower_to_orig[syn_lower]
                found = True
                break
        if not found:
            # Check for partial containment
            for orig_lower, orig_name in lower_to_orig.items():
                if standard_col in orig_lower:
                    mapping[standard_col] = orig_name
                    found = True
                    break
    return mapping

def clean_numeric(series: pd.Series) -> pd.Series:
    if series is None:
        return series
    if pd.api.types.is_numeric_dtype(series):
        return series.fillna(0)
    # If string with commas or dollar signs
    cleaned = series.astype(str).str.replace(",", "").str.replace("$", "").str.strip()
    return pd.to_numeric(cleaned, errors="coerce").fillna(0)

def validate_and_process_dataset(file_content: bytes, filename: str) -> Tuple[bool, Optional[pd.DataFrame], Dict[str, Any]]:
    errors = []
    
    # 1. Load File
    try:
        if filename.endswith(".xlsx") or filename.endswith(".xls"):
            # Try to read 'Operations_Data' sheet if available, else first sheet
            xl = pd.ExcelFile(io.BytesIO(file_content))
            sheet_name = "Operations_Data" if "Operations_Data" in xl.sheet_names else xl.sheet_names[0]
            df = xl.parse(sheet_name)
        elif filename.endswith(".csv") or filename.endswith(".txt"):
            df = pd.read_csv(io.BytesIO(file_content))
        else:
            return False, None, {"errors": [f"Unsupported file format: {filename}. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file."]}
    except Exception as e:
        return False, None, {"errors": [f"Failed to read file: {str(e)}"]}
    
    if df.empty:
        return False, None, {"errors": ["The uploaded file is empty."]}
    
    initial_rows = len(df)
    
    # 2. Map Columns
    col_mapping = identify_column_mapping(df.columns.tolist())
    
    missing_required = []
    for req in REQUIRED_CONCEPTUAL_COLUMNS:
        if req not in col_mapping:
            # If shift is missing, we can default to 'General'
            if req == "shift":
                df["shift"] = "General"
                col_mapping["shift"] = "shift"
                continue
            missing_required.append(req.capitalize())
            
    if missing_required:
        return False, None, {
            "errors": [f"Missing required columns: {', '.join(missing_required)}. Found columns: {', '.join(df.columns[:8])}..."]
        }
    
    # 3. Create Canonical Standardized DataFrame
    standard_df = pd.DataFrame()
    
    # Date
    raw_date_col = col_mapping["date"]
    try:
        standard_df["date"] = pd.to_datetime(df[raw_date_col], errors="coerce")
    except Exception as e:
        return False, None, {"errors": [f"Invalid date format in column '{raw_date_col}': {str(e)}"]}
        
    # Drop rows with invalid dates
    valid_date_mask = standard_df["date"].notna()
    standard_df = standard_df[valid_date_mask]
    df = df[valid_date_mask]
    
    if standard_df.empty:
        return False, None, {"errors": ["No valid date rows found."]}
        
    standard_df["date_str"] = standard_df["date"].dt.strftime("%Y-%m-%d")
    standard_df["year"] = standard_df["date"].dt.year
    standard_df["month"] = standard_df["date"].dt.month
    standard_df["day"] = standard_df["date"].dt.day
    standard_df["day_name"] = standard_df["date"].dt.day_name()
    standard_df["day_of_week"] = standard_df["date"].dt.dayofweek
    
    # Facility
    standard_df["facility"] = df[col_mapping["facility"]].astype(str).str.strip()
    
    # Shift
    standard_df["shift"] = df[col_mapping["shift"]].astype(str).str.strip().str.capitalize()
    
    # Volumes
    standard_df["inbound_volume"] = clean_numeric(df[col_mapping["inbound"]]).astype(int)
    standard_df["outbound_volume"] = clean_numeric(df[col_mapping["outbound"]]).astype(int)
    standard_df["inventory_volume"] = clean_numeric(df[col_mapping["inventory"]]).astype(int)
    
    # Processed & Backlog
    if "processed" in col_mapping:
        standard_df["processed_volume"] = clean_numeric(df[col_mapping["processed"]]).astype(int)
    else:
        standard_df["processed_volume"] = standard_df["outbound_volume"]
        
    if "backlog" in col_mapping:
        standard_df["backlog_volume"] = clean_numeric(df[col_mapping["backlog"]]).astype(int)
    else:
        standard_df["backlog_volume"] = (standard_df["inbound_volume"] - standard_df["outbound_volume"]).clip(lower=0)
        
    # Workers
    standard_df["available_workers"] = clean_numeric(df[col_mapping["workers"]]).astype(int)
    # Default scheduled & actual
    standard_df["scheduled_workers"] = standard_df["available_workers"]
    standard_df["actual_workers"] = standard_df["available_workers"]
    
    # Operating hours & metrics
    if "operating_hours" in col_mapping:
        standard_df["operating_hours"] = clean_numeric(df[col_mapping["operating_hours"]]).clip(lower=1)
    else:
        standard_df["operating_hours"] = 8
        
    if "cycle_time" in col_mapping:
        standard_df["cycle_time"] = clean_numeric(df[col_mapping["cycle_time"]])
    else:
        standard_df["cycle_time"] = 28.5
        
    if "throughput" in col_mapping:
        standard_df["throughput"] = clean_numeric(df[col_mapping["throughput"]])
    else:
        standard_df["throughput"] = (standard_df["processed_volume"] / standard_df["operating_hours"]).round(1)
        
    if "cost" in col_mapping:
        standard_df["operational_cost"] = clean_numeric(df[col_mapping["cost"]])
    else:
        standard_df["operational_cost"] = standard_df["available_workers"] * 25.0 * standard_df["operating_hours"]
        
    if "holiday" in col_mapping:
        standard_df["is_holiday"] = clean_numeric(df[col_mapping["holiday"]]).astype(int)
    else:
        standard_df["is_holiday"] = 0
        
    if "peak" in col_mapping:
        standard_df["is_peak_period"] = clean_numeric(df[col_mapping["peak"]]).astype(int)
    else:
        standard_df["is_peak_period"] = standard_df["month"].apply(lambda m: 1 if m in [10, 11, 12] else 0)
        
    # Sort chronologically
    standard_df = standard_df.sort_values(by=["date", "facility", "shift"]).reset_index(drop=True)
    
    # 4. Compute Health & Summary Statistics
    total_records = len(standard_df)
    unique_facilities = sorted(standard_df["facility"].unique().tolist())
    unique_shifts = sorted(standard_df["shift"].unique().tolist())
    unique_years = sorted(standard_df["year"].unique().tolist())
    unique_months = sorted(standard_df["month"].unique().tolist())
    
    date_min = standard_df["date_str"].min()
    date_max = standard_df["date_str"].max()
    
    # Check if dataset is hourly (multiple rows per date-facility-shift)
    is_hourly = False
    dups = standard_df.groupby(["date_str", "facility", "shift"]).size().max()
    if dups > 1:
        is_hourly = True
        
    # Preview sample
    preview_df = standard_df.head(10).copy()
    preview_df["date"] = preview_df["date_str"]
    sample_preview = preview_df[["date", "facility", "shift", "inbound_volume", "outbound_volume", "inventory_volume", "available_workers", "throughput"]].to_dict(orient="records")
    
    summary = {
        "valid": True,
        "filename": filename,
        "total_records": total_records,
        "initial_rows": initial_rows,
        "facilities": unique_facilities,
        "shifts": unique_shifts,
        "years": unique_years,
        "months": unique_months,
        "date_min": date_min,
        "date_max": date_max,
        "is_hourly": is_hourly,
        "missing_values_handled": int(initial_rows - total_records),
        "sample_preview": sample_preview,
        "errors": []
    }
    
    return True, standard_df, summary
