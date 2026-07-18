import sys
import subprocess

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

backend_process = None
backend_operation = None


def is_backend_running():
    global backend_process, backend_operation

    if backend_process is None:
        return False

    if backend_process.poll() is None:
        return True

    # Process has finished
    backend_process = None
    backend_operation = None
    return False


@app.post("/scrape")
def run_scraper():
    global backend_process, backend_operation

    if is_backend_running():
        raise HTTPException(
            status_code=409,
            detail=f"{backend_operation} is already running."
        )

    backend_operation = "scraping"

    backend_process = subprocess.Popen([
        sys.executable,
        "scraper.py",
        "--stocks",
        "--reits",
    ])

    return {
        "status": "started",
        "operation": backend_operation
    }


@app.get("/status")
def get_status():
    running = is_backend_running()

    return {
        "running": running,
        "operation": backend_operation if running else None
    }
