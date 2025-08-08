// TV Shows page JavaScript

// TMDB API key (reusing the one already in the codebase)
const apiKey = '7b4b8af2d885777c1c603011ee871be6';

// Global variables
let currentPage = 1;
let isLoading = false;
let allTVShows = [];
let observer;

// DOM elements
const tvShowGrid = document.getElementById('tvShowGrid');
const loadMoreBtn = document.getElementById('loadMoreBtn');

// Fetch TV shows from TMDB API
async function fetchTVShows(page = 1) {
  try {
    isLoading = true;
    showLoading(true);
    
    // Using the trending TV shows endpoint instead of popular
    const response = await fetch(`https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}&page=${page}`);
    const data = await response.json();
    
    isLoading = false;
    showLoading(false);
    return data.results;
  } catch (error) {
    console.error('Error fetching TV shows:', error);
    isLoading = false;
    showLoading(false);
    return [];
  }
}

// Show/hide loading indicator
function showLoading(show) {
  const existingIndicator = document.querySelector('.loading-indicator');
  
  if (show) {
    if (!existingIndicator) {
      const loadingIndicator = document.createElement('div');
      loadingIndicator.className = 'loading-indicator';
      loadingIndicator.innerHTML = '<div class="loading-spinner"></div>';
      
      const container = document.querySelector('.tv-show-grid-container');
      container.insertBefore(loadingIndicator, loadMoreBtn.parentElement);
    }
  } else {
    if (existingIndicator) {
      existingIndicator.remove();
    }
  }
}

// Create TV show card element
function createTVShowCard(tvShow) {
  const card = document.createElement('div');
  card.className = 'tv-show-card';
  card.setAttribute('data-tv-id', tvShow.id);
  
  // Calculate the animation delay based on the position in the grid
  const delayIndex = document.querySelectorAll('.tv-show-card').length % 10;
  card.style.animationDelay = `${delayIndex * 0.05}s`;
  
  // Create poster image
  const posterPath = tvShow.poster_path 
    ? `https://image.tmdb.org/t/p/w500${tvShow.poster_path}`
    : '../images/placeholder.jpg'; // Add a placeholder image if needed
  
  // Extract year from first air date
  const firstAirYear = tvShow.first_air_date ? tvShow.first_air_date.substring(0, 4) : 'N/A';
  
  // Format rating
  const rating = tvShow.vote_average ? tvShow.vote_average.toFixed(1) : 'N/A';
  
  // Set card HTML
  card.innerHTML = `
    <img 
      src="${posterPath}" 
      alt="${tvShow.name}" 
      class="tv-show-poster"
      loading="lazy"
    >
    <div class="tv-show-info">
      <div class="tv-show-title">${tvShow.name}</div>
      <div class="tv-show-year">${firstAirYear}</div>
      <div class="tv-show-rating">${rating}</div>
    </div>
  `;
  
  // Add click event to redirect to TV show details page
  card.addEventListener('click', () => {
    window.location.href = `../series_details/series_details.html?id=${tvShow.id}`;
  });
  
  return card;
}

// Display TV shows in the grid
function displayTVShows(tvShows) {
  tvShows.forEach(tvShow => {
    const tvShowCard = createTVShowCard(tvShow);
    tvShowGrid.appendChild(tvShowCard);
    
    // Initialize intersection observer for fade-in animation
    if (observer) {
      observer.observe(tvShowCard);
    }
  });
}

// Load more TV shows
async function loadMoreTVShows() {
  if (isLoading) return;
  
  currentPage++;
  const newTVShows = await fetchTVShows(currentPage);
  
  if (newTVShows.length > 0) {
    allTVShows = [...allTVShows, ...newTVShows];
    displayTVShows(newTVShows);
  } else {
    loadMoreBtn.textContent = 'No More TV Shows';
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
  
  // Initial TV show load
  const initialTVShows = await fetchTVShows();
  allTVShows = initialTVShows;
  displayTVShows(initialTVShows);
  
  // Event listeners
  loadMoreBtn.addEventListener('click', loadMoreTVShows);
}

// Search function (for header search bar)
function searchMovies() {
  const query = document.getElementById('searchInput').value;
  if (query.trim() !== '') {
    window.location.href = `../results/results.html?query=${encodeURIComponent(query)}`;
  }
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', initPage); 