# CinePick 🎬

A sleek, modern movie recommendation app that helps you decide what to watch. Select a genre, and let CinePick suggest a movie or TV show for you!

## Features

✨ **Genre-Based Recommendations** — Browse by Action, Comedy, Drama, Sci-Fi, or Horror  
🌐 **Live & Offline Modes** — Connect to TMDB API for real movie data or use a curated offline library  
👁️ **Watched History** — Track movies you've marked as seen  
🎨 **Beautiful UI** — Modern dark theme with smooth animations and responsive design  
⚡ **Fast & Lightweight** — Built with React + Vite for optimal performance  
🎯 **Movie Details** — View ratings, release years, descriptions, and find trailers

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mrinalpain/CinePick.git
cd CinePick
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Configuration

### Enable Live Movie Data (Optional)

To unlock access to thousands of real movies, get a free API key from [The Movie Database (TMDB)](https://www.themoviedb.org/settings/api) and:

1. Click the **"Offline"** button in the top-right corner
2. Paste your TMDB API key into the input field
3. Start discovering real movies!

Without an API key, the app uses a curated offline library of popular films.

## Usage

1. **Select a Genre** — Choose from Action, Comedy, Drama, Sci-Fi, or Horror
2. **Get a Recommendation** — The app will suggest a random movie from that genre
3. **Mark as Watched** — Click the eye icon to track movies you've seen
4. **Find the Trailer** — Click "Watch Trailer" to search for it online
5. **Keep Discovering** — Click the refresh button for another recommendation

## Build for Production

```bash
npm run build
```

The optimized build will be output to the `dist/` directory.

## Tech Stack

- **React 19** — UI framework
- **Vite** — Lightning-fast build tool
- **Tailwind CSS 4** — Utility-first styling
- **Lucide React** — Beautiful SVG icons
- **TMDB API** — Movie data provider
- **ESLint** — Code quality

## Project Structure

```
src/
├── App.jsx          # Main app component
├── main.jsx         # Entry point
├── App.css          # App styles
├── index.css        # Global styles
├── assets/          # Static assets
└── data/
    └── movies.js    # Movie database & genres
```

## Contributing

Pull requests are welcome! Feel free to open issues or suggest improvements.

## License

This project is open source and available under the MIT License.

---

Made with ❤️ for movie lovers
