async function loadMovies() {
    const container = document.getElementById('movie-container');

    try {
        const snapshot = await db.collection('movies').where('status', '==', 'published').get();
        
        if (snapshot.empty) {
            container.innerHTML = "<p>No movies available right now.</p>";
            return;
        }

        container.innerHTML = '';

        snapshot.forEach(doc => {
            const movie = doc.data();
            const watchLink = `https://t.me/${CONFIG.BOT_USERNAME}?start=${movie.slug}`;
            const posterImg = movie.poster_url ? movie.poster_url : 'https://via.placeholder.com/220x330?text=No+Poster';

            const movieCard = `
                <div class="movie-card">
                    <img src="${posterImg}" alt="${movie.title}" style="width: 100%; height: 330px; object-fit: cover; border-radius: 4px; margin-bottom: 10px;">
                    <div class="movie-title">${movie.title}</div>
                    <a href="${watchLink}" target="_blank" class="btn">▶ WATCH NOW</a>
                </div>
            `;
            container.innerHTML += movieCard;
        });
    } catch (error) {
        console.error("Error fetching movies:", error);
        container.innerHTML = "<p>Error loading movies. Please try again later.</p>";
    }
}

loadMovies();
