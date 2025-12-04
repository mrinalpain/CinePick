import React, { useState, useEffect } from 'react';
import { Film, Popcorn, RefreshCw, Star, Calendar, Settings, Key, Wifi, WifiOff, Tv, Eye, Check, History, X, Trash2 } from 'lucide-react';
import { localMovies, genres } from './data/movies';

export default function App() {
  const [step, setStep] = useState('genre-selection');
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [movie, setMovie] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showWatchedModal, setShowWatchedModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // New State for Watched Movies
  const [watchedMovies, setWatchedMovies] = useState([]);

  // Load API Key and Watched History from local storage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('tmdb_api_key');
    if (storedKey) setApiKey(storedKey);
    
    const storedWatched = JSON.parse(localStorage.getItem('cinepick_watched') || '[]');
    setWatchedMovies(storedWatched);
  }, []);

  const saveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('tmdb_api_key', key);
  };
  
  const toggleWatched = (movieTitle) => {
    const newWatched = watchedMovies.includes(movieTitle)
      ? watchedMovies.filter(t => t !== movieTitle)
      : [...watchedMovies, movieTitle];
    
    setWatchedMovies(newWatched);
    localStorage.setItem('cinepick_watched', JSON.stringify(newWatched));
  };

  const clearWatchedHistory = () => {
    if(window.confirm("Are you sure you want to clear your watched history?")) {
        setWatchedMovies([]);
        localStorage.removeItem('cinepick_watched');
    }
  };

  const fetchFromTMDB = async (genreId) => {
    try {
      const randomPage = Math.floor(Math.random() * 50) + 1; 
      
      const response = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${randomPage}`
      );
      
      if (!response.ok) throw new Error("Failed to fetch from TMDB. Check your API Key.");
      
      const data = await response.json();
      const results = data.results;
      
      if (!results || results.length === 0) throw new Error("No movies found.");
      
      const randomMovie = results[Math.floor(Math.random() * results.length)];
      
      return {
        title: randomMovie.title,
        genre: genres.find(g => g.id === genreId)?.name || "Movie",
        year: randomMovie.release_date ? randomMovie.release_date.split('-')[0] : "N/A",
        rating: randomMovie.vote_average ? randomMovie.vote_average.toFixed(1) : "N/A",
        description: randomMovie.overview,
        poster: randomMovie.poster_path ? `https://image.tmdb.org/t/p/w500${randomMovie.poster_path}` : null,
        isApi: true,
        type: "Movie"
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleGenreSelect = async (genre) => {
    setSelectedGenre(genre);
    setStep('picking');
    setLoading(true);
    setError(null);
    
    try {
      let selectedMovie;

      if (apiKey && apiKey.length > 20) {
        await new Promise(r => setTimeout(r, 800));
        selectedMovie = await fetchFromTMDB(genre.id);
      } else {
        await new Promise(r => setTimeout(r, 1500));
        const genreMovies = localMovies.filter(m => m.genre === genre.name);
        
        // Filter out watched movies locally if possible
        const unwatchedMovies = genreMovies.filter(m => !watchedMovies.includes(m.title));
        
        // Use unwatched pool if available, otherwise fall back to full genre pool
        const pool = unwatchedMovies.length > 0 ? unwatchedMovies : genreMovies;
        
        if (pool.length === 0) {
            // Should rarely happen unless genreMovies is empty
            selectedMovie = localMovies[Math.floor(Math.random() * localMovies.length)];
        } else {
            selectedMovie = pool[Math.floor(Math.random() * pool.length)];
        }
        selectedMovie = { ...selectedMovie, isApi: false };
      }
      
      setMovie(selectedMovie);
      setStep('result');
    } catch (err) {
      setError(err.message);
      setStep('genre-selection');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('genre-selection');
    setSelectedGenre(null);
    setMovie(null);
    setError(null);
  };

  // Helper to generate a nice gradient background for missing posters
  const getPosterFallback = (title, genreName) => {
    const genreColor = genres.find(g => g.name === genreName)?.color || "from-slate-700 to-slate-900";
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${genreColor} p-6 text-center relative overflow-hidden`}>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <Film className="w-16 h-16 text-white/20 mb-4 absolute top-4 right-4" />
        <h3 className="text-3xl font-black text-white leading-tight uppercase tracking-tighter relative z-10 drop-shadow-lg">
          {title}
        </h3>
        <div className="mt-4 px-3 py-1 bg-black/20 backdrop-blur-sm rounded-full text-xs font-mono text-white/80 border border-white/10 z-10">
            No Poster Available
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-rose-500 selection:text-white flex flex-col items-center relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-rose-900/20 via-slate-950 to-slate-950 pointer-events-none"></div>

      {/* Header */}
      <header className="w-full p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 text-rose-500 cursor-pointer" onClick={reset}>
          <Film className="w-6 h-6" />
          <h1 className="text-xl font-bold tracking-wider text-white">CINEPICK</h1>
        </div>
        
        <div className="flex items-center gap-3">
             <button 
                onClick={() => setShowWatchedModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all border border-transparent hover:border-slate-600"
                title="View Watched History"
            >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">History ({watchedMovies.length})</span>
            </button>

            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${apiKey ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              {apiKey ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {apiKey ? 'Online' : 'Offline'}
              <Settings className="w-3 h-3 ml-1" />
            </button>
        </div>
      </header>

      {/* Settings Modal (Inline) */}
      {showSettings && (
        <div className="w-full max-w-md bg-slate-900 border-y border-slate-800 p-6 animate-fade-in z-20 shadow-xl absolute top-20 right-4 sm:right-6 rounded-2xl border-x">
          <div className="flex items-start gap-3 mb-4">
            <Key className="w-5 h-5 text-rose-400 mt-1" />
            <div>
              <h3 className="font-bold text-white">Enable Live Data</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter a <a href="https://www.themoviedb.org/documentation/api" target="_blank" rel="noreferrer" className="text-rose-400 hover:underline">TMDB API Key</a> to fetch real movie data. 
                Without a key, the app uses a limited offline list.
              </p>
            </div>
          </div>
          <input 
            type="text" 
            placeholder="Enter TMDB API Key..." 
            value={apiKey}
            onChange={(e) => saveApiKey(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-rose-500 transition-colors font-mono text-slate-300"
          />
          <div className="flex justify-end mt-4">
             <button onClick={() => setShowSettings(false)} className="text-xs text-slate-400 hover:text-white">Close</button>
          </div>
        </div>
      )}

      {/* Watched History Modal */}
      {showWatchedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Eye className="w-5 h-5 text-rose-500" />
                            Watched History
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">Movies you've marked as seen.</p>
                    </div>
                    <button 
                        onClick={() => setShowWatchedModal(false)}
                        className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="overflow-y-auto p-4 space-y-3 bg-slate-950/50 flex-1 custom-scrollbar">
                    {watchedMovies.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                            <History className="w-16 h-16 mb-4 opacity-20" />
                            <p>No movies marked as watched yet.</p>
                            <button onClick={() => setShowWatchedModal(false)} className="mt-4 text-rose-400 hover:text-rose-300 text-sm">
                                Go find some movies!
                            </button>
                        </div>
                    ) : (
                        watchedMovies.map((title, index) => {
                            const localData = localMovies.find(m => m.title === title);
                            return (
                                <div key={`${title}-${index}`} className="flex items-center gap-4 bg-slate-900 p-3 rounded-xl border border-slate-800 group hover:border-slate-700 transition-colors">
                                    <div className="w-12 h-16 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                                        {localData?.poster ? (
                                            <img src={localData.poster} alt={title} className="w-full h-full object-cover" />
                                        ) : (
                                            <Film className="w-6 h-6 text-slate-700" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-white truncate">{title}</h4>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                            {localData ? (
                                                <>
                                                    <span>{localData.year}</span>
                                                    <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                                    <span>{localData.genre}</span>
                                                </>
                                            ) : (
                                                <span>External Source</span>
                                            )}
                                        </div>
                                    </div>
                                    <button 
                                            onClick={() => toggleWatched(title)}
                                            className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            title="Remove from history"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

                {watchedMovies.length > 0 && (
                    <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end">
                        <button 
                            onClick={clearWatchedHistory}
                            className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                        >
                            <Trash2 className="w-3 h-3" />
                            Clear History
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}

      <main className="w-full max-w-4xl flex-1 flex flex-col items-center justify-center p-4 relative z-0 min-h-[500px]">
        
        {error && (
            <div className="absolute top-0 bg-rose-500/10 border border-rose-500/50 text-rose-200 px-4 py-2 rounded-lg text-sm mb-6 animate-fade-in">
                Error: {error}
            </div>
        )}

        {/* Step 1: Genre Selection */}
        {step === 'genre-selection' && (
          <div className="text-center animate-fade-in w-full max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-white tracking-tight">
              Watch <span className="text-rose-500">Something</span>
            </h2>
            <p className="text-slate-400 mb-12 text-lg">
              {apiKey ? "Live database connected. " : "Offline mode. "} 
              Select a genre to get a recommendation.
            </p>
            
            <div className="flex flex-wrap justify-center gap-3">
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => handleGenreSelect(genre)}
                  className="group px-6 py-3 bg-slate-900 hover:bg-rose-600 rounded-full transition-all duration-300 border border-slate-800 hover:border-rose-500 flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                  <span className="font-medium group-hover:text-white text-slate-300">{genre.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Picking Animation */}
        {step === 'picking' && (
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-32 h-32 mb-8">
              <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
              <div className="absolute inset-0 border-t-4 border-rose-500 rounded-full animate-spin"></div>
              <Popcorn className="absolute inset-0 m-auto text-slate-700 w-12 h-12 animate-bounce" />
            </div>
            <h3 className="text-xl font-medium text-slate-300 animate-pulse">
              {apiKey ? `Scanning TMDB for ${selectedGenre.name}...` : `Searching Offline Archive for ${selectedGenre.name}...`}
            </h3>
          </div>
        )}

        {/* Step 3: Result */}
        {step === 'result' && movie && (
          <div className="w-full animate-slide-up flex flex-col md:flex-row bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 max-w-3xl">
            
            {/* Poster Section */}
            <div className={`w-full md:w-2/5 relative bg-slate-950 flex items-center justify-center overflow-hidden min-h-[350px] md:min-h-full group`}>
                {movie.poster ? (
                    <img 
                        src={movie.poster} 
                        alt={movie.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    getPosterFallback(movie.title, movie.genre)
                )}
                
                {/* Visual indicator on poster if watched */}
                {watchedMovies.includes(movie.title) && (
                    <div className="absolute top-4 left-4 bg-emerald-500/90 text-white p-2 rounded-full shadow-lg z-20 backdrop-blur-sm" title="Watched">
                        <Check className="w-6 h-6" />
                    </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent md:bg-gradient-to-r pointer-events-none"></div>
            </div>

            {/* Content Section */}
            <div className="flex-1 p-8 md:p-10 flex flex-col justify-center relative">
               {/* Background Grain/Texture */}
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-5 pointer-events-none"></div>

               <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-1 bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wider rounded">
                    {movie.genre}
                  </span>
                  {movie.type === 'Series' && (
                     <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider rounded flex items-center gap-1">
                        <Tv className="w-3 h-3" /> Series
                     </span>
                  )}
                  {movie.isApi && (
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider rounded flex items-center gap-1">
                        <Wifi className="w-3 h-3" /> Live
                      </span>
                  )}
               </div>

               <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                  {movie.title}
               </h2>

               <div className="flex items-center gap-6 text-sm text-slate-400 mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{movie.year}</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-bold text-white">{movie.rating}</span>
                    <span className="text-slate-600">/ 10</span>
                  </div>
               </div>

               <p className="text-slate-300 leading-relaxed mb-8 border-l-2 border-slate-700 pl-4 italic">
                  "{movie.description}"
               </p>

               <div className="flex gap-4 mt-auto">
                   <button 
                    onClick={() => {
                       const searchQuery = encodeURIComponent(`${movie.title} ${movie.year} trailer`);
                       window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
                    }}
                    className="flex-1 py-3 px-6 bg-white text-slate-950 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                  >
                    Watch Trailer
                  </button>
                  
                   {/* Watched Toggle Button */}
                   <button
                    onClick={() => toggleWatched(movie.title)}
                    className={`w-14 rounded-xl font-semibold flex items-center justify-center transition-colors border ${watchedMovies.includes(movie.title) ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700 hover:text-white'}`}
                    title={watchedMovies.includes(movie.title) ? "Mark as Unwatched" : "Mark as Watched"}
                  >
                    {watchedMovies.includes(movie.title) ? <Check className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>

                  <button 
                    onClick={reset}
                    className="w-14 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-700 transition-colors flex items-center justify-center group"
                    title="Pick Another"
                  >
                    <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                  </button>
               </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #0f172a; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #334155; 
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #475569; 
        }
      `}</style>
    </div>
  );
}