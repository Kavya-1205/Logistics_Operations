import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import upload, dashboard, forecast, workforce, optimization

app = FastAPI(
    title="UPS Logistics Operations Intelligence API",
    description="Predictive operations intelligence platform for forecasting, workforce planning, and resource optimization.",
    version="1.0.0"
)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(upload.router)
app.include_router(dashboard.router)
app.include_router(forecast.router)
app.include_router(workforce.router)
app.include_router(optimization.router)

@app.get("/")
def root():
    return {
        "service": "UPS Logistics Operations Intelligence API",
        "status": "online",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": "2026-08-28T10:43:00Z"
    }

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
