from fastapi import APIRouter, HTTPException
router = APIRouter()
@router.get('/')
async def knowledge_base():
    raise HTTPException(status_code=501, detail={'status': 'not_implemented', 'module': 'knowledge_base'})
