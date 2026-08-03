@echo off
cd /d "d:\workflow API\backend"
call venv\Scripts\activate.bat
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
