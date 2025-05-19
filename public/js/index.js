document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const token = localStorage.getItem('auth_token');
    if (token) {
        // Update navigation for logged in users
        const navLinks = document.querySelector('#navbarNav');
        const authButtons = navLinks.querySelector('.d-flex');
        authButtons.innerHTML = `
            <a href="dashboard.html" class="btn btn-outline-light me-2">Dashboard</a>
            <button id="logoutBtn" class="btn btn-light">Logout</button>
        `;
        
        // Add logout functionality
        document.getElementById('logoutBtn').addEventListener('click', function() {
            fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(() => {
                localStorage.removeItem('auth_token');
                window.location.reload();
            })
            .catch(error => {
                console.error('Logout error:', error);
                localStorage.removeItem('auth_token');
                window.location.reload();
            });
        });
    }
});