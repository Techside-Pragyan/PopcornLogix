import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import { Play, Plus, ThumbsUp } from 'lucide-react';

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('hybrid');

  useEffect(() => {
    setLoading(true);
    // Fetch movie details
    axios.get(`http://localhost:8000/movies/${id}`)
      .then(res => {
        setMovie(res.data);
      })
      .catch(err => console.error(err));

    // Fetch recommendations
    fetchRecommendations('hybrid');
  }, [id]);

  const fetchRecommendations = (selectedMethod) => {
    setMethod(selectedMethod);
    axios.get(`http://localhost:8000/recommendations/${id}?method=${selectedMethod}&limit=12`)
      .then(res => {
        setRecommendations(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  if (!movie) return <div className="loader">Loading...</div>;

  const fallbackImg = `https://placehold.co/600x900/2b303b/f5f5f5?text=${encodeURIComponent(movie.title)}`;
  const posterUrl = movie.imdbId && movie.imdbId !== '0000000' 
    ? `https://images.metahub.space/poster/large/tt${movie.imdbId}/img`
    : fallbackImg;

  return (
    <div className="animate-fade-in">
      <div className="movie-details-container">
        <img 
          src={posterUrl} 
          alt={movie.title} 
          className="details-poster" 
          onError={(e) => { e.target.onerror = null; e.target.src = fallbackImg; }}
        />
        
        <div className="details-content">
          <h1 className="details-title">{movie.title}</h1>
          
          <div className="details-genres">
            {movie.genres && movie.genres.split('|').map(genre => (
              <span key={genre} className="genre-tag">{genre}</span>
            ))}
          </div>
          
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '18px', marginBottom: '30px' }}>
            Experience this amazing title hand-picked by our recommendation engine. 
            Discover related movies based on content similarity, collaborative filtering, or a hybrid approach below.
          </p>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
            <button className="btn">
              <Play fill="white" size={20} /> Watch Trailer
            </button>
            <button className="btn" style={{ background: 'var(--accent)' }}>
              <Plus size={20} /> Add to Watchlist
            </button>
            <button className="btn" style={{ background: 'var(--accent)' }}>
              <ThumbsUp size={20} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '60px' }}>
        <div className="section-title">Recommended Movies</div>
        
        <div className="tabs">
          <div 
            className={`tab ${method === 'hybrid' ? 'active' : ''}`}
            onClick={() => fetchRecommendations('hybrid')}
          >
            Hybrid Engine
          </div>
          <div 
            className={`tab ${method === 'content' ? 'active' : ''}`}
            onClick={() => fetchRecommendations('content')}
          >
            Content-Based
          </div>
          <div 
            className={`tab ${method === 'collab' ? 'active' : ''}`}
            onClick={() => fetchRecommendations('collab')}
          >
            Collaborative
          </div>
        </div>

        {loading ? (
          <div className="loader">Analyzing preferences...</div>
        ) : (
          <div className="movie-grid">
            {recommendations.map(movie => (
              <MovieCard key={movie.movieId} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieDetails;
