from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
import models
from routers import auth_routes,complaints, notices, dashboard





app = FastAPI(title="Society Maintenance Tracker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://fix-my-mohalla.vercel.app",
        "http://localhost:5173"
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_routes.router, prefix="/auth", tags=["auth"])
app.include_router(complaints.router, prefix="/complaints", tags=["complaints"])
app.include_router(notices.router, prefix="/notices", tags=["notices"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])



@app.get("/")
def root():
    return {"status": "ok", "message": "Society Tracker API running"}