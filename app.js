let allMovies = []; // Stores all movies for instant search

async function initApp() {
    try {
        const snapshot = await db.collection('movies').where('status', '==', 'published').get();
        allMovies = [];
        
        snapshot.forEach(doc => {
            const data = doc.data();
            data.id = doc.id; // Save unique ID
            allMovies.push(data);
        });

        renderMovies(allMovies);
        setupAdvancedScroll('latest-movies');
        setupAdvancedScroll('best-rated-movies');

    } catch (error) {
        console.error("Error loading movies:", error);
        document.getElementById('latest-movies').innerHTML = "<p>Error loading content.</p>";
    }
}

// Render movies into the HTML
function renderMovies(moviesToRender) {
    const latestContainer = document.getElementById('latest-movies');
    const bestContainer = document.getElementById('best-rated-movies');
    
    if (moviesToRender.length === 0) {
        latestContainer.innerHTML = "<p style='padding:10px;'>No movies found.</p>";
        bestContainer.innerHTML = "";
        return;
    }

    let html = '';
    moviesToRender.forEach(movie => {
        const watchLink = `https://t.me/${CONFIG.BOT_USERNAME}?start=${movie.slug}`;
        const posterImg = movie.poster_url || 'https://via.placeholder.com/200x300?text=No+Poster';
        
        // Note: onclick on the IMAGE opens the modal. The PLAY button goes to Telegram.
        html += `
            <div class="movie-card">
                <img src="${posterImg}" onclick="openModal('${movie.id}')" alt="${movie.title}">
                <div class="movie-title">${movie.title}</div>
                <a href="${watchLink}" target="_blank" class="play-btn">▶ PLAY</a>
            </div>
        `;
    });

    latestContainer.innerHTML = html;
    bestContainer.innerHTML = html; 
}

// --- LIVE SEARCH FUNCTION ---
document.getElementById('searchInput').addEventListener('keyup', function(e) {
    const query = e.target.value.toLowerCase();
    // Filter the global array instantly
    const filteredMovies = allMovies.filter(movie => 
        movie.title.toLowerCase().includes(query)
    );
    renderMovies(filteredMovies);
});

// --- MODAL POP-UP LOGIC ---
function openModal(movieId) {
    const movie = allMovies.find(m => m.id === movieId);
    if(!movie) return;

    document.getElementById('modalImg').src = movie.poster_url || 'https://via.placeholder.com/300x450?text=No+Poster';
    document.getElementById('modalTitle').innerText = movie.title;
    document.getElementById('modalDesc').innerText = movie.description || "No description available.";
    
    const watchLink = `https://t.me/${CONFIG.BOT_USERNAME}?start=${movie.slug}`;
    document.getElementById('modalLink').href = watchLink;

    // Show the modal
    document.getElementById('movieModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('movieModal').style.display = 'none';
}

// Close modal if user clicks outside the box
window.onclick = function(event) {
    const modal = document.getElementById('movieModal');
    if (event.target === modal) {
        closeModal();
    }
}

// --- SCROLL LOGIC ---
function setupAdvancedScroll(rowId) {
    const row = document.getElementById(rowId);
    if (!row) return;

    let scrollSpeed = 0.5; 
    let isPaused = false;
    let pauseTimer;

    function scrollLoop() {
        if (!isPaused) row.scrollLeft += scrollSpeed;
        requestAnimationFrame(scrollLoop);
    }
    scrollLoop(); 

    row.addEventListener('mousemove', (e) => {
        if (isPaused) return; 
        const rect = row.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        
        if (mouseX < rect.width * 0.3) scrollSpeed = -3;
        else if (mouseX > rect.width * 0.7) scrollSpeed = 3;
        else scrollSpeed = 0.5;
    });

    row.addEventListener('mouseleave', () => scrollSpeed = 0.5);

    row.addEventListener('mouseover', (e) => {
        if (e.target.closest('.movie-card')) {
            isPaused = true;
            clearTimeout(pauseTimer);
            pauseTimer = setTimeout(() => isPaused = false, 3000);
        }
    });
}

initApp();
