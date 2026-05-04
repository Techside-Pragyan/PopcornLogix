# PopcornLogix - Movie Recommendation System

PopcornLogix is an end-to-end Movie Recommendation System built with modern web technologies and machine learning.

## Features

- **Hybrid Recommendation Engine**: Combines Content-Based Filtering (TF-IDF/Cosine Similarity) and Collaborative Filtering (SVD Matrix Factorization).
- **FastAPI Backend**: High-performance Python backend to serve movie data and compute similarities on-the-fly.
- **React Frontend**: Beautiful, modern UI with a dark theme, glassmorphism, and responsive design.
- **Search & Details**: Search for movies, view detailed info, and get customized recommendations.

## Tech Stack

- **Backend**: Python, FastAPI, Pandas, Scikit-Learn
- **Frontend**: React, Vite, Lucide-React, React Router
- **Dataset**: MovieLens (ml-latest-small)

## How to Run

1. **Start Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python main.py
   ```
   *Runs on http://localhost:8000*

2. **Start Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *Runs on http://localhost:5173*

## Model Training

To retrain the models with new data, run:
```bash
cd model
python train.py
```
This will generate the required `.pkl` and `.csv` artifacts in the `model/` directory.