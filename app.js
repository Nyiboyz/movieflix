const { createClient } = supabase;
const supabaseClient = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

async function loadMovies() {
    const container = document.getElementById('movie-container');

    const { data: movies, error } = await supabaseClient
        .from('movies')
        .select('*')
        .eq('status', 'published');

    if (error || movies.length === 0) {
        container.innerHTML = "<p>No movies available right now.</p>";
        return;
    }

    container.innerHTML = '';

    movies.forEach(movie => {
        const watchLink = `https://t.me/${CONFIG.BOT_USERNAME}?start=${movie.slug}`;
        
        // If there is a poster URL, use it. Otherwise, show a grey placeholder box.
        const posterImg = movie.poster_url 
            ? movie.poster_url 
            : 'https://via.placeholder.com/220x330?text=No+Poster';

        const movieCard = `
            <div class="movie-card">
                <!-- This new line displays the image -->
                <img src="${posterImg}" alt="${movie.title}" style="width: 100%; height: 330px; object-fit: cover; border-radius: 4px; margin-bottom: 10px;">
                
                <div class="movie-title">${movie.title}</div>
                <a href="${watchLink}" target="_blank" class="btn">▶ WATCH NOW</a>
            </div>
        `;
        container.innerHTML += movieCard;
    });
}

loadMovies();
