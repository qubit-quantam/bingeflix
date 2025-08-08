// Movies page JavaScript

// TMDB API key (reusing the one already in the codebase)
const apiKey = '7b4b8af2d885777c1c603011ee871be6';

// Global variables
let currentPage = 1;
let isLoading = false;
let allMovies = [];
let filteredMovies = [];
let observer;

// DOM elements
const movieGrid = document.getElementById('movieGrid');
const loadMoreBtn = document.getElementById('loadMoreBtn');
// Check if movieFilter exists before using it
const movieFilter = document.getElementById('movieFilter');

// Fetch movies from TMDB API
async function fetchMovies(page = 1) {
  try {
    isLoading = true;
    
    // Using the same endpoint as in the main script
    const response = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&page=${page}`);
    const data = await response.json();
    
    isLoading = false;
    return data.results;
  } catch (error) {
    console.error('Error fetching movies:', error);
    isLoading = false;
    return [];
  }
}

// Create movie card element
function createMovieCard(movie) {
  const card = document.createElement('div');
  card.className = 'movie-card';
  card.setAttribute('data-movie-id', movie.id);
  
  // Calculate the animation delay based on the position in the grid
  const delayIndex = document.querySelectorAll('.movie-card').length % 10;
  card.style.animationDelay = `${delayIndex * 0.05}s`;
  
  // Create poster image
  const posterPath = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'placeholder.jpg'; // Add a placeholder image if needed
  
  // Extract year from release date
  const releaseYear = movie.release_date ? movie.release_date.substring(0, 4) : 'N/A';
  
  // Set card HTML
  card.innerHTML = `
    <img 
      src="${posterPath}" 
      alt="${movie.title}" 
      class="movie-poster"
      loading="lazy"
    >
    <div class="movie-overlay">
      <div class="movie-title">${movie.title}</div>
      <div class="movie-year">${releaseYear}</div>
      <div class="movie-quality">HD</div>
    </div>
  `;
  
  // Add click event to redirect to movie details page
  card.addEventListener('click', () => {
    window.location.href = `../movie_details/movie_details.html?id=${movie.id}`;
  });
  
  return card;
}

// Display movies in the grid
function displayMovies(movies) {
  movies.forEach(movie => {
    const movieCard = createMovieCard(movie);
    movieGrid.appendChild(movieCard);
    
    // Initialize intersection observer for fade-in animation
    if (observer) {
      observer.observe(movieCard);
    }
  });
}

// Filter movies by title
function filterMovies(searchTerm) {
  if (!searchTerm.trim()) {
    filteredMovies = [...allMovies];
  } else {
    const term = searchTerm.toLowerCase();
    filteredMovies = allMovies.filter(movie => 
      movie.title.toLowerCase().includes(term)
    );
  }
  
  // Clear the grid and display filtered movies
  movieGrid.innerHTML = '';
  displayMovies(filteredMovies);
  
  // Show/hide load more button based on filter results
  if (filteredMovies.length < allMovies.length) {
    loadMoreBtn.style.display = 'none';
  } else {
    loadMoreBtn.style.display = 'block';
  }
}

// Load more movies
async function loadMoreMovies() {
  if (isLoading) return;
  
  // Show loading state
  loadMoreBtn.textContent = 'Loading...';
  loadMoreBtn.disabled = true;
  
  currentPage++;
  const newMovies = await fetchMovies(currentPage);
  
  if (newMovies && newMovies.length > 0) {
    allMovies = [...allMovies, ...newMovies];
    
    // If filter is active, update filtered movies
    if (movieFilter && movieFilter.value.trim()) {
      filterMovies(movieFilter.value);
    } else {
      displayMovies(newMovies);
    }
    
    // Reset button state
    loadMoreBtn.textContent = 'Load More';
    loadMoreBtn.disabled = false;
  } else {
    loadMoreBtn.textContent = 'No More Movies';
    loadMoreBtn.disabled = true;
  }
}

// Initialize page
async function initPage() {
  // Create intersection observer for lazy loading and animations
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const card = entry.target;
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
        observer.unobserve(card);
      }
    });
  }, {
    threshold: 0.1
  });
  
  // Initial movie load
  const initialMovies = await fetchMovies();
  allMovies = initialMovies;
  filteredMovies = initialMovies;
  displayMovies(initialMovies);
  
  // Event listeners
  loadMoreBtn.addEventListener('click', loadMoreMovies);
  
  // Only add filter event listener if the element exists
  if (movieFilter) {
    movieFilter.addEventListener('input', (e) => {
      filterMovies(e.target.value);
    });
  }
}

// Search function (for header search bar)
function searchMovies() {
  const query = document.getElementById('searchInput').value;
  if (query.length < 3) {
    alert("Please enter at least 3 characters for search.");
    return;
  }
  window.location.href = `../results/results.html?query=${encodeURIComponent(query)}`;
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', initPage); 