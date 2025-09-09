from fastapi.testclient import TestClient
from app.main import app

def test_status_ok():
    c = TestClient(app)
    r = c.get("/status")
    assert r.status_code == 200
    b = r.json()
    for k in ["version","commit","buildTime","api"]:
        assert k in b
