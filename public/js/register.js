document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const successAlert = document.getElementById('successAlert');
    const errorAlert = document.getElementById('errorAlert');
    const registerSpinner = document.getElementById('registerSpinner');

    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show loading spinner
        registerSpinner.style.display = 'inline-block';
        
        // Hide any existing alerts
        successAlert.style.display = 'none';
        errorAlert.style.display = 'none';

        const formData = new FormData(registerForm);
        const userData = {};
        
        // Convert FormData to JSON
        formData.forEach((value, key) => {
            userData[key] = value;
        });

        // Send registration request
        fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(userData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Registration failed');
                });
            }
            return response.json();
        })                .then(data => {
            // Hide spinner
            registerSpinner.style.display = 'none';
            
            // Show success message
            successAlert.textContent = 'Registration successful! Redirecting to dashboard...';
            successAlert.style.display = 'block';
            
            // Store the token - adapt to your API response structure
            localStorage.setItem('auth_token', data.data.token.access_token);
            
            // Redirect to dashboard after successful registration
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        })
        .catch(error => {
            // Hide spinner
            registerSpinner.style.display = 'none';
            
            // Show error message
            errorAlert.textContent = error.message || 'An error occurred during registration';
            errorAlert.style.display = 'block';
            console.error('Registration error:', error);
        });
    });
});