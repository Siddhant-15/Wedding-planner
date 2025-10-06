from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth
from app.routers.vendor import vendorrouter
from app.routers.service import servicerouter

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Wedding Planner API", version="1.0.0")


origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(vendorrouter)
app.include_router(servicerouter)
# app.include_router(appointment.router, prefix="/appointments", tags=["Appointments"])
# app.include_router(payment.router)
# app.include_router(review.router, prefix="/reviews", tags=["Reviews"])
# app.include_router(availability.router, prefix="/availability", tags=["Availability"])
# app.include_router(images.router, prefix="/images", tags=["Images"]) 
# app.include_router(service.router)
# app.include_router(testing.router)

@app.get("/")
def root():
    return {"message": "Wedding Planner API is running"}
