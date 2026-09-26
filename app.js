window.allMovies = []; // Make global to ensure search always works
window.currentCategory = 'All';

async function initApp() {
    try {
        const snapshot = await db.collection('movies').where('status', '==', 'published').get();
        window.allMovies = [];
        
        snapshot.forEach(doc => {
            const data = doc.data();
            data.id = doc.id;
            // If old movies don't have a category yet, default to 'Action'
            if(!data.category) data.category = 'Action'; 
            window.allMovies.push(data);
        });

        renderMovies();

    } catch (error) {
        console.error("Error loading movies:", error);
        document.getElementById('latest-movies').innerHTML = "<p>Error loading content.</p>";
    }
}

function renderMovies(searchQuery = '') {
    const container = document.getElementById('latest-movies');
    
    // 1. Filter by Category
    let filtered = window.allMovies;
    if (window.currentCategory !== 'All') {
        filtered = filtered.filter(m => m.category === window.currentCategory);
    }
    
    // 2. Filter by Search Query
    if (searchQuery) {
        filtered = filtered.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (filtered.length === 0) {
        container.innerHTML = "<p style='padding:10px;'>No movies found.</p>";
        return;
    }

    let html = '';
    filtered.forEach(movie => {
        const watchLink = `https://t.me/${CONFIG.BOT_USERNAME}?start=${movie.slug}`;
        const posterImg = movie.poster_url || 'https://via.placeholder.com/200x300?text=No+Poster';
        
        html += `
            <div class="movie-card">
                <img src="${posterImg}" onclick="window.openModal('${movie.id}')" title="Click for details">
                <div class="movie-title">${movie.title}</div>
                <a href="${watchLink}" target="_blank" class="play-btn">▶ PLAY</a>
            </div>
        `;
    });

    container.innerHTML = html;
    setupAdvancedScroll('latest-movies'); // Restart scroll animation on new items
}

// --- GLOBAL FUNCTIONS GUARANTEED TO WORK IN HTML ---

window.searchMovies = function() {
    const query = document.getElementById('searchInput').value;
    renderMovies(query);
};

window.filterCategory = function(category, element) {
    window.currentCategory = category;
    
    // Update red button styling
    document.querySelectorAll('.cat-tab').forEach(tab => tab.classList.remove('active'));
    element.classList.add('active');
    
    // Render keeping search term if any
    const currentSearch = document.getElementById('searchInput').value;
    renderMovies(currentSearch);
};

window.openModal = function(movieId) {
    const movie = window.allMovies.find(m => m.id === movieId);
    if(!movie) return;

    document.getElementById('modalImg').src = movie.poster_url || 'https://via.placeholder.com/300x450?text=No+Poster';
    document.getElementById('modalTitle').innerText = movie.title;
    document.getElementById('modalCategory').innerText = movie.category || 'Movie';
    document.getElementById('modalDesc').innerText = movie.description || "No description available.";
    
    const watchLink = `https://t.me/${CONFIG.BOT_USERNAME}?start=${movie.slug}`;
    document.getElementById('modalLink').href = watchLink;

    document.getElementById('movieModal').style.display = 'flex';
};

window.closeModal = function() {
    document.getElementById('movieModal').style.display = 'none';
};

// Close modal if clicking the dark background
window.onclick = function(event) {
    const modal = document.getElementById('movieModal');
    if (event.target === modal) window.closeModal();
};

// --- SCROLL LOGIC ---
function setupAdvancedScroll(rowId) {
    const row = document.getElementById(rowId);
    if (!row) return;

    let scrollSpeed = 0.5; 
    let isPaused = false;
    let pauseTimer;

    // Clear previous event listeners by cloning the node to prevent speed bugs on re-render
    const newRow = row.cloneNode(true);
    row.parentNode.replaceChild(newRow, row);

    function scrollLoop() {
        if (!isPaused) newRow.scrollLeft += scrollSpeed;
        requestAnimationFrame(scrollLoop);
    }
    scrollLoop(); 

    newRow.addEventListener('mousemove', (e) => {
        if (isPaused) return; 
        const rect = newRow.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        
        if (mouseX < rect.width * 0.3) scrollSpeed = -2;
        else if (mouseX > rect.width * 0.7) scrollSpeed = 2;
        else scrollSpeed = 0.5;
    });

    newRow.addEventListener('mouseleave', () => scrollSpeed = 0.5);

    newRow.addEventListener('mouseover', (e) => {
        if (e.target.closest('.movie-card')) {
            isPaused = true;
            clearTimeout(pauseTimer);
            pauseTimer = setTimeout(() => isPaused = false, 3000);
        }
    });
}

initApp();
