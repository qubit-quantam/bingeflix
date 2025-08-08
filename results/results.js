// Function to parse URL parameters
function getQueryVariable(variable) {
  const query = window.location.search.substring(1);
  const vars = query.split("&");
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split("=");
    if (pair[0] === variable) {
      return decodeURIComponent(pair[1]);
    }
  }
  return null;
}

// Modified searchMovies function now checks for a query parameter,
// and if not provided, it gets the value from the search input.
async function searchMovies(query) {
  if (!query) {
    query = document.getElementById('searchInput').value;
  }
  if (query.length < 3) {
    alert("Please enter at least 3 characters for search.");
    return;
  }
  
  // Optionally, update the URL query parameter without reloading:
  // window.history.replaceState(null, '', `?query=${encodeURIComponent(query)}`);

  const apiKey = '7b4b8af2d885777c1c603011ee871be6';
  const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    displayResults(data.results);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function displayResults(results) {
  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = '';

  if (!results || results.length === 0) {
    resultsContainer.innerHTML = '<p>No results found.</p>';
    return;
  }

  results.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.classList.add('item');
    itemElement.style.position = 'relative';

    // Determine media type
    const mediaType = item.media_type === 'movie' ? 'Movie' : 'TV Series';

    // Create a transparent box to indicate the media type
    const mediaTypeBox = document.createElement('div');
    mediaTypeBox.classList.add('media-type-box');
    mediaTypeBox.textContent = mediaType;
    itemElement.appendChild(mediaTypeBox);

    // Poster
    const posterPath = item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : 'https://via.placeholder.com/200x300?text=No+Poster+Available';
    const imgElement = document.createElement('img');
    imgElement.src = posterPath;
    imgElement.alt = item.title || item.name;
    imgElement.addEventListener('click', () => {
      handlePosterClick(item.media_type, item.id);
    });
    itemElement.appendChild(imgElement);

    // Rating
    const ratingElement = document.createElement('div');
    ratingElement.classList.add('tmdb-rating');
    ratingElement.textContent = `${item.vote_average.toFixed(1)} ${getRatingStars(item.vote_average)}`;
    ratingElement.style.position = 'absolute';
    ratingElement.style.top = '20px';
    ratingElement.style.left = '0';
    ratingElement.style.padding = '5px 10px';
    itemElement.appendChild(ratingElement);

    // Title and Release Year
    const h2Element = document.createElement('h2');
    h2Element.textContent = `${item.title || item.name} (${getReleaseDate(item)})`;
    itemElement.appendChild(h2Element);

    resultsContainer.appendChild(itemElement);
  });
}

function handlePosterClick(mediaType, mediaId) {
  if (mediaType === 'movie') {
    window.location.href = `../movie_details/movie_details.html?type=movie&id=${mediaId}`;
  } else if (mediaType === 'tv') {
    window.location.href = `../series_details/series_details.html?type=tv&id=${mediaId}`;
  } else {
    console.error('Unknown media type');
  }
}

function getReleaseDate(item) {
  let releaseDate;
  if (item.media_type === 'movie') {
    releaseDate = item.release_date;
  } else if (item.media_type === 'tv') {
    releaseDate = item.first_air_date;
  }
  if (releaseDate) {
    const date = new Date(releaseDate);
    return date.getFullYear();
  } else {
    return 'N/A';
  }
}

function getRatingStars(rating) {
  const roundedRating = Math.round(rating / 2); // Convert rating (0-10) to a 5-star scale
  const stars = '★'.repeat(roundedRating);
  return stars;
}

// On page load, check for a 'query' parameter and perform a search if present.
const queryParam = getQueryVariable('query');
if (queryParam) {
  document.getElementById('searchInput').value = queryParam;
  searchMovies(queryParam);
} else {
  document.getElementById('results').innerHTML = '<p>No results found.</p>';
}
