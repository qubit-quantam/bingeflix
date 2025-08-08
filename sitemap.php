<?php
// -------------------------
// Dynamic Sitemap Generator
// -------------------------

// Set up a new XML document with UTF-8 encoding
$xml = new DOMDocument('1.0', 'UTF-8');
$xml->formatOutput = true;

// Create the root element as defined by the sitemap protocol
$urlset = $xml->createElement('urlset');
$urlset->setAttribute('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');
$xml->appendChild($urlset);

// Your TMDB API key - replace with your actual key
$apiKey = '7b4b8af2d885777c1c603011ee871be6';

// -------------------------
// Fetch Movies Data
// -------------------------
$tmdbMoviesUrl = "https://api.themoviedb.org/3/movie/popular?api_key={$apiKey}";
$responseMovies = file_get_contents($tmdbMoviesUrl);
if ($responseMovies !== false) {
    $dataMovies = json_decode($responseMovies, true);
    if (isset($dataMovies['results'])) {
        foreach ($dataMovies['results'] as $movie) {
            $urlElement = $xml->createElement('url');
            
            // Updated URL for movies matching your blog structure
            $locValue = 'https://bingeflix.xyz/movie_details/movie_details.html?id=' . $movie['id'];
            $loc = $xml->createElement('loc', htmlspecialchars($locValue, ENT_XML1, 'UTF-8'));
            $urlElement->appendChild($loc);
            
            // Optional: Add the last modification date (current date)
            $lastmod = $xml->createElement('lastmod', date('Y-m-d'));
            $urlElement->appendChild($lastmod);
            
            $urlset->appendChild($urlElement);
        }
    }
} else {
    // Handle movie API errors (optional)
    error_log("Error fetching movies data from TMDB API.");
}

// -------------------------
// Fetch TV Series Data
// -------------------------
$tmdbTVUrl = "https://api.themoviedb.org/3/tv/popular?api_key={$apiKey}";
$responseTV = file_get_contents($tmdbTVUrl);
if ($responseTV !== false) {
    $dataTV = json_decode($responseTV, true);
    if (isset($dataTV['results'])) {
        foreach ($dataTV['results'] as $tv) {
            $urlElement = $xml->createElement('url');
            
            // Updated URL for TV series matching your blog structure
            $locValue = 'https://bingeflix.xyz/series_details/series_details.html?id=' . $tv['id'];
            $loc = $xml->createElement('loc', htmlspecialchars($locValue, ENT_XML1, 'UTF-8'));
            $urlElement->appendChild($loc);
            
            // Optional: Add the last modification date (current date)
            $lastmod = $xml->createElement('lastmod', date('Y-m-d'));
            $urlElement->appendChild($lastmod);
            
            $urlset->appendChild($urlElement);
        }
    }
} else {
    // Handle TV API errors (optional)
    error_log("Error fetching TV data from TMDB API.");
}

// -------------------------
// Output the XML Sitemap
// -------------------------
header('Content-Type: application/xml');
echo $xml->saveXML();
?>
