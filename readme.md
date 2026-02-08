# SentimentAnalysisApp

A simple Flask web app that analyzes sentiment of text using TextBlob and returns polarity, subjectivity, and a sentiment label.

## Features
- Single text analysis
- Batch analysis
- In-memory history and basic stats
- JSON API endpoints

## Tech Stack
- Python
- Flask
- TextBlob

## Setup
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Run
```powershell
python app.py
```

## API
- `POST /analyze` with JSON `{ "text": "..." }`
- `GET /history`
- `POST /batch-analyze` with JSON `{ "texts": ["...", "..."] }`
- `GET /stats`

## Notes
- History is stored in memory and resets when the server restarts.