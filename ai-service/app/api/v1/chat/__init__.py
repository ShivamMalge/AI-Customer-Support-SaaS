from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get('/')
async def get_chat():
    return JSONResponse(status_code=501, content={'status': 'not_implemented', 'module': 'chat'})

