document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const successAlert = document.getElementById('successAlert');
    const errorAlert = document.getElementById('errorAlert');
    const userName = document.getElementById('userName');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const userEmail = document.getElementById('userEmail');
    const userPhone = document.getElementById('userPhone');
    const userAddress = document.getElementById('userAddress');
    const userCreated = document.getElementById('userCreated');
    const profileInfo = document.getElementById('profileInfo');
    
    // Function to handle logout
    function handleLogout() {
        // Show loading message
        successAlert.textContent = 'Logging out...';
        successAlert.style.display = 'block';
        
        // Send logout request to API
        fetch('/api/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            // Even if the server responds with an error, we'll log out locally
            localStorage.removeItem('auth_token');
            successAlert.textContent = 'Logged out successfully! Redirecting...';
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        })
        .catch(error => {
            console.error('Logout error:', error);
            // Still remove the token and redirect even if the server request fails
            localStorage.removeItem('auth_token');
            window.location.href = 'login.html';
        });
    }

    // Attach logout handler to both logout buttons
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        handleLogout();
    });
    
    document.getElementById('sidebarLogoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        handleLogout();
    });

    // Handle sidebar toggle on mobile
    document.getElementById('sidebarToggle').addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('show');
    });

    // Fetch user data
    fetch('/api/user', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        return response.json();
    })            .then(data => {
        // Display user information based on API response structure
        if (data.data && data.data.user) {
            const user = data.data.user;
            userName.textContent = user.name;
            userNameDisplay.textContent = user.name;
            userEmail.textContent = user.email;
            
            // Format date
            const createdDate = new Date(user.created_at);
            userCreated.textContent = createdDate.toLocaleDateString();
            
            // Display profile data if available
            if (user.profile) {
                const profile = user.profile;
                
                // Update phone if available
                if (profile.phone_number) {
                    userPhone.textContent = profile.phone_number;
                }
                
                // Build address string if components are available
                const addressParts = [];
                if (profile.address_line1) addressParts.push(profile.address_line1);
                if (profile.address_line2) addressParts.push(profile.address_line2);
                if (profile.city) addressParts.push(profile.city);
                if (profile.postal_code) addressParts.push(profile.postal_code);
                if (profile.country) addressParts.push(profile.country);
                
                if (addressParts.length > 0) {
                    userAddress.textContent = addressParts.join(', ');
                }
            }
            
            // Show profile section
            profileInfo.style.display = 'block';
        }
        
        // You can also fetch other user-specific data here like orders, cart items, etc.
    })
    .catch(error => {
        console.error('Error fetching user data:', error);
        errorAlert.textContent = 'Failed to load user data. Please try again later.';
        errorAlert.style.display = 'block';
        
        // If unauthorized, redirect to login
        if (error.message === 'Unauthorized') {
            localStorage.removeItem('auth_token');
            window.location.href = 'login.html';
        }
    });
});