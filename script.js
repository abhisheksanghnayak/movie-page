// API Configuration
const API_KEY = '581a2330';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const IMAGE_BASE_URL_LARGE = 'https://image.tmdb.org/t/p/w780';

// DOM Elements
const navButtons = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const backBtn = document.getElementById('back-btn');

// State
let currentPage = 'home';
let lastPage = 'home';

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadTrendingMovies();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Navigation
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.dataset.page;
            navigateToPage(page);
        });
    });

    // Search
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Back button
    backBtn.addEventListener('click', () => {
        navigateToPage(lastPage);
    });
}

// Navigation
function navigateToPage(page) {
    // Update active nav button
    navButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.page === page) {
            btn.classList.add('active');
        }
    });

    // Update active page
    pages.forEach(pageEl => {
        pageEl.classList.remove('active');
    });
    
    document.getElementById(`${page}-page`).classList.add('active');
    
    if (page !== 'movie-details') {
        lastPage = currentPage;
    }
    currentPage = page;

    // Update back button text
    if (page === 'movie-details') {
        backBtn.textContent = lastPage === 'search' ? '← Back to Search' : '← Back to Home';
    }
}

// API Functions
async function fetchFromAPI(endpoint) {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Load Trending Movies
async function loadTrendingMovies() {
    const loadingEl = document.getElementById('home-loading');
    const moviesContainer = document.getElementById('trending-movies');
    
    try {
        loadingEl.style.display = 'flex';
        moviesContainer.innerHTML = '';
        
        const data = await fetchFromAPI('/trending/movie/week');
        const movies = data.results.slice(0, 20); // Limit to 20 movies
        
        loadingEl.style.display = 'none';
        displayMovies(movies, moviesContainer);
    } catch (error) {
        loadingEl.style.display = 'none';
        showError(moviesContainer, 'Failed to load trending movies. Please try again later.');
    }
}

// Search Movies
async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) {
        alert('Please enter a movie title to search');
        return;
    }

    const loadingEl = document.getElementById('search-loading');
    const resultsContainer = document.getElementById('search-results');
    
    try {
        loadingEl.classList.remove('hidden');
        resultsContainer.innerHTML = '';
        
        const data = await fetchFromAPI(`/search/movie&query=${encodeURIComponent(query)}`);
        const movies = data.results;
        
        loadingEl.classList.add('hidden');
        
        if (movies.length === 0) {
            showNoResults(resultsContainer, query);
        } else {
            displayMovies(movies, resultsContainer);
        }
    } catch (error) {
        loadingEl.classList.add('hidden');
        showError(resultsContainer, 'Failed to search movies. Please try again later.');
    }
}

// Display Movies
function displayMovies(movies, container) {
    container.innerHTML = movies.map(movie => `
        <div class="movie-card" onclick="loadMovieDetails(${movie.id})">
            <img 
                class="movie-poster" 
                src="${movie.poster_path ? IMAGE_BASE_URL + movie.poster_path : '/placeholder.svg?height=350&width=250'}" 
                alt="${movie.title}"
                onerror="this.src='/placeholder.svg?height=350&width=250'"
            />
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <div class="movie-rating">
                    <span>⭐</span>
                    <span>${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Load Movie Details
async function loadMovieDetails(movieId) {
    const loadingEl = document.getElementById('details-loading');
    const detailsContainer = document.getElementById('movie-details-content');
    
    try {
        navigateToPage('movie-details');
        loadingEl.classList.remove('hidden');
        detailsContainer.innerHTML = '';
        
        const movie = await fetchFromAPI(`/movie/${movieId}`);
        
        loadingEl.classList.add('hidden');
        displayMovieDetails(movie, detailsContainer);
    } catch (error) {
        loadingEl.classList.add('hidden');
        showError(detailsContainer, 'Failed to load movie details. Please try again later.');
    }
}

// Display Movie Details
function displayMovieDetails(movie, container) {
    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown';
    const runtime = movie.runtime ? `${movie.runtime} min` : 'Unknown';
    const genres = movie.genres ? movie.genres.map(genre => genre.name) : [];
    
    container.innerHTML = `
        <img 
            class="movie-poster-large" 
            src="${movie.poster_path ? IMAGE_BASE_URL_LARGE + movie.poster_path : '/placeholder.svg?height=450&width=300'}" 
            alt="${movie.title}"
            onerror="this.src='/placeholder.svg?height=450&width=300'"
        />
        <div class="movie-info-detailed">
            <h1>${movie.title}</h1>
            <div class="movie-meta">
                <div class="meta-item">
                    <span>📅</span>
                    <span>${releaseYear}</span>
                </div>
                <div class="meta-item">
                    <span>⏱️</span>
                    <span>${runtime}</span>
                </div>
                <div class="meta-item rating-large">
                    <span>⭐</span>
                    <span>${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}/10</span>
                </div>
            </div>
            ${genres.length > 0 ? `
                <div class="genres">
                    ${genres.map(genre => `<span class="genre-tag">${genre}</span>`).join('')}
                </div>
            ` : ''}
            <div class="overview">
                <h3 style="margin-bottom: 15px; color: #4ecdc4;">Overview</h3>
                <p>${movie.overview || 'No overview available for this movie.'}</p>
            </div>
        </div>
    `;
}

// Error Handling
function showError(container, message) {
    container.innerHTML = `
        <div class="error-message">
            <h3>Oops! Something went wrong</h3>
            <p>${message}</p>
        </div>
    `;
}

function showNoResults(container, query) {
    container.innerHTML = `
        <div class="no-results">
            <h3>No movies found</h3>
            <p>We couldn't find any movies matching "${query}". Try searching with different keywords.</p>
        </div>
    `;
}

// Utility Functions
function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}
