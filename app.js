async function loadNetflixUI() {
    const latestContainer = document.getElementById('latest-movies');
    const bestContainer = document.getElementById('best-rated-movies');

    try {
        const snapshot = await db.collection('movies').where('status', '==', 'published').get();
        
        if (snapshot.empty) {
            latestContainer.innerHTML = "<p>No movies available right now.</p>";
            return;
        }

        let moviesHTML = '';

        snapshot.forEach(doc => {
            const movie = doc.data();
            const watchLink = `https://t.me/${CONFIG.BOT_USERNAME}?start=${movie.slug}`;
            const posterImg = movie.poster_url ? movie.poster_url : 'https://via.placeholder.com/200x300?text=No+Poster';

            moviesHTML += `
                <div class="movie-card">
                    <img src="${posterImg}" alt="${movie.title}">
                    <div style="margin-top: 8px; font-size: 15px; font-weight: bold; text-align: center; color: #e5e5e5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 5px;">${movie.title}</div>
                    <a href="${watchLink}" target="_blank" class="play-btn">▶ PLAY</a>
                </div>
            `;
            `;
        });

        // Populate both rows (Later we can filter these dynamically via Admin portal categories)
        latestContainer.innerHTML = moviesHTML ; // Doubled to ensure enough width for scrolling effect
        bestContainer.innerHTML = moviesHTML;

        // Activate the Advanced Scrolling Logic
        setupAdvancedScroll('latest-movies');
        setupAdvancedScroll('best-rated-movies');

    } catch (error) {
        console.error("Error fetching movies:", error);
    }
}

// --- ADVANCED SCROLLING LOGIC ---
function setupAdvancedScroll(rowId) {
    const row = document.getElementById(rowId);
    let scrollSpeed = 0.5; // Default slow drift
    let isPaused = false;
    let pauseTimer;

    // 1. The Continuous Animation Loop
    function scrollLoop() {
        if (!isPaused) {
            row.scrollLeft += scrollSpeed;
        }
        requestAnimationFrame(scrollLoop);
    }
    scrollLoop(); // Start the loop

    // 2. Cursor tracking (Auto roll going left and right)
    row.addEventListener('mousemove', (e) => {
        if (isPaused) return; // Don't change speed if hovered on a movie
        
        const rect = row.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        
        // If mouse is on left 30% of screen, scroll left. Right 30%, scroll right.
        if (mouseX < rect.width * 0.3) {
            scrollSpeed = -3; // Scroll Left Fast
        } else if (mouseX > rect.width * 0.7) {
            scrollSpeed = 3;  // Scroll Right Fast
        } else {
            scrollSpeed = 0.5; // Back to default slow drift right
        }
    });

    // Reset to default drift when mouse leaves the row area
    row.addEventListener('mouseleave', () => {
        scrollSpeed = 0.5;
    });

    // 3. Stop for 3s when cursor is on a movie, then roll again
    row.addEventListener('mouseover', (e) => {
        // Check if what we hovered over is a movie card
        if (e.target.closest('.movie-card')) {
            isPaused = true;
            clearTimeout(pauseTimer);
            
            // Wait exactly 3 seconds, then unpause
            pauseTimer = setTimeout(() => {
                isPaused = false;
            }, 3000);
        }
    });
}

// Initialize the page
loadNetflixUI();
