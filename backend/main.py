from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import pickle
from sklearn.metrics.pairwise import cosine_similarity
import os

app = FastAPI(title="Movie Recommendation System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Models and Data
MODEL_DIR = '../model'
print("Loading models and data into memory...")

movies_df = pd.read_csv(f'{MODEL_DIR}/movies_processed.csv')

with open(f'{MODEL_DIR}/tfidf_matrix.pkl', 'rb') as f:
    tfidf_matrix = pickle.load(f)

with open(f'{MODEL_DIR}/item_factors_collab.pkl', 'rb') as f:
    item_factors_collab = pickle.load(f)

print("Loaded successfully!")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Movie Recommendation System API"}

@app.get("/movies/search")
def search_movies(q: str = Query(..., min_length=2), limit: int = 20):
    results = movies_df[movies_df['title'].str.contains(q, case=False, na=False)].head(limit)
    return results.to_dict(orient="records")

@app.get("/movies/popular")
def get_popular_movies(limit: int = 20):
    # Just returning the first N as popular (or we could sort by some rating logic)
    return movies_df.head(limit).to_dict(orient="records")

@app.get("/movies/{movie_id}")
def get_movie_details(movie_id: int):
    movie = movies_df[movies_df['movieId'] == movie_id]
    if movie.empty:
        raise HTTPException(status_code=404, detail="Movie not found")
    return movie.iloc[0].to_dict()

@app.get("/recommendations/{movie_id}")
def get_recommendations(movie_id: int, method: str = 'hybrid', limit: int = 10):
    """
    method: 'content', 'collab', or 'hybrid'
    """
    if movie_id not in movies_df['movieId'].values:
        raise HTTPException(status_code=404, detail="Movie not found")
    
    idx = movies_df[movies_df['movieId'] == movie_id].index[0]
    
    if method == 'content' or method == 'hybrid':
        content_sim = cosine_similarity(tfidf_matrix[idx:idx+1], tfidf_matrix).flatten()
    
    if method == 'collab' or method == 'hybrid':
        collab_sim = cosine_similarity(item_factors_collab[idx:idx+1], item_factors_collab).flatten()
        
    if method == 'hybrid':
        sim_scores = (content_sim + collab_sim) / 2.0
    elif method == 'content':
        sim_scores = content_sim
    elif method == 'collab':
        sim_scores = collab_sim
    else:
        raise HTTPException(status_code=400, detail="Invalid method. Use 'content', 'collab', or 'hybrid'.")
        
    # Get top N indices (excluding itself)
    # Get top limit + 1 indices just in case it includes itself
    sim_indices = sim_scores.argsort()[::-1]
    
    # Filter out the movie itself
    sim_indices = [i for i in sim_indices if i != idx][:limit]
    
    recommended_movies = movies_df.iloc[sim_indices].copy()
    recommended_movies['similarity'] = sim_scores[sim_indices].round(4)
    
    return recommended_movies.to_dict(orient="records")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
