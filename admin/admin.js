// LOGIN FUNCTION
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');

    try {
        await auth.signInWithEmailAndPassword(email, password);
        window.location.href = 'dashboard.html';
    } catch (error) {
        errorMsg.innerText = "Login failed: " + error.message;
    }
}

// LOGOUT FUNCTION
async function logout() {
    await auth.signOut();
    window.location.href = 'index.html';
}

// PROTECT DASHBOARD FUNCTION
function checkAuth() {
    auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = 'index.html';
        } else {
            // If user is logged in, load the movies list!
            if (document.getElementById('admin-movie-list')) {
                loadAdminMovies();
            }
        }
    });
}

// ADD MOVIE FUNCTION
const addMovieForm = document.getElementById('addMovieForm');
if (addMovieForm) {
    addMovieForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const statusMsg = document.getElementById('status-msg');
        statusMsg.innerText = "Saving...";
        statusMsg.style.color = "white";

        const movieData = {
            title: document.getElementById('title').value,
            slug: document.getElementById('slug').value,
            description: document.getElementById('description').value,
            poster_url: document.getElementById('poster_url').value,
            telegram_message_id: parseInt(document.getElementById('telegram_id').value),
            status: document.getElementById('status').value
        };

        try {
            await db.collection('movies').add(movieData);
            statusMsg.innerText = "✅ Movie added successfully!";
            statusMsg.style.color = "#45a29e";
            addMovieForm.reset();
            loadAdminMovies(); // Automatically refresh list after adding
        } catch (error) {
            statusMsg.innerText = "Error: " + error.message;
            statusMsg.style.color = "#e50914";
        }
    });
}

// LOAD MOVIES IN ADMIN PANEL
async function loadAdminMovies() {
    const list = document.getElementById('admin-movie-list');
    if (!list) return;

    try {
        const snapshot = await db.collection('movies').get();
        list.innerHTML = '';
        
        if (snapshot.empty) {
            list.innerHTML = '<p>No movies found in the database.</p>';
            return;
        }

        let html = '<table style="width:100%; text-align:left; border-collapse: collapse;">';
        html += '<tr style="border-bottom: 1px solid #45a29e; color: #45a29e;"><th style="padding-bottom: 10px;">Title</th><th style="padding-bottom: 10px;">Status</th><th style="padding-bottom: 10px;">Action</th></tr>';
        
        snapshot.forEach(doc => {
            const movie = doc.data();
            const movieId = doc.id;
            
            html += `
                <tr style="border-bottom: 1px solid #333;">
                    <td style="padding: 15px 0;">${movie.title}</td>
                    <td style="padding: 15px 0;">${movie.status}</td>
                    <td style="padding: 15px 0;">
                        <button onclick="deleteMovie('${movieId}')" style="background-color: #e50914; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 4px; font-weight: bold;">Delete</button>
                    </td>
                </tr>
            `;
        });
        html += '</table>';
        list.innerHTML = html;
    } catch (error) {
        list.innerHTML = '<p style="color: #e50914;">Error loading movies: ' + error.message + '</p>';
        console.error(error);
    }
}

// DELETE MOVIE FUNCTION
async function deleteMovie(movieId) {
    if (confirm("Are you sure you want to delete this movie from the database?")) {
        try {
            await db.collection('movies').doc(movieId).delete();
            alert("Movie deleted successfully!");
            loadAdminMovies(); // Refresh the list
        } catch (error) {
            alert("Error deleting movie: " + error.message);
        }
    }
}
