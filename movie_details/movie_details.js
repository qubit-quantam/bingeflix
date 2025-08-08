// Global variables for IMDb ID and embed URLs
let imdbId;
let embedSources = [];

// Global flag (unused since trailer is removed) and auto-switch timer
let isPreviewActive = false;
let autoSwitchTimer = null;

// Helper: Get URL parameter by name
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Helper: Switch the embed source by updating the movie iframe's src
function switchEmbed(embedUrl) {
  console.log("Switching embed to:", embedUrl);
  const iframe = document.getElementById('movieIframe');
  iframe.src = embedUrl;
}

// Fetch external IDs for the movie (to get IMDb ID) and then build the embedSources array
async function getAndEmbed() {
  const movieId = getParameterByName('id'); // TMDB movie ID from URL
  const externalApiKey = '7b4b8af2d885777c1c603011ee871be6';
  const extidsUrl = `https://api.themoviedb.org/3/movie/${movieId}/external_ids?api_key=${externalApiKey}`;
  try {
    const response = await fetch(extidsUrl);
    const data = await response.json();
    imdbId = data.imdb_id;
    console.log("Fetched IMDb ID:", imdbId);
    
    // Build and update the embed sources for movie
    updateEmbedSources();
  } catch (error) {
    console.error("Error fetching external IDs:", error);
  }
}

// Build the embedSources array (total of 8 endpoints)
// New server order:
// 1: Vidlink.pro (default)
// 2: embed.su
// 3: 2embed.stream
// 4: 2embed.cc
// 5: Videasy
// 6: Autoembed.cc
// 7: MoviesAPI.club
// 8: RGShows API v1
function updateEmbedSources() {
  const movieId = getParameterByName('id'); // TMDB movie ID
  if (!movieId || !imdbId) return;
  
  // Construct embed URLs using appropriate ID types:
  // Note: Vidlink.pro and embed.su use TMDB ID,
  // while 2embed.stream and 2embed.cc use IMDb ID.
  const server1Url = `https://vidlink.pro/movie/${movieId}`;
  const server2Url = `https://embed.su/embed/movie/${movieId}`;
  const server3Url = `https://www.2embed.stream/embed/movie/${imdbId}`;
  const server4Url = `https://www.2embed.cc/embed/movie/${imdbId}`;
  const server5Url = `https://player.videasy.net/embed/movie/${movieId}?autoplay=true`;
  const server6Url = `https://player.autoembed.cc/embed/movie/${movieId}`;
  const server7Url = `https://moviesapi.club/movie/${movieId}`;
  const server8Url = `https://watch.streamflix.one/movie/${movieId}/watch?server=2`;
  
  embedSources = [
    server1Url, // Vidlink.pro (default)
    server2Url, // embed.su
    server3Url, // 2embed.stream
    server4Url, // 2embed.cc
    server5Url, // Videasy
    server6Url, // Autoembed.cc
    server7Url, // MoviesAPI.club
    server8Url  // RGShows API v1
  ];
  
  console.log("Updated embed sources:", embedSources);
  
  // Immediately load the default embed (Vidlink.pro)
  if (!isPreviewActive && embedSources.length > 0) {
    switchEmbed(embedSources[0]);
  }
}

document.addEventListener("DOMContentLoaded", function() {
  // Get movie details and update UI elements
  const movieId = getParameterByName('id'); // TMDB movie ID
  const tmdbApiKey = '68e094699525b18a70bab2f86b1fa706';
  const movieDetailsUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${tmdbApiKey}`;
  const castUrl = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${tmdbApiKey}`;
  
  // Fetch and display movie details (poster, title, description)
  fetch(movieDetailsUrl)
    .then(response => response.json())
    .then(data => {
      const poster = document.getElementById('poster');
      const title = document.getElementById('title');
      const description = document.getElementById('description');
      
      poster.src = `https://image.tmdb.org/t/p/w780${data.backdrop_path}`;
      title.textContent = data.title;
      description.textContent = data.overview;
      
      // Fetch and display cast details
      fetchCastDetails(castUrl);
      
      // Get external IDs and update embed sources
      getAndEmbed();
    })
    .catch(error => console.error('Error fetching movie details:', error));
  
  // Function: Fetch and display cast details
  function fetchCastDetails(url) {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const castList = document.getElementById('castList');
        data.cast.slice(0, 5).forEach(actor => {
          const listItem = document.createElement('div');
          listItem.style.cssText = 'width: fit-content; display: flex; flex-direction: column; padding-right: 20px; font-family: Poppins; font-size: 1vw;';
          
          const actorName = document.createElement('span');
          const actorImage = document.createElement('img');
          actorName.textContent = actor.name;
          actorImage.src = `https://image.tmdb.org/t/p/w185${actor.profile_path}`;
          actorImage.alt = actor.name;
          actorImage.style.borderRadius = "1.2rem";
          
          listItem.appendChild(actorImage);
          listItem.appendChild(actorName);
          castList.appendChild(listItem);
        });
      })
      .catch(error => console.error('Error fetching cast details:', error));
  }
  
  // Remove trailer functionality by hiding the trailer button (if present)
  const trailerBtn = document.getElementById('Trailerbtn');
  if (trailerBtn) {
    trailerBtn.style.display = 'none';
  }
  
  // Server switcher buttons: allow manual override of the embed source
  const serverButtons = document.querySelectorAll('.server-btn');
  serverButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      clearTimeout(autoSwitchTimer);
      isPreviewActive = false;
      const index = parseInt(this.getAttribute('data-index'));
      if (embedSources.length > index) {
        switchEmbed(embedSources[index]);
      }
    });
  });
});

// Sidebar and search functionality (unchanged)
let sidebar = document.querySelector(".sidebar");
let closeBtn = document.querySelector("#btn");
let searchBtn = document.querySelector(".bx-search");
closeBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  menuBtnChange();
});
searchBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  menuBtnChange();
});
function menuBtnChange() {
  if (sidebar.classList.contains("open")) {
    closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");
  } else {
    closeBtn.classList.replace("bx-menu-alt-right", "bx-menu");
  }
}

// Updated search function name to "searchMovies" so it matches the header events
function searchMovies() {
  const query = document.getElementById('searchInput').value;
  if (query.length < 3) {
    alert("Please enter at least 3 characters for search.");
    return;
  }
  window.location.href = `../results/results.html?query=${encodeURIComponent(query)}`;
}
