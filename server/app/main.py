from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, venue, vendors, booking, payment, review, availability

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Wedding Planner API", version="1.0.0")


origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(venue.router, prefix="/venues", tags=["Venues"])
app.include_router(vendors.router, prefix="/vendors", tags=["Vendors"])
app.include_router(booking.router, prefix="/bookings", tags=["Bookings"])
app.include_router(payment.router, prefix="/payments", tags=["Payments"])
app.include_router(review.router, prefix="/reviews", tags=["Reviews"])
app.include_router(availability.router, prefix="/availability", tags=["Availability"])

@app.get("/")
def root():
    return {"message": "Wedding Planner API is running"}
