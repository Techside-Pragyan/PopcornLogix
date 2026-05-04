import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import { Search } from 'lucide-react';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      setLoading(true);
      axios.get(`http://localhost:8000/movies/search?q=${encodeURIComponent(query)}&limit=24`)
        .then(res => {
          setMovies(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [query]);

  return (
    <div>
      <h2 className="section-title">
        <Search color="#e50914" /> 
        Search Results for "{query}"
      </h2>

      {loading ? (
        <div className="loader">Searching movies...</div>
      ) : movies.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-muted)' }}>
          No movies found matching your search.
        </div>
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

export default SearchResults;
