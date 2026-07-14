from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
router = APIRouter(tags=["health"])

from sqlalchemy import text
from app.core.database import get_db

@router.get("/health")
async def health(db=Depends(get_db)):
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "ok", "service": "ai-service"}
    except Exception as e:
        return JSONResponse(status_code=503, content={"status": "error", "service": "ai-service", "details": str(e)})
