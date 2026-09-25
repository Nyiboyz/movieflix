// Connect to Supabase using your config
const { createClient } = supabase;
const supabaseClient = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

async function loadMovies() {
    const container = document.getElementById('movie-container');

    // Fetch published movies from the database
    const { data: movies, error } = await supabaseClient
        .from('movies')
        .select('*')
        .eq('status', 'published');

    if (error) {
        console.error("Error fetching movies:", error);
        container.innerHTML = "<p>Error loading movies. Please try again later.</p>";
        return;
    }

    if (movies.length === 0) {
        container.innerHTML = "<p>No movies available right now.</p>";
        return;
    }

    // Clear loading text
    container.innerHTML = '';

    // Generate HTML for each movie
    movies.forEach(movie => {
        // This is the magic link that opens Telegram and passes the movie slug
        const watchLink = `https://t.me/${CONFIG.BOT_USERNAME}?start=${movie.slug}`;

        const movieCard = `
            <div class="movie-card">
                <div class="movie-title">${movie.title}</div>
                <a href="${watchLink}" target="_blank" class="btn">▶ WATCH NOW</a>
            </div>
        `;
        container.innerHTML += movieCard;
    });
}

// Run the function when the page loads
loadMovies();