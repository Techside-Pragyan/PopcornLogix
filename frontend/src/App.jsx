import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Film, Search } from 'lucide-react';
import { useState } from 'react';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import SearchResults from './pages/SearchResults';
import './index.css';

function Navbar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${query}`);
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Film color="#e50914" size={32} />
        PopcornLogix
      </Link>
      <form onSubmit={handleSearch} className="search-bar">
        <Search size={18} color="#a0a0a0" />
        <input 
          type="text" 
          placeholder="Search movies..." 
          className="search-input" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="container">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
