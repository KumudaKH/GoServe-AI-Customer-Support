from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth import router as auth_router
from app.routes.orders import router as orders_router
from app.routes.refunds import router as refunds_router
from app.routes.tickets import router as tickets_router
from app.routes.chat import router as chat_router
from app.routes.admin import router as admin_router
from app.routes.group_orders import router as group_router
from app.routes.profile import router as profile_router
from app.routes.products import router as products_router
from app.routes.coupons import router as coupons_router
from app.routes.delivery import router as delivery_router
from app.routes.location import router as location_router

app = FastAPI(
    title="Agentic Order Support System"
)

app.add_middleware(
    CORSMiddleware,
    # Allow common local dev origins (Vite / CRA / 127.0.0.1 variants)
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(orders_router)
app.include_router(refunds_router)
app.include_router(tickets_router)
app.include_router(chat_router)
app.include_router(admin_router)
app.include_router(group_router)
app.include_router(profile_router)
app.include_router(products_router)
app.include_router(coupons_router)
app.include_router(delivery_router)
app.include_router(location_router)


@app.get("/")
def home():
    return {"message": "Backend Running"}


@app.get("/health")
def health():
    return {"status": "healthy"}