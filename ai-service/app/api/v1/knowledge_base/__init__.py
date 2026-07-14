from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get('/')
async def get_knowledge_base():
    return JSONResponse(status_code=501, content={'status': 'not_implemented', 'module': 'knowledge_base'})

