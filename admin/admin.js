const { createClient } = supabase;
const supabaseClient = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

// LOGIN FUNCTION
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        errorMsg.innerText = "Login failed: " + error.message;
    } else {
        window.location.href = 'dashboard.html'; // Redirect to dashboard on success
    }
}

// LOGOUT FUNCTION
async function logout() {
    await supabaseClient.auth.signOut();
    window.location.href = 'index.html';
}

// PROTECT DASHBOARD FUNCTION
async function checkAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    // If there is no active session, kick them back to the login page
    if (!session) {
        window.location.href = 'index.html';
    }
}

// ADD MOVIE FUNCTION (Only runs if on the dashboard page)
const addMovieForm = document.getElementById('addMovieForm');
if (addMovieForm) {
    addMovieForm.addEventListener('submit', async function(e) {
        e.preventDefault(); // Stop the page from reloading
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

        const { error } = await supabaseClient
            .from('movies')
            .insert([movieData]);

        if (error) {
            statusMsg.innerText = "Error: " + error.message;
            statusMsg.style.color = "#e50914";
        } else {
            statusMsg.innerText = "✅ Movie added successfully!";
            statusMsg.style.color = "#45a29e";
            addMovieForm.reset(); // Clear the form
        }
    });
}