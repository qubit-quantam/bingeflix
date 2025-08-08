// Global variables for IMDb ID and embed URLs
const API_KEY = '7b4b8af2d885777c1c603011ee871be6';
let imdbId;
let embedSources = [];
let currentSeason = 1;
let allEpisodes = {};
let currentEpisodeStart = 0;
const EPISODES_PER_PAGE = 50;

// DOM elements
const seasonContainer = document.getElementById('seasonContainer');
const episodeContainer = document.getElementById('episodeContainer');
const loadMoreEpisodesBtn = document.getElementById('loadMoreEpisodesBtn');
const loadMoreEpisodesContainer = document.getElementById('loadMoreEpisodesContainer');

// Helper: get URL parameter by name
function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Helper: switch the embed source by updating the iframe's src
function switchEmbed(source) {
  const iframe = document.getElementById('seriesIframe');
  if (iframe) {
    iframe.src = source;
  }
}

// Fetch episodes for the selected season
function fetchEpisodesForSeason(seasonNumber) {
  const episodesUrl = `https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonNumber}?api_key=${API_KEY}`;
  fetch(episodesUrl)
    .then(response => response.json())
    .then(data => {
      // Store episodes data
      allEpisodes[seasonNumber] = data.episodes;
      
      // Reset episode display
      currentEpisodeStart = 0;
      
      // Display initial set of episodes
      displayEpisodes(seasonNumber, currentEpisodeStart);
      
      // Update hidden select elements for compatibility with existing code
      updateHiddenSelects(seasonNumber, 1);
      
      // Once episodes are loaded, update the embed sources
      updateEmbedSources();
    })
    .catch(error => console.error('Error fetching episodes:', error));
}

// Display episodes as numbered buttons
function displayEpisodes(seasonNumber, startIndex) {
  // Check for the episode container
  const episodeContainer = document.getElementById('episodeContainer');
  if (!episodeContainer) return;
  
  // Clear episode container
  episodeContainer.innerHTML = '';
  
  const episodes = allEpisodes[seasonNumber] || [];
  const totalEpisodes = episodes.length;
  
  // Determine end index for pagination
  const endIndex = Math.min(startIndex + EPISODES_PER_PAGE, totalEpisodes);
  
  // Create episode buttons
  for (let i = startIndex; i < endIndex; i++) {
    const episode = episodes[i];
    const episodeBtn = document.createElement('button');
    
    episodeBtn.className = 'episode-btn';
    if (episode.episode_number === 1 && startIndex === 0) {
      episodeBtn.classList.add('active');
    }
    
    // Convert episode number to string and ensure it fits
    const epNum = episode.episode_number.toString();
    episodeBtn.textContent = epNum;
    episodeBtn.setAttribute('data-episode', episode.episode_number);
    episodeBtn.setAttribute('data-season', seasonNumber);
    
    // Add title attribute for accessibility and hover information
    episodeBtn.setAttribute('title', `Episode ${epNum}`);
    
    episodeBtn.addEventListener('click', function() {
      // Remove active class from all episode buttons
      document.querySelectorAll('.episode-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // Update hidden selects
      updateHiddenSelects(seasonNumber, episode.episode_number);
      
      // Update embed sources
      const seriesId = getParameterByName('id');
      updateEmbedSources(seriesId, seasonNumber, episode.episode_number);
    });
    
    episodeContainer.appendChild(episodeBtn);
  }
  
  // Show/hide load more button
  const loadMoreContainer = document.getElementById('loadMoreEpisodesContainer');
  const loadMoreBtn = document.getElementById('loadMoreEpisodesBtn');
  
  if (loadMoreContainer && loadMoreBtn) {
    if (endIndex < totalEpisodes) {
      loadMoreContainer.style.display = 'flex';
      loadMoreBtn.onclick = function() {
        currentEpisodeStart = endIndex;
        displayEpisodes(seasonNumber, currentEpisodeStart);
      };
    } else {
      loadMoreContainer.style.display = 'none';
    }
  }
}

// Create season tabs
function createSeasonTabs(numSeasons) {
  // Check for the season container
  const seasonContainer = document.getElementById('seasonContainer');
  if (!seasonContainer) return;
  
  // Clear existing content
  seasonContainer.innerHTML = '';
  
  // Update select element for compatibility
  const seasonSelect = document.getElementById('Sno');
  if (seasonSelect) {
    seasonSelect.innerHTML = '';
  }
  
  // Create a tab for each season
  for (let i = 1; i <= numSeasons; i++) {
    // Create visual season tab
    const seasonTab = document.createElement('button');
    seasonTab.className = 'season-tab';
    if (i === 1) seasonTab.classList.add('active');
    seasonTab.textContent = `Season ${i}`;
    seasonTab.setAttribute('data-season', i);
    
    // Add event listener to tab
    seasonTab.addEventListener('click', function() {
      // Update active tab
      document.querySelectorAll('.season-tab').forEach(tab => tab.classList.remove('active'));
      this.classList.add('active');
      
      // Update hidden select
      if (seasonSelect) {
        seasonSelect.value = i;
      }
      
      // Fetch episodes for this season
      const seriesId = getParameterByName('id');
      if (seriesId) {
        fetchEpisodes(seriesId, i);
      }
    });
    
    seasonContainer.appendChild(seasonTab);
    
    // Add to hidden select for compatibility
    if (seasonSelect) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = `Season ${i}`;
      seasonSelect.appendChild(option);
    }
  }
  
  // Set default season
  if (seasonSelect) {
    seasonSelect.value = 1;
  }
}

// Update hidden select elements for compatibility with existing code
function updateHiddenSelects(seasonNumber, episodeNumber) {
  const seasonSelect = document.getElementById('Sno');
  const episodeSelect = document.getElementById('epNo');
  
  // Update season select
  seasonSelect.innerHTML = '';
  const seasonOption = document.createElement('option');
  seasonOption.value = seasonNumber;
  seasonOption.textContent = `Season ${seasonNumber}`;
  seasonSelect.appendChild(seasonOption);
  seasonSelect.value = seasonNumber;
  
  // Update episode select
  episodeSelect.innerHTML = '';
  const episodeOption = document.createElement('option');
  episodeOption.value = episodeNumber;
  episodeOption.textContent = `Episode ${episodeNumber}`;
  episodeSelect.appendChild(episodeOption);
  episodeSelect.value = episodeNumber;
}

// Fetch cast details
function fetchCastDetails(seriesId) {
  const castUrl = `https://api.themoviedb.org/3/tv/${seriesId}/credits?api_key=${API_KEY}`;
  
  fetch(castUrl)
    .then(response => response.json())
    .then(data => {
      // Try both castContainer and castList elements
      const castContainer = document.getElementById('castContainer');
      const castList = document.getElementById('castList');
      
      if (!castContainer && !castList) {
        console.log('No cast container found');
        return;
      }
      
      // Display cast in appropriate container
      const targetElement = castContainer || castList;
      targetElement.innerHTML = '';
      
      // Display only the first 5 cast members
      const castToShow = data.cast ? data.cast.slice(0, 5) : [];
      
      castToShow.forEach(actor => {
        // Modern display for all cast members
        const actorCard = document.createElement('div');
        actorCard.style.cssText = 'width: 120px; text-align: center; margin-bottom: 15px; transition: transform 0.3s; cursor: pointer;';
        
        // Add hover effect
        actorCard.addEventListener('mouseenter', () => {
          actorCard.style.transform = 'scale(1.05)';
        });
        actorCard.addEventListener('mouseleave', () => {
          actorCard.style.transform = 'scale(1)';
        });
        
        const profilePath = actor.profile_path 
          ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
          : '../images/no-profile.png';
        
        const actorImage = document.createElement('img');
        actorImage.src = profilePath;
        actorImage.alt = actor.name;
        actorImage.style.cssText = 'width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);';
        
        const actorName = document.createElement('div');
        actorName.textContent = actor.name;
        actorName.style.cssText = 'font-weight: bold; font-size: 14px; margin-bottom: 4px; color: #fff;';
        
        const characterName = document.createElement('div');
        characterName.textContent = actor.character || 'Unknown Role';
        characterName.style.cssText = 'font-size: 12px; color: #aaa;';
        
        actorCard.appendChild(actorImage);
        actorCard.appendChild(actorName);
        actorCard.appendChild(characterName);
        
        targetElement.appendChild(actorCard);
      });
    })
    .catch(error => console.error('Error fetching cast details:', error));
}

// Fetch external IDs for the series (to get IMDb ID) and update embed sources
async function getAndSetImdbId() {
  const seriesId = getParameterByName('id');
  const extIdsUrl = `https://api.themoviedb.org/3/tv/${seriesId}/external_ids?api_key=${API_KEY}`;
  try {
    const response = await fetch(extIdsUrl);
    const data = await response.json();
    imdbId = data.imdb_id;
    console.log("Fetched IMDb ID:", imdbId);
    updateEmbedSources();
  } catch (error) {
    console.error("Error fetching external IDs:", error);
  }
}

// Function to update embed sources based on selected season and episode
function updateEmbedSources(seriesId, seasonNumber, episodeNumber) {
  // Default to URL parameters if not provided
  seriesId = seriesId || getParameterByName('id');
  
  // Get values from hidden inputs if not provided
  if (!seasonNumber) {
    seasonNumber = document.getElementById('Sno')?.value || 1;
  }
  
  if (!episodeNumber) {
    episodeNumber = document.getElementById('epNo')?.value || 1;
  }
  
  const imdbId = document.getElementById('imdbId')?.value || '';
  
  if (!imdbId) {
    console.error('IMDb ID not available');
    // Try fetching it if not available
    fetchImdbId(seriesId).then(id => {
      if (id && document.getElementById('imdbId')) {
        document.getElementById('imdbId').value = id;
        // Retry with the fetched ID
        updateEmbedSources(seriesId, seasonNumber, episodeNumber);
      }
    });
    return;
  }
  
  if (!episodeNumber || !seasonNumber) {
    console.error('Season or episode not selected');
    return;
  }
  
  // Build URLs using the correct ID type:
  const server1Url = `https://vidlink.pro/tv/${seriesId}/${seasonNumber}/${episodeNumber}`;
  const server2Url = `https://watch.streamflix.one/tv/${seriesId}/watch?server=1${seasonNumber && episodeNumber ? `&season=${seasonNumber}&episode=${episodeNumber}` : ''}`;
  const server3Url = `https://embed.su/embed/tv/${seriesId}/${seasonNumber}/${episodeNumber}`;
  const server4Url = `https://www.2embed.stream/embed/tv/${imdbId}/${seasonNumber}/${episodeNumber}`;
  const server5Url = `https://www.2embed.cc/embedtv/${imdbId}&s=${seasonNumber}&e=${episodeNumber}`;
  const server6Url = `https://player.videasy.net/tv/${seriesId}/${seasonNumber}/${episodeNumber}?nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&color=8B5CF6`;
  const server7Url = `https://vidfast.pro/tv/${seriesId}/${seasonNumber}/${episodeNumber}?autoPlay=true`;
  const server8Url = `https://moviesapi.club/tv/${seriesId}-${seasonNumber}-${episodeNumber}`;
  
  const embedSources = [
    server1Url, // Vidlink.pro (default)
    server2Url, // watch.streamflix.one
    server3Url, // embed.su
    server4Url, // 2embed.stream
    server5Url, // 2embed.cc
    server6Url, // Videasy
    server7Url, // Autoembed.cc
    server8Url  // MoviesAPI.club
  ];
  
  console.log("Updated embed sources:", embedSources);
  
  // Set data-src attribute for each server button
  const serverButtons = document.querySelectorAll('.server-btn');
  serverButtons.forEach((button, index) => {
    if (index < embedSources.length) {
      button.setAttribute('data-src', embedSources[index]);
    }
  });
  
  // Set the default server (first one) as active and update iframe
  const activeServer = document.querySelector('.server-btn.active') || serverButtons[0];
  if (activeServer) {
    serverButtons.forEach(btn => btn.classList.remove('active'));
    activeServer.classList.add('active');
    
    // Find the correct iframe to update
    let iframe;
    if (document.getElementById('seriesIframe')) {
      iframe = document.getElementById('seriesIframe');
    } else if (document.getElementById('videoIframe')) {
      iframe = document.getElementById('videoIframe');
    }
    
    if (iframe && activeServer.getAttribute('data-src')) {
      iframe.src = activeServer.getAttribute('data-src');
    }
  }
}

// Setup event listeners after DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Create a hidden input for IMDb ID if it doesn't exist
  if (!document.getElementById('imdbId')) {
    const imdbIdInput = document.createElement('input');
    imdbIdInput.id = 'imdbId';
    imdbIdInput.type = 'hidden';
    document.body.appendChild(imdbIdInput);
  }

  // Make sure we have cast container
  if (!document.getElementById('castContainer') && document.getElementById('castList')) {
    const castContainer = document.createElement('div');
    castContainer.id = 'castContainer';
    document.getElementById('castList').appendChild(castContainer);
  }

  // Get query parameters from URL
  const urlParams = new URLSearchParams(window.location.search);
  const seriesId = urlParams.get('id');
  
  if (seriesId) {
    fetchSeriesDetails(seriesId);
  }
  
  // Add data-server attributes to server buttons if they don't have them
  const serverBtns = document.querySelectorAll('.server-btn');
  const serverTypes = ['vidplay', 'multiembed', 'remotestream', '2embed', 'server5', 'server6', 'server7', 'server8'];
  serverBtns.forEach((btn, index) => {
    if (!btn.getAttribute('data-server') && index < serverTypes.length) {
      btn.setAttribute('data-server', serverTypes[index]);
    }
  });

  // Add event listeners to server buttons
  serverBtns.forEach((button, index) => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      serverBtns.forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked button
      this.classList.add('active');
      
      // Update iframe source
      const iframeSrc = this.getAttribute('data-src');
      if (iframeSrc) {
        switchEmbed(iframeSrc);
      }
    });
  });
  
  // Event listener for season selection change
  const seasonNoElement = document.getElementById('seasonNo');
  if (seasonNoElement) {
    seasonNoElement.addEventListener('change', function() {
      const seasonNumber = this.value;
      if (seriesId && seasonNumber) {
        fetchEpisodes(seriesId, seasonNumber);
      }
    });
  }
  
  // Event listener for episode selection change
  const epNoElement = document.getElementById('epNo');
  if (epNoElement) {
    epNoElement.addEventListener('change', function() {
      const seasonNumber = document.getElementById('seasonNo')?.value || document.getElementById('Sno')?.value;
      const episodeNumber = this.value;
      if (seriesId && seasonNumber && episodeNumber) {
        updateEmbedSources(seriesId, seasonNumber, episodeNumber);
      }
    });
  }
});

// Fetch series details from TMDB
function fetchSeriesDetails(seriesId) {
  const url = `https://api.themoviedb.org/3/tv/${seriesId}?api_key=${API_KEY}&language=en-US`;
  
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      // Update UI with series data
      if (document.getElementById('title')) {
        document.getElementById('title').textContent = data.name;
      }
      
      if (document.getElementById('description')) {
        document.getElementById('description').textContent = data.overview;
      } else if (document.getElementById('overview')) {
        document.getElementById('overview').textContent = data.overview;
      }
      
      // Set poster image
      if (data.poster_path && document.getElementById('poster')) {
        document.getElementById('poster').src = `https://image.tmdb.org/t/p/w500${data.poster_path}`;
      }
      
      // Create season tabs
      createSeasonTabs(data.number_of_seasons);
      
      // Fetch episodes for the first season
      fetchEpisodes(seriesId, 1);
      
      // Fetch cast details
      fetchCastDetails(seriesId);
      
      // Fetch IMDb ID for embed sources
      return fetchImdbId(seriesId);
    })
    .then(imdbId => {
      if (imdbId) {
        // Store IMDb ID for later use
        if (document.getElementById('imdbId')) {
          document.getElementById('imdbId').value = imdbId;
        }
      }
      return imdbId;
    })
    .catch(error => {
      console.error('Error fetching series details:', error);
      if (document.getElementById('errorMessage')) {
        document.getElementById('errorMessage').textContent = 'Error loading series details. Please try again later.';
      }
    });
}

function fetchImdbId(seriesId) {
  const url = `https://api.themoviedb.org/3/tv/${seriesId}/external_ids?api_key=${API_KEY}`;
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      return data.imdb_id;
    })
    .catch(error => {
      console.error('Error fetching IMDb ID:', error);
      return null;
    });
}

// Sidebar logic (unchanged)
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
function searchSeries() {
  const query = document.getElementById('searchInput').value;
  if (query.length < 3) {
    alert("Please enter at least 3 characters for search.");
    return;
  }
  window.location.href = `../results/results.html?query=${query}`;
}

// Function to fetch and display episodes for a selected season
function fetchEpisodes(seriesId, seasonNumber) {
  const url = `https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonNumber}?api_key=${API_KEY}&language=en-US`;
  
  fetch(url)
    .then(response => response.json())
    .then(data => {
      // Store episodes data for pagination
      allEpisodes[seasonNumber] = data.episodes || [];
      
      // Reset episode display
      currentEpisodeStart = 0;
      
      // Display initial set of episodes
      displayEpisodes(seasonNumber, 0);
      
      // Clear previous episodes in hidden select
      const episodeSelect = document.getElementById('epNo');
      if (episodeSelect) {
        episodeSelect.innerHTML = '';
        
        if (data.episodes && data.episodes.length > 0) {
          // Add episodes to dropdown
          data.episodes.forEach(episode => {
            const option = document.createElement('option');
            option.value = episode.episode_number;
            option.textContent = `Episode ${episode.episode_number}: ${episode.name}`;
            episodeSelect.appendChild(option);
          });
          
          // Set first episode as selected
          episodeSelect.value = 1;
        } else {
          // No episodes found
          const option = document.createElement('option');
          option.value = 1;
          option.textContent = 'Episode 1';
          episodeSelect.appendChild(option);
        }
      }
      
      // Update embed sources with first episode
      updateEmbedSources(seriesId, seasonNumber, 1);
    })
    .catch(error => {
      console.error('Error fetching episodes:', error);
      // Handle error case
      const episodeContainer = document.getElementById('episodeContainer');
      if (episodeContainer) {
        episodeContainer.innerHTML = '<p>Error loading episodes. Please try again later.</p>';
      }
    });
}

// Function to get and set the IMDb ID for additional embed sources
function getAndSetImdbId(seriesId) {
  const externalIdsUrl = `https://api.themoviedb.org/3/tv/${seriesId}/external_ids?api_key=${API_KEY}`;
  
  fetch(externalIdsUrl)
    .then(response => response.json())
    .then(data => {
      if (data.imdb_id) {
        document.getElementById('imdbId').value = data.imdb_id;
        // Update embeds with the new IMDb ID
        updateEmbedSources();
      }
    })
    .catch(error => console.error('Error fetching IMDb ID:', error));
}
