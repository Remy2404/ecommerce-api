document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const token = localStorage.getItem('auth_token');
    if (token) {
        window.location.href = 'dashboard.html';
    }

    const loginForm = document.getElementById('loginForm');
    const successAlert = document.getElementById('successAlert');
    const errorAlert = document.getElementById('errorAlert');
    const loginSpinner = document.getElementById('loginSpinner');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show loading spinner
        loginSpinner.style.display = 'inline-block';
        
        // Hide any existing alerts
        successAlert.style.display = 'none';
        errorAlert.style.display = 'none';

        const formData = new FormData(loginForm);
        const loginData = {};
        
        // Convert FormData to JSON
        formData.forEach((value, key) => {
            loginData[key] = value;
        });

        // Send login request
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(loginData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Login failed');
                });
            }
            return response.json();
        })                .then(data => {
            // Hide spinner
            loginSpinner.style.display = 'none';
            
            // Show success message
            successAlert.textContent = 'Login successful! Redirecting to dashboard...';
            successAlert.style.display = 'block';
            
            // Store token in localStorage - adapt to your API response structure
            localStorage.setItem('auth_token', data.data.token.access_token);
            
            // Redirect to dashboard after successful login
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        })
        .catch(error => {
            // Hide spinner
            loginSpinner.style.display = 'none';
            
            // Show error message
            errorAlert.textContent = error.message || 'An error occurred during login';
            errorAlert.style.display = 'block';
            console.error('Login error:', error);
        });
    });
});