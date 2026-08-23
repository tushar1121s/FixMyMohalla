from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
import models  # models import karna zaroori hai taaki tables register hon

app = FastAPI(title="Society Maintenance Tracker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # deployment ke time tighten karenge
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup pe tables create ho jayengi Supabase mein (agar already nahi hain)
Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"status": "ok", "message": "Society Tracker API running"}