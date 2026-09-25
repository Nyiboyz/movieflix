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
        } catch (error) {
            statusMsg.innerText = "Error: " + error.message;
            statusMsg.style.color = "#e50914";
        }
    });
}
