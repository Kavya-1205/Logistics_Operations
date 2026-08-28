# 📦 UPS Logistics Operations Intelligence Platform

An end-to-end predictive operations intelligence and decision support platform designed to forecast package volume surges, optimize workforce staffing across shifts, and dynamically rebalance cross-dock resources in real-time.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.10+-blue?style=flat-square&logo=python)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![XGBoost](https://img.shields.io/badge/ML-XGBoost%20%7C%20Ridge-FF6600?style=flat-square)

---

## 🌟 Key Features

* 📊 **Executive Command Center (`/dashboard`):** Real-time hub health indicators, equipment availability, overall utilization metrics, downtime tracking, and live anomaly alerts.
* 📈 **Predictive ML Volume Forecasting (`/forecast`):** Dual-model forecasting engine (XGBoost + baseline Ridge) projecting 7-to-30 day volume with upper/lower 95% confidence bands and accuracy benchmarking.
* 👥 **Dynamic Workforce Planning (`/workforce`):** Shift-by-shift staffing deficit/surplus diagnostics (Morning, Evening, Night), absenteeism buffers, and overtime impact simulations.
* ⚡ **Resource Optimization & Rebalancing (`/optimization`):** Automated bottleneck detection across stations (Inbound, Sorting, Outbound, Staging) with step-by-step worker reallocation recommendations.
* 🎛️ **"What-If" Scenario Simulator:** Stress-test hub operations against volume surges (+10% to +50%) and worker shortages in real time.
* 📁 **Smart Spreadsheet Ingestion (`/upload`):** Ingests arbitrary `.xlsx` or `.csv` files with automatic column schema mapping, validation, and multi-sheet support.

---

## 🏗️ System Architecture

```text
Logistics_Operations/
├── backend/
│   ├── data/                   # Scenario datasets & sample data (.xlsx)
│   ├── routes/                 # FastAPI API route controllers
│   │   ├── upload.py           # File ingestion & schema validation
│   │   ├── dashboard.py        # Executive KPI aggregator
│   │   ├── forecast.py         # ML volume forecasting endpoint
│   │   ├── workforce.py        # Capacity & shift gap analysis
│   │   └── optimization.py     # Rebalancing & alert generation
│   ├── schemas/                # Pydantic models & request definitions
│   ├── services/               # Core intelligence business logic
│   │   ├── excel_service.py    # In-memory dataset manager & cache
│   │   ├── forecasting.py      # Feature engineering & ML training
│   │   ├── kpi_service.py      # Statistical aggregation & trendlines
│   │   ├── optimization.py     # Bottleneck solver & reallocation engine
│   │   └── workforce.py        # Algorithmic staffing formula engine
│   ├── utils/                  # Dataset validation & header normalizer
│   ├── requirements.txt        # Python backend dependencies
│   └── main.py                 # FastAPI application entrypoint
├── frontend/
│   ├── app/                    # Next.js App Router (Pages & Layout)
│   │   ├── dashboard/          # Executive KPI Command Center
│   │   ├── forecast/           # ML Volume Forecaster
│   │   ├── optimization/       # Resource Rebalancing Advisor
│   │   ├── upload/             # Drag-and-drop Spreadsheet Ingestor
│   │   └── workforce/          # Capacity Planner
│   ├── components/             # Reusable navigation & layout components
│   ├── lib/                    # API client layer & fallback algorithms
│   ├── types/                  # TypeScript data contracts & schemas
│   └── package.json            # Frontend dependencies
├── start_all.bat               # One-click dual server launcher
├── run_backend.bat             # Dedicated backend launcher
└── run_frontend.bat            # Dedicated frontend launcher
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Python 3.10+**
* **Node.js 18+** & `npm`

### 1. One-Click Start (Windows)
Double-click `start_all.bat` or run:
```bat
start_all.bat
```
This automatically launches both the FastAPI backend on port `8000` and the Next.js frontend on port `3000`.

---

### 2. Manual Setup

#### Backend Setup
```bash
# Navigate to project root
python -m venv venv
venv\Scripts\activate      # Windows (or source venv/bin/activate on Linux/Mac)

pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
* Backend API: `http://localhost:8000`
* Interactive Swagger Docs: `http://localhost:8000/docs`

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
* Web Application: `http://localhost:3000`

---

## 🔬 Machine Learning & Algorithmic Logic

### 1. Volume Forecasting Model
* **Algorithm:** Multi-variable XGBoost Regressor with 7-day volume lags, 3-day rolling means, shift indicators, and calendar feature vectors.
* **Confidence Envelopes:** Quantile regression and standard error residual mapping.

### 2. Workforce Staffing Formula
$$\text{Required Workers} = \left\lceil \frac{\text{Projected Volume} + \text{Backlog Clearance Target}}{\text{Worker Hourly Capacity} \times \text{Shift Hours} \times (1 - \text{Absenteeism Rate})} \right\rceil$$

### 3. Resource Rebalancing Solver
* Detects station utilization ($\text{Utilization} > 95\% \implies \text{Bottleneck}$, $\text{Utilization} < 70\% \implies \text{Surplus}$).
* Uses a greedy minimal-disruption transfer algorithm to balance line capacities.

---

## 📜 License
This project is licensed under the MIT License.
