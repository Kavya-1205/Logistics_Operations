from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.services.excel_service import data_manager

router = APIRouter(prefix="/api", tags=["Upload & Dataset"])

@router.post("/upload")
async def upload_operations_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")
    
    # Read file content
    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read upload stream: {str(e)}")
        
    summary = data_manager.load_dataset(content, file.filename)
    
    if not summary.get("valid", False):
        return {
            "status": "error",
            "message": "Dataset validation failed.",
            "errors": summary.get("errors", ["Unknown validation error"]),
            "summary": summary
        }
        
    return {
        "status": "success",
        "message": f"Successfully loaded and validated {summary['total_records']:,} records from '{file.filename}'.",
        "summary": summary
    }

@router.get("/dataset-info")
async def get_dataset_info():
    summary = data_manager.get_summary()
    if not summary:
        return {
            "status": "no_data",
            "message": "No dataset currently loaded in system.",
            "summary": None
        }
    return {
        "status": "success",
        "summary": summary
    }
