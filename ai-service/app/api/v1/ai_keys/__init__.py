from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get('/')
async def get_ai_keys():
    return JSONResponse(status_code=501, content={'status': 'not_implemented', 'module': 'ai_keys'})

