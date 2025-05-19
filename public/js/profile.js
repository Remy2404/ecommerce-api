// Public/js/profile.js
// Profile page JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Elements for display
    const userNameDisplay = document.getElementById('userNameDisplay');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileStatus = document.getElementById('profileStatus');
    const profileDate = document.getElementById('profileDate');

    // Form elements
    const inputName = document.getElementById('userName');
    const inputEmail = document.getElementById('userEmail');
    const inputPhone = document.getElementById('userPhone');
    const shipLine1 = document.getElementById('shippingAddressLine1');
    const shipLine2 = document.getElementById('shippingAddressLine2');
    const shipCity = document.getElementById('shippingCity');
    const shipPostal = document.getElementById('shippingPostalCode');
    const shipCountry = document.getElementById('shippingCountry');
    const sameAsBilling = document.getElementById('sameAsBilling');
    const billLine1 = document.getElementById('billingAddressLine1');
    const billLine2 = document.getElementById('billingAddressLine2');
    const billCity = document.getElementById('billingCity');
    const billPostal = document.getElementById('billingPostalCode');
    const billCountry = document.getElementById('billingCountry');

    // Fetch authenticated user data
    fetch('/api/user', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to fetch user data');
        return response.json();
    })
    .then(resp => {
        const user = resp.data.user;
        // Display navbar username
        if (userNameDisplay) userNameDisplay.textContent = user.name;
        // Profile header
        if (profileName) profileName.textContent = user.name;
        if (profileEmail) profileEmail.textContent = user.email;
        if (profileStatus) profileStatus.textContent = user.is_admin ? 'Admin' : 'User';
        if (profileDate) profileDate.textContent = new Date(user.created_at).toLocaleDateString();

        // Populate personal info form
        if (inputName) inputName.value = user.name;
        if (inputEmail) inputEmail.value = user.email;

        // Populate profile details if available
        const profile = user.profile || {};
        if (inputPhone) inputPhone.value = profile.phone_number || '';

        // Populate shipping address
        if (shipLine1) shipLine1.value = profile.address_line1 || '';
        if (shipLine2) shipLine2.value = profile.address_line2 || '';
        if (shipCity) shipCity.value = profile.city || '';
        if (shipPostal) shipPostal.value = profile.postal_code || '';
        if (shipCountry) shipCountry.value = profile.country || '';

        // Populate billing address
        if (billLine1) billLine1.value = profile.address_line1 || '';
        if (billLine2) billLine2.value = profile.address_line2 || '';
        if (billCity) billCity.value = profile.city || '';
        if (billPostal) billPostal.value = profile.postal_code || '';
        if (billCountry) billCountry.value = profile.country || '';

        // Same as billing checkbox handler
        if (sameAsBilling) {
            sameAsBilling.addEventListener('change', function() {
                if (this.checked) {
                    billLine1.value = shipLine1.value;
                    billLine2.value = shipLine2.value;
                    billCity.value = shipCity.value;
                    billPostal.value = shipPostal.value;
                    billCountry.value = shipCountry.value;
                }
            });
        }
    })
    .catch(error => {
        console.error('Error loading profile:', error);
    });

    // Logout function
    function handleLogout() {
        fetch('/api/logout', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } })
            .finally(() => {
                localStorage.removeItem('auth_token');
                window.location.href = 'login.html';
            });
    }

    // Attach logout handlers
    const logoutBtn = document.getElementById('logoutBtn');
    const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', e => { e.preventDefault(); handleLogout(); });
    if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener('click', e => { e.preventDefault(); handleLogout(); });
});
