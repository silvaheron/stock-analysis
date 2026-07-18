from fastapi import FastAPI
import subprocess

app = FastAPI()


@app.post("/scrape")
def run_scraper():
    subprocess.Popen(["python", "scraper.py"])

    return {
        "status": "started"
    }
