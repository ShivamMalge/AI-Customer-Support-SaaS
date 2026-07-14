import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
import os

# We mock the database dependency to avoid needing a real DB in this simple test
from app.core.database import get_db

async def override_get_db():
    class MockDb:
        async def execute(self, *args, **kwargs):
            return None
    yield MockDb()

app.dependency_overrides[get_db] = override_get_db

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok", "service": "ai-service"}
