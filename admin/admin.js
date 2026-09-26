// LOGIN
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        await auth.signInWithEmailAndPassword(email, password);
        window.location.href = 'dashboard.html';
    } catch (error) {
        document.getElementById('error-msg').innerText = "Login failed: " + error.message;
    }
}

// LOGOUT
async function logout() {
    await auth.signOut();
    window.location.href = 'index.html';
}

// CHECK AUTH
function checkAuth() {
    auth.onAuthStateChanged(user => {
        if (!user) window.location.href = 'index.html';
        else if (document.getElementById('admin-movie-list')) loadAdminMovies();
    });
}

// ADD OR UPDATE MOVIE
const addMovieForm = document.getElementById('addMovieForm');
if (addMovieForm) {
    addMovieForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const statusMsg = document.getElementById('status-msg');
        statusMsg.innerText = "Saving...";
        statusMsg.style.color = "white";

        const editId = document.getElementById('edit_movie_id').value;

        const movieData = {
            title: document.getElementById('title').value,
            slug: document.getElementById('slug').value,
            description: document.getElementById('description').value,
            category: document.getElementById('category').value,
            poster_url: document.getElementById('poster_url').value,
            telegram_message_id: parseInt(document.getElementById('telegram_id').value),
            status: document.getElementById('status').value
        };

        try {
            if (editId) {
                // Update existing movie
                await db.collection('movies').doc(editId).update(movieData);
                statusMsg.innerText = "✅ Movie updated successfully!";
                cancelEdit(); // Reset form back to normal
            } else {
                // Add new movie
                await db.collection('movies').add(movieData);
                statusMsg.innerText = "✅ Movie added successfully!";
                addMovieForm.reset();
            }
            
            statusMsg.style.color = "#45a29e";
            loadAdminMovies();
            setTimeout(() => statusMsg.innerText = "", 3000);
        } catch (error) {
            statusMsg.innerText = "Error: " + error.message;
            statusMsg.style.color = "#e50914";
        }
    });
}

// LOAD MOVIES
async function loadAdminMovies() {
    const list = document.getElementById('admin-movie-list');
    if (!list) return;

    try {
        const snapshot = await db.collection('movies').get();
        if (snapshot.empty) {
            list.innerHTML = '<p>No movies found in the database.</p>';
            return;
        }

        let html = '<table style="width:100%; text-align:left; border-collapse: collapse;">';
        html += '<tr style="border-bottom: 1px solid #45a29e; color: #45a29e;"><th style="padding-bottom: 10px;">Title</th><th style="padding-bottom: 10px;">Category</th><th style="padding-bottom: 10px;">Status</th><th style="padding-bottom: 10px;">Action</th></tr>';
        
        snapshot.forEach(doc => {
            const movie = doc.data();
            const movieId = doc.id;
            
            html += `
                <tr style="border-bottom: 1px solid #333;">
                    <td style="padding: 15px 0;">${movie.title}</td>
                    <td style="padding: 15px 0;">${movie.category || 'N/A'}</td>
                    <td style="padding: 15px 0;">${movie.status}</td>
                    <td style="padding: 15px 0;">
                        <!-- NEW EDIT BUTTON -->
                        <button onclick="editMovie('${movieId}')" style="background-color: #f39c12; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 4px; font-weight: bold; margin-right: 5px;">Edit</button>
                        <button onclick="deleteMovie('${movieId}')" style="background-color: #e50914; color: white; border: none; padding: 6px 12px; cursor: pointer; border-radius: 4px; font-weight: bold;">Delete</button>
                    </td>
                </tr>
            `;
        });
        html += '</table>';
        list.innerHTML = html;
    } catch (error) {
        list.innerHTML = '<p style="color: #e50914;">Error loading movies: ' + error.message + '</p>';
    }
}

// EDIT MOVIE - Loads data into the form
window.editMovie = async function(movieId) {
    try {
        const doc = await db.collection('movies').doc(movieId).get();
        if (doc.exists) {
            const movie = doc.data();
            
            document.getElementById('edit_movie_id').value = movieId;
            document.getElementById('title').value = movie.title;
            document.getElementById('slug').value = movie.slug;
            document.getElementById('description').value = movie.description || '';
            document.getElementById('category').value = movie.category || 'Action';
            document.getElementById('poster_url').value = movie.poster_url;
            document.getElementById('telegram_id').value = movie.telegram_message_id;
            document.getElementById('status').value = movie.status;

            document.getElementById('formTitle').innerText = "Edit Movie";
            document.getElementById('submitBtn').innerText = "UPDATE MOVIE";
            document.getElementById('cancelBtn').style.display = "block";
            
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
        }
    } catch (error) {
        alert("Error loading movie details.");
    }
}

// CANCEL EDIT - Resets form to Add mode
window.cancelEdit = function() {
    document.getElementById('addMovieForm').reset();
    document.getElementById('edit_movie_id').value = '';
    document.getElementById('formTitle').innerText = "Add New Movie";
    document.getElementById('submitBtn').innerText = "SAVE MOVIE";
    document.getElementById('cancelBtn').style.display = "none";
}

// DELETE MOVIE
window.deleteMovie = async function(movieId) {
    if (confirm("Are you sure you want to delete this movie?")) {
        try {
            await db.collection('movies').doc(movieId).delete();
            loadAdminMovies();
        } catch (error) {
            alert("Error deleting movie: " + error.message);
        }
    }
}
