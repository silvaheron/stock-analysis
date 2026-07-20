import sys
import subprocess

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from utils import load_assets

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

    backend_operation = "scraper"

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

@app.post("/update_prices")
def run_update_prices():
    global backend_process, backend_operation

    if is_backend_running():
        raise HTTPException(
            status_code=409,
            detail=f"{backend_operation} is already running."
        )

    backend_operation = "update prices"

    backend_process = subprocess.Popen([
        sys.executable,
        "update_prices.py",
        "--stocks",
        "--reits",
    ])

    return {
        "status": "started",
        "operation": backend_operation
    }

@app.post("/analysis")
def run_analysis():
    global backend_process, backend_operation

    if is_backend_running():
        raise HTTPException(
            status_code=409,
            detail=f"{backend_operation} is already running."
        )

    backend_operation = "analysis"

    backend_process = subprocess.Popen([
        sys.executable,
        "analysis.py",
        "--stocks",
        "--reits",
        "--bazin", "--rate", "8",
        "--lynch",
        "--graham",
        "--greenblatt",
    ])

    return {
        "status": "started",
        "operation": backend_operation
    }

@app.get("/stocks")
def get_stocks():
    assets = load_assets("stocks")

    return [
        {
            "ticker": ticker,
            **data
        }
        for ticker, data in assets.items()
    ]

@app.get("/status")
def get_status():
    running = is_backend_running()

    return {
        "running": running,
        "operation": backend_operation if running else None
    }

@app.post("/cancel")
def cancel_operation():
    global backend_process, backend_operation

    if not is_backend_running():
        raise HTTPException(
            status_code=404,
            detail="No operation is currently running."
        )

    operation = backend_operation

    backend_process.terminate()

    try:
        backend_process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        backend_process.kill()
        backend_process.wait()

    backend_process = None
    backend_operation = None

    return {
        "status": "cancelled",
        "operation": operation
    }
