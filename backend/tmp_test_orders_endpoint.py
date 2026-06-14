from fastapi.testclient import TestClient
from app.main import app
from jose import jwt

SECRET_KEY = "mysecretkey123456789abcdefghijklmnopqrstuvwxyz"
ALGORITHM = "HS256"

payload = {"sub": "1", "role": "user"}
token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
client = TestClient(app)
response = client.get("/api/orders", headers={"Authorization": f"Bearer {token}"})
print('status_code=', response.status_code)
print('response_text=', response.text)
