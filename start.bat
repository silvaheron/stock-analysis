@echo off

start cmd /k "venv\Scripts\activate && uvicorn api:app --reload"
start cmd /k "npm run dev"

start chrome http://localhost:5173