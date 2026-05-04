import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import TruncatedSVD
import pickle
import os

print("Loading datasets...")
data_dir = '../data/ml-latest-small'
movies = pd.read_csv(f'{data_dir}/movies.csv')
ratings = pd.read_csv(f'{data_dir}/ratings.csv')
tags = pd.read_csv(f'{data_dir}/tags.csv')
links = pd.read_csv(f'{data_dir}/links.csv')

# --- Content-Based Filtering ---
print("Preparing content-based features...")
# Process genres: replace | with space
movies['genres_str'] = movies['genres'].str.replace('|', ' ')

# Group tags by movieId
tags_grouped = tags.groupby('movieId')['tag'].apply(lambda x: ' '.join(x)).reset_index()

# Merge movies and tags
movies_content = pd.merge(movies, tags_grouped, on='movieId', how='left')
movies_content['tag'] = movies_content['tag'].fillna('')

# Combine genres and tags into a single 'content' column
movies_content['content'] = movies_content['genres_str'] + ' ' + movies_content['tag']

# TF-IDF Vectorization
print("Calculating TF-IDF and content similarity...")
tfidf = TfidfVectorizer(stop_words='english')
tfidf_matrix = tfidf.fit_transform(movies_content['content'])

# Compute cosine similarity for content
content_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

# --- Collaborative Filtering ---
print("Preparing collaborative filtering features...")
# Create user-item matrix
user_item_matrix = ratings.pivot(index='userId', columns='movieId', values='rating').fillna(0)

# We want item-item similarity based on user ratings. 
# Transpose the matrix so rows are movies and columns are users
item_user_matrix = user_item_matrix.T

print("Calculating collaborative filtering similarity using SVD...")
# Use TruncatedSVD to reduce dimensionality and denoise
svd = TruncatedSVD(n_components=50, random_state=42)
item_factors = svd.fit_transform(item_user_matrix)

# Compute cosine similarity for collaborative filtering
collab_sim = cosine_similarity(item_factors, item_factors)

# Ensure the dimensions match the movies dataframe
# Some movies might not have ratings. Let's filter movies_content to match the item_user_matrix,
# or create a mapping from movieId to matrix index.

# Let's map movies in our matrices
# content_sim has dimensions (num_movies_in_movies_csv, num_movies_in_movies_csv)
# collab_sim has dimensions (num_movies_in_ratings_csv, num_movies_in_ratings_csv)

# To make things uniform, let's keep only movies that are in BOTH or use a unified index
# The easiest way is to build the matrices based on a single unified list of movies.

# Let's rewrite the logic for uniform indices.
print("Unifying indices...")
unified_movies = movies.copy()

# Add a unified index column
unified_movies['matrix_idx'] = range(len(unified_movies))

# Re-compute content
unified_movies['genres_str'] = unified_movies['genres'].str.replace('|', ' ')
unified_movies_content = pd.merge(unified_movies, tags_grouped, on='movieId', how='left')
unified_movies_content['tag'] = unified_movies_content['tag'].fillna('')
unified_movies_content['content'] = unified_movies_content['genres_str'] + ' ' + unified_movies_content['tag']

tfidf_matrix = tfidf.fit_transform(unified_movies_content['content'])
# Instead of a full NxN matrix which is large, let's save the tfidf_matrix or compute on the fly, 
# or just save the similarity matrix if it's small enough. (9742x9742 float32 is ~380MB, which is a bit large).
# Let's just save the TF-IDF matrix and SVD factors, and compute cosine similarity on the fly in the backend to save memory/disk space.
# 9742 * 9742 * 4 bytes = 380MB. Not too bad for a backend, but saving tfidf_matrix (sparse) and item_factors is smaller.

# For Collaborative:
# We need to ensure item_user_matrix has rows corresponding EXACTLY to unified_movies['movieId']
item_user_matrix_aligned = pd.DataFrame(index=unified_movies['movieId'])
# Merge the actual ratings
item_user_matrix_aligned = item_user_matrix_aligned.join(item_user_matrix).fillna(0)

print("Calculating aligned collaborative features...")
item_factors_aligned = svd.fit_transform(item_user_matrix_aligned)

print("Saving models and data...")
# Save everything needed for the backend
with open('tfidf_vectorizer.pkl', 'wb') as f:
    pickle.dump(tfidf, f)
    
with open('tfidf_matrix.pkl', 'wb') as f:
    pickle.dump(tfidf_matrix, f)

with open('item_factors_collab.pkl', 'wb') as f:
    pickle.dump(item_factors_aligned, f)

# Merge links to get imdbId
unified_movies = pd.merge(unified_movies, links[['movieId', 'imdbId']], on='movieId', how='left')
# Format imdbId to have 7 digits with leading zeros
unified_movies['imdbId'] = unified_movies['imdbId'].fillna(0).astype(int).astype(str).str.zfill(7)
unified_movies[['movieId', 'title', 'genres', 'imdbId']].to_csv('movies_processed.csv', index=False)

print("Training complete! Models saved in model/")
