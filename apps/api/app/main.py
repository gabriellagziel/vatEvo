from fastapi import FastAPI
from fastapi.responses import JSONResponse
import os, time

app = FastAPI(title="Vatevo API", version=os.getenv("APP_VERSION", "0.1.0"))
START_TS = time.time()

def env(name, default=""):
    return os.getenv(name, default)

@app.get("/status", tags=["health"])
def status():
    return JSONResponse({
        "service": "vatevo-api",
        "env": env("APP_ENV", "production"),
        "version": env("APP_VERSION", "0.1.0"),
        "commit_sha": env("GIT_SHA", "unknown"),
        "build_time": env("BUILD_TIME", "unknown"),
        "uptime_seconds": int(time.time() - START_TS),
        "status": "ok",
    }, status_code=200)

@app.get("/", include_in_schema=False)
def root():
    return {"ok": True, "see": "/status"}

 
