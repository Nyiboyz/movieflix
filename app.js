window.allMovies = []; 
window.currentCategory = 'All';

async function initApp() {
    try {
        const snapshot = await db.collection('movies').where('status', '==', 'published').get();
        window.allMovies = [];
        
        snapshot.forEach(doc => {
            const data = doc.data();
            data.id = doc.id;
            
            // Fix old database entries so they don't break the new array system
            if(!data.category) data.category = ['Action']; 
            else if(!Array.isArray(data.category)) data.category = [data.category]; 
            
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
    
    let filtered = window.allMovies;
    
    // Filter by Array logic
    if (window.currentCategory !== 'All') {
        filtered = filtered.filter(m => m.category && m.category.includes(window.currentCategory));
    }
    
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
    setupAdvancedScroll('latest-movies'); 
}

window.searchMovies = function() {
    const query = document.getElementById('searchInput').value;
    renderMovies(query);
};

window.filterCategory = function(category, element) {
    window.currentCategory = category;
    document.querySelectorAll('.cat-tab').forEach(tab => tab.classList.remove('active'));
    element.classList.add('active');
    const currentSearch = document.getElementById('searchInput').value;
    renderMovies(currentSearch);
};

window.openModal = function(movieId) {
    const movie = window.allMovies.find(m => m.id === movieId);
    if(!movie) return;

    document.getElementById('modalImg').src = movie.poster_url || 'https://via.placeholder.com/300x450?text=No+Poster';
    document.getElementById('modalTitle').innerText = movie.title;
    
    // Join the array for a beautiful display (e.g., "Action, Sci-Fi")
    const catDisplay = Array.isArray(movie.category) ? movie.category.join(', ') : (movie.category || 'Movie');
    document.getElementById('modalCategory').innerText = catDisplay;
    
    document.getElementById('modalDesc').innerText = movie.description || "No description available.";
    
    const watchLink = `https://t.me/${CONFIG.BOT_USERNAME}?start=${movie.slug}`;
    document.getElementById('modalLink').href = watchLink;

    document.getElementById('movieModal').style.display = 'flex';
};

window.closeModal = function() {
    document.getElementById('movieModal').style.display = 'none';
};

window.onclick = function(event) {
    const modal = document.getElementById('movieModal');
    if (event.target === modal) window.closeModal();
};

function setupAdvancedScroll(rowId) {
    const row = document.getElementById(rowId);
    if (!row) return;

    let scrollSpeed = 0.5; 
    let isPaused = false;
    let pauseTimer;

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
