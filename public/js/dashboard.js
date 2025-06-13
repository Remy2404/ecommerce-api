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
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarClose = document.getElementById('sidebarClose');

    function toggleSidebar() {
        sidebar.classList.toggle('show');
        sidebarOverlay.classList.toggle('show');
        document.body.style.overflow = sidebar.classList.contains('show') ? 'hidden' : '';
    }

    function closeSidebar() {
        sidebar.classList.remove('show');
        sidebarOverlay.classList.remove('show');
        document.body.style.overflow = '';
    }

    sidebarToggle.addEventListener('click', toggleSidebar);
    
    if (sidebarClose) {
        sidebarClose.addEventListener('click', closeSidebar);
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    // Close sidebar when clicking on sidebar links on mobile
    const sidebarLinks = document.querySelectorAll('.sidebar .nav-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 768) {
                closeSidebar();
            }
        });
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
            closeSidebar();
        }
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
        loadDashboardStats();
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
        
        // Load stats even if user data fails
        loadDashboardStats();
    });

    // Function to load dashboard statistics
    function loadDashboardStats() {
        // Load cart items count
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const cartItemsCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);
        document.getElementById('cartItems').textContent = cartItemsCount;

        // Load orders count from demo orders or API
        const demoMode = localStorage.getItem('demo_mode') === 'true';
        
        if (demoMode) {
            const demoOrders = JSON.parse(localStorage.getItem('demo_orders') || '[]');
            document.getElementById('ordersCount').textContent = demoOrders.length;
        } else {
            // Try to fetch orders from API
            fetch('/api/orders', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.data && Array.isArray(data.data)) {
                    document.getElementById('ordersCount').textContent = data.data.length;
                }
            })
            .catch(error => {
                console.error('Error fetching orders:', error);
                // Fallback to demo orders if API fails
                const demoOrders = JSON.parse(localStorage.getItem('demo_orders') || '[]');
                document.getElementById('ordersCount').textContent = demoOrders.length;
            });
        }

        // Load wishlist items (placeholder - implement if you have wishlist feature)
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        document.getElementById('wishlistItems').textContent = wishlist.length;
    }
});