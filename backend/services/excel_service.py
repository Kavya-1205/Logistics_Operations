import os
import pandas as pd
from typing import Optional, Dict, Any, List
from backend.utils.validation import validate_and_process_dataset

class DataManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DataManager, cls).__new__(cls)
            cls._instance._df = None
            cls._instance._summary = None
            cls._instance._filename = None
        return cls._instance

    def load_dataset(self, file_content: bytes, filename: str) -> Dict[str, Any]:
        valid, df, summary = validate_and_process_dataset(file_content, filename)
        if valid and df is not None:
            self._df = df
            self._summary = summary
            self._filename = filename
            print(f"[DataManager] User uploaded active dataset: {filename} ({len(df)} records)")
        return summary

    def get_summary(self) -> Optional[Dict[str, Any]]:
        return self._summary

    def get_raw_dataframe(self) -> Optional[pd.DataFrame]:
        return self._df

    def has_data(self) -> bool:
        return self._df is not None and not self._df.empty

    def get_filtered_data(
        self,
        year: Optional[int] = None,
        month: Optional[int] = None,
        facility: Optional[str] = None,
        shift: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> pd.DataFrame:
        if self._df is None or self._df.empty:
            return pd.DataFrame()
            
        df = self._df.copy()
        
        if year is not None:
            df = df[df["year"] == year]
        if month is not None:
            df = df[df["month"] == month]
        if facility and facility != "All":
            df = df[df["facility"].str.lower() == facility.lower()]
        if shift and shift != "All":
            df = df[df["shift"].str.lower() == shift.lower()]
        if start_date:
            df = df[df["date_str"] >= start_date]
        if end_date:
            df = df[df["date_str"] <= end_date]
            
        return df

    def get_aggregated_daily_data(
        self,
        year: Optional[int] = None,
        month: Optional[int] = None,
        facility: Optional[str] = None,
        shift: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> pd.DataFrame:
        df = self.get_filtered_data(
            year=year,
            month=month,
            facility=facility,
            shift=shift,
            start_date=start_date,
            end_date=end_date
        )
        if df.empty:
            return pd.DataFrame()
            
        grouped = df.groupby(["date_str"]).agg({
            "inbound_volume": "sum",
            "outbound_volume": "sum",
            "inventory_volume": "mean",
            "available_workers": "sum",
            "throughput": "sum"
        }).reset_index()
        
        grouped = grouped.sort_values(by="date_str").reset_index(drop=True)
        return grouped

    def get_all_data(self) -> pd.DataFrame:
        if self._df is not None:
            return self._df.copy()
        return pd.DataFrame()

data_manager = DataManager()
