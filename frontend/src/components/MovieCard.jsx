import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

function MovieCard({ movie }) {
  const fallbackImg = `https://placehold.co/300x450/2b303b/f5f5f5?text=${encodeURIComponent(movie.title)}`;
  const posterUrl = movie.imdbId && movie.imdbId !== '0000000' 
    ? `https://images.metahub.space/poster/medium/tt${movie.imdbId}/img`
    : fallbackImg;

  return (
    <Link to={`/movie/${movie.movieId}`} className="movie-card animate-fade-in">
      <img 
        src={posterUrl} 
        alt={movie.title} 
        style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover' }} 
        onError={(e) => { e.target.onerror = null; e.target.src = fallbackImg; }}
      />
      <div className="movie-info">
        <h3 className="movie-title">{movie.title}</h3>
        <div className="movie-genres">{movie.genres ? movie.genres.split('|').join(' • ') : ''}</div>
        {movie.similarity && (
          <div className="movie-score">
            <Star size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            {Math.round(movie.similarity * 100)}% Match
          </div>
        )}
      </div>
    </Link>
  );
}

export default MovieCard;
