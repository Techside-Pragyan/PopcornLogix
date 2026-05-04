import { useState, useEffect } from 'react';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import { TrendingUp } from 'lucide-react';

function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8000/movies/popular?limit=24')
      .then(res => {
        setMovies(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching movies:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="hero animate-fade-in">
        <h1>Find Your Next Favorite Movie</h1>
        <p>Discover personalized movie recommendations powered by advanced machine learning. Our hybrid engine analyzes your tastes to find hidden gems you'll love.</p>
      </div>

      <h2 className="section-title">
        <TrendingUp color="#e50914" /> 
        Popular Movies
      </h2>

      {loading ? (
        <div className="loader">Loading movies...</div>
      ) : (
        <div className="movie-grid">
          {movies.map(movie => (
            <MovieCard key={movie.movieId} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
