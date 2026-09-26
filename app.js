async function loadNetflixUI() {
    const latestContainer = document.getElementById('latest-movies');
    const bestContainer = document.getElementById('best-rated-movies');

    try {
        const snapshot = await db.collection('movies').where('status', '==', 'published').get();
        
        if (snapshot.empty) {
            latestContainer.innerHTML = "<p style='padding: 20px;'>No movies available right now.</p>";
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
        });

        // Put the movies in the rows (No cloning)
        latestContainer.innerHTML = moviesHTML;
        bestContainer.innerHTML = moviesHTML;

        // Activate the Advanced Scrolling Logic
        setupAdvancedScroll('latest-movies');
        setupAdvancedScroll('best-rated-movies');

    } catch (error) {
        console.error("Error fetching movies:", error);
        latestContainer.innerHTML = "<p style='padding: 20px; color: red;'>Error loading movies. Please check console.</p>";
    }
}

// --- ADVANCED SCROLLING LOGIC ---
function setupAdvancedScroll(rowId) {
    const row = document.getElementById(rowId);
    if (!row) return; // Safety check

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

    // 2. Cursor tracking
    row.addEventListener('mousemove', (e) => {
        if (isPaused) return; 
        
        const rect = row.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        
        if (mouseX < rect.width * 0.3) {
            scrollSpeed = -3; // Scroll Left Fast
        } else if (mouseX > rect.width * 0.7) {
            scrollSpeed = 3;  // Scroll Right Fast
        } else {
            scrollSpeed = 0.5; // Back to default
        }
    });

    row.addEventListener('mouseleave', () => {
        scrollSpeed = 0.5;
    });

    // 3. Stop for 3s when hovering a movie
    row.addEventListener('mouseover', (e) => {
        if (e.target.closest('.movie-card')) {
            isPaused = true;
            clearTimeout(pauseTimer);
            
            pauseTimer = setTimeout(() => {
                isPaused = false;
            }, 3000);
        }
    });
}

// Initialize the page
loadNetflixUI();
