// My Orders page JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // DOM elements
    const successAlert = document.getElementById('successAlert');
    const errorAlert = document.getElementById('errorAlert');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    const ordersList = document.getElementById('ordersList');
    const paginationContainer = document.getElementById('pagination');
    
    // Filter elements
    const searchOrders = document.getElementById('searchOrders');
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    const sortOrders = document.getElementById('sortOrders');
    const refreshOrdersBtn = document.getElementById('refreshOrdersBtn');
    
    // Modal elements
    const orderDetailModal = new bootstrap.Modal(document.getElementById('orderDetailModal'));
    const orderDetailContent = document.getElementById('orderDetailContent');
    const reorderModal = new bootstrap.Modal(document.getElementById('reorderModal'));
    const reorderBtn = document.getElementById('reorderBtn');
    const confirmReorderBtn = document.getElementById('confirmReorderBtn');

    // Pagination state
    let currentPage = 1;
    let lastPage = 1;
    let totalOrders = 0;
    let currentOrderForReorder = null;

    // Load user info
    loadUserInfo();

    // Event listeners
    if (refreshOrdersBtn) {
        refreshOrdersBtn.addEventListener('click', () => loadOrders());
    }
    
    if (searchOrders) {
        searchOrders.addEventListener('input', debounce(() => {
            currentPage = 1;
            loadOrders();
        }, 500));
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            currentPage = 1;
            loadOrders();
        });
    }
    
    if (dateFilter) {
        dateFilter.addEventListener('change', () => {
            currentPage = 1;
            loadOrders();
        });
    }
    
    if (sortOrders) {
        sortOrders.addEventListener('change', () => loadOrders());
    }

    // Logout handlers
    const logoutBtn = document.getElementById('logoutBtn');
    const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    if (sidebarLogoutBtn) {
        sidebarLogoutBtn.addEventListener('click', handleLogout);
    }

    // Reorder functionality
    if (reorderBtn) {
        reorderBtn.addEventListener('click', () => {
            if (currentOrderForReorder) {
                orderDetailModal.hide();
                reorderModal.show();
            }
        });
    }

    if (confirmReorderBtn) {
        confirmReorderBtn.addEventListener('click', () => {
            if (currentOrderForReorder) {
                reorderItems(currentOrderForReorder);
            }
        });
    }

    // Load user information
    function loadUserInfo() {
        fetch('/api/user', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch user info');
            return response.json();
        })
        .then(data => {
            if (data.data && data.data.user && userNameDisplay) {
                userNameDisplay.textContent = data.data.user.name;
            }
            loadOrders();
        })
        .catch(error => {
            console.error('Error loading user info:', error);
            if (errorAlert) {
                showAlert(errorAlert, 'Failed to load user information');
            }
            loadOrders(); // Still try to load orders
        });
    }

    // Load orders from API or demo mode
    function loadOrders() {
        showLoading();

        // Check if we're in demo mode (fallback if API fails)
        const isDemoMode = localStorage.getItem('demo_mode') === 'true';
        
        if (isDemoMode) {
            console.log("Loading orders in demo mode");
            // Get demo orders from localStorage
            const demoOrders = JSON.parse(localStorage.getItem('demo_orders') || '[]');
            
            // Add a small delay to simulate API call
            setTimeout(() => {
                hideLoading();
                
                if (demoOrders.length > 0) {
                    displayOrders(demoOrders);
                    
                    // Create mock pagination
                    updatePagination({
                        current_page: 1,
                        last_page: 1,
                        total: demoOrders.length
                    });
                } else {
                    showEmptyState();
                }
            }, 500);
            
            return;
        }

        // Normal API mode - Build query parameters
        const params = new URLSearchParams({
            page: currentPage,
            per_page: 10
        });

        if (searchOrders && searchOrders.value.trim()) {
            params.append('search', searchOrders.value.trim());
        }
        if (statusFilter && statusFilter.value) {
            params.append('status', statusFilter.value);
        }
        if (dateFilter && dateFilter.value) {
            params.append('date_filter', dateFilter.value);
        }
        if (sortOrders && sortOrders.value) {
            const [field, direction] = sortOrders.value.split('_');
            params.append('sort_by', field);
            params.append('sort_direction', direction);
        }

        console.log("Loading orders from API endpoint");
        fetch(`/api/my-orders?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            hideLoading();
            console.log("Orders loaded successfully:", data);
            displayOrders(data.data || []);
            updatePagination(data.meta || data.pagination || {});
        })
        .catch(error => {
            hideLoading();
            console.error('Error loading orders:', error);
            
            // Check if we have demo orders as fallback
            const demoOrders = JSON.parse(localStorage.getItem('demo_orders') || '[]');
            if (demoOrders.length > 0) {
                console.log("Falling back to demo orders");
                localStorage.setItem('demo_mode', 'true');
                displayOrders(demoOrders);
                
                // Show a message about demo mode
                if (successAlert) {
                    showAlert(successAlert, 'Using demo orders as API connection failed. Your orders are saved locally.');
                }
            } else {
                if (errorAlert) {
                    showAlert(errorAlert, 'Failed to load orders. Please try again.');
                }
                showEmptyState();
            }
        });
    }

    // Display orders in the UI
    function displayOrders(orders) {
        if (!orders || orders.length === 0) {
            showEmptyState();
            return;
        }

        hideEmptyState();
        
        // Check if we should highlight a newly created order
        const lastOrderId = localStorage.getItem('last_order_id');
        
        ordersList.innerHTML = orders.map(order => {
            // Add highlight class if this is the recently created order
            const isNewOrder = lastOrderId && order.id.toString() === lastOrderId.toString();
            const highlightClass = isNewOrder ? 'new-order-highlight' : '';
            
            return createOrderCard(order, highlightClass);
        }).join('');
        
        // Clear the last order ID from localStorage once displayed
        if (lastOrderId) {
            localStorage.removeItem('last_order_id');
            
            // If we found a highlighted order, show a success message
            if (ordersList.querySelector('.new-order-highlight') && successAlert) {
                showAlert(successAlert, 'Your order was successfully created!');
            }
        }
        
        // Add event listeners to order cards
        addOrderEventListeners();
    }

    // Create HTML for a single order card
    function createOrderCard(order, additionalClass = '') {
        const orderDate = new Date(order.ordered_at || order.created_at).toLocaleDateString();
        const statusBadge = getStatusBadge(order.status);
        const products = order.items || order.products || [];
        
        return `
            <div class="order-card ${additionalClass}" data-order-id="${order.id}">
                <div class="order-header">
                    <div class="row align-items-center">
                        <div class="col-md-3">
                            <strong>Order #${order.order_number || order.id}</strong>
                        </div>
                        <div class="col-md-2">
                            <small class="text-muted">Date</small><br>
                            ${orderDate}
                        </div>
                        <div class="col-md-2">
                            <small class="text-muted">Status</small><br>
                            ${statusBadge}
                        </div>
                        <div class="col-md-2">
                            <small class="text-muted">Total</small><br>
                            <strong>$${parseFloat(order.total_amount).toFixed(2)}</strong>
                        </div>
                        <div class="col-md-3">
                            <div class="order-actions">
                                <button class="btn btn-outline-primary btn-sm view-order" data-order-id="${order.id}">
                                    <i class="bi bi-eye"></i> View Details
                                </button>
                                ${order.status !== 'cancelled' ? `
                                    <button class="btn btn-outline-secondary btn-sm reorder-quick" data-order-id="${order.id}">
                                        <i class="bi bi-arrow-repeat"></i> Reorder
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="order-content">
                    <div class="row">
                        <div class="col-md-8">
                            <h6 class="mb-3">Items (${products.length})</h6>
                            ${products.slice(0, 3).map(item => createProductItem(item)).join('')}
                            ${products.length > 3 ? `
                                <div class="text-muted small">
                                    ... and ${products.length - 3} more item(s)
                                </div>
                            ` : ''}
                        </div>
                        <div class="col-md-4">
                            ${order.shipping_address_line1 ? `
                                <h6 class="mb-2">Shipping Address</h6>
                                <small class="text-muted">
                                    ${order.shipping_address_line1}<br>
                                    ${order.shipping_city || ''}, ${order.shipping_postal_code || ''}<br>
                                    ${order.shipping_country || ''}
                                </small>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Create HTML for a product item within an order
    function createProductItem(item) {
        const product = item.product || item;
        const quantity = item.quantity || item.pivot?.quantity || 1;
        const price = item.price_at_purchase || item.pivot?.price_at_purchase || product.price;
        const productName = item.product_name_at_purchase || item.pivot?.product_name_at_purchase || product.name;
        
        return `
            <div class="product-item">
                <div class="row align-items-center">
                    <div class="col-2">
                        ${product.image_url ? 
                            `<img src="${product.image_url}" alt="${productName}" class="product-image">` :
                            `<div class="product-placeholder"><i class="bi bi-image"></i></div>`
                        }
                    </div>
                    <div class="col-6">
                        <div class="fw-medium">${productName}</div>
                        ${product.category ? `<small class="text-muted">${product.category.name}</small>` : ''}
                    </div>
                    <div class="col-2 text-center">
                        <span class="fw-medium">×${quantity}</span>
                    </div>
                    <div class="col-2 text-end">
                        <strong>$${parseFloat(price * quantity).toFixed(2)}</strong>
                    </div>
                </div>
            </div>
        `;
    }

    // Get status badge HTML
    function getStatusBadge(status) {
        const statusClasses = {
            pending: 'bg-warning text-dark',
            paid: 'bg-info text-white',
            processing: 'bg-primary text-white',
            shipped: 'bg-secondary text-white',
            delivered: 'bg-success text-white',
            cancelled: 'bg-danger text-white'
        };

        const className = statusClasses[status] || 'bg-secondary text-white';
        return `<span class="badge ${className} status-badge">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
    }

    // Add event listeners to order elements
    function addOrderEventListeners() {
        // View order details
        document.querySelectorAll('.view-order').forEach(btn => {
            btn.addEventListener('click', function() {
                const orderId = this.getAttribute('data-order-id');
                showOrderDetails(orderId);
            });
        });

        // Quick reorder
        document.querySelectorAll('.reorder-quick').forEach(btn => {
            btn.addEventListener('click', function() {
                const orderId = this.getAttribute('data-order-id');
                quickReorder(orderId);
            });
        });
    }

    // Show detailed view of an order
    function showOrderDetails(orderId) {
        // Check if we're in demo mode
        const isDemoMode = localStorage.getItem('demo_mode') === 'true';
        
        if (isDemoMode) {
            // Get order from demo orders
            const demoOrders = JSON.parse(localStorage.getItem('demo_orders') || '[]');
            const order = demoOrders.find(o => o.id.toString() === orderId.toString());
            
            if (order) {
                currentOrderForReorder = order;
                displayOrderDetails(order);
                orderDetailModal.show();
            } else {
                if (errorAlert) {
                    showAlert(errorAlert, 'Order not found');
                }
            }
            return;
        }

        // API mode
        fetch(`/api/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch order details');
            return response.json();
        })
        .then(data => {
            const order = data.data;
            currentOrderForReorder = order;
            displayOrderDetails(order);
            orderDetailModal.show();
        })
        .catch(error => {
            console.error('Error loading order details:', error);
            if (errorAlert) {
                showAlert(errorAlert, 'Failed to load order details');
            }
        });
    }

    // Display order details in modal
    function displayOrderDetails(order) {
        const orderDate = new Date(order.ordered_at || order.created_at).toLocaleDateString();
        const products = order.items || order.products || [];
        
        orderDetailContent.innerHTML = `
            <div class="row mb-4">
                <div class="col-md-6">
                    <h6>Order Information</h6>
                    <p><strong>Order #:</strong> ${order.order_number || order.id}</p>
                    <p><strong>Date:</strong> ${orderDate}</p>
                    <p><strong>Status:</strong> ${getStatusBadge(order.status)}</p>
                    <p><strong>Payment:</strong> ${order.payment_method || 'N/A'}</p>
                </div>
                <div class="col-md-6">
                    ${order.shipping_address_line1 ? `
                        <h6>Shipping Address</h6>
                        <p class="mb-1">${order.shipping_address_line1}</p>
                        ${order.shipping_address_line2 ? `<p class="mb-1">${order.shipping_address_line2}</p>` : ''}
                        <p class="mb-1">${order.shipping_city || ''}, ${order.shipping_postal_code || ''}</p>
                        <p>${order.shipping_country || ''}</p>
                    ` : ''}
                </div>
            </div>
            
            <h6>Order Items</h6>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(item => {
                            const product = item.product || item;
                            const quantity = item.quantity || item.pivot?.quantity || 1;
                            const price = item.price_at_purchase || item.pivot?.price_at_purchase || product.price;
                            const productName = item.product_name_at_purchase || item.pivot?.product_name_at_purchase || product.name;
                            
                            return `
                                <tr>
                                    <td>
                                        <div class="d-flex align-items-center">
                                            ${product.image_url ? 
                                                `<img src="${product.image_url}" alt="${productName}" class="product-image me-2">` :
                                                `<div class="product-placeholder me-2"><i class="bi bi-image"></i></div>`
                                            }
                                            <div>
                                                <div class="fw-medium">${productName}</div>
                                                ${product.category ? `<small class="text-muted">${product.category.name}</small>` : ''}
                                            </div>
                                        </div>
                                    </td>
                                    <td>${quantity}</td>
                                    <td>$${parseFloat(price).toFixed(2)}</td>
                                    <td><strong>$${parseFloat(price * quantity).toFixed(2)}</strong></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="order-summary">
                <div class="row">
                    <div class="col-md-6 offset-md-6">
                        <div class="d-flex justify-content-between">
                            <span>Total:</span>
                            <strong>$${parseFloat(order.total_amount).toFixed(2)}</strong>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Show reorder button for non-cancelled orders
        if (reorderBtn) {
            if (order.status !== 'cancelled') {
                reorderBtn.style.display = 'inline-block';
            } else {
                reorderBtn.style.display = 'none';
            }
        }
    }

    // Quick reorder functionality
    function quickReorder(orderId) {
        // Check if we're in demo mode
        const isDemoMode = localStorage.getItem('demo_mode') === 'true';
        
        if (isDemoMode) {
            // Get order from demo orders
            const demoOrders = JSON.parse(localStorage.getItem('demo_orders') || '[]');
            const order = demoOrders.find(o => o.id.toString() === orderId.toString());
            
            if (order) {
                currentOrderForReorder = order;
                reorderModal.show();
            } else {
                if (errorAlert) {
                    showAlert(errorAlert, 'Order not found');
                }
            }
            return;
        }

        // API mode
        fetch(`/api/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch order details');
            return response.json();
        })
        .then(data => {
            currentOrderForReorder = data.data;
            reorderModal.show();
        })
        .catch(error => {
            console.error('Error loading order for reorder:', error);
            if (errorAlert) {
                showAlert(errorAlert, 'Failed to load order details for reorder');
            }
        });
    }

    // Reorder items - add to cart
    function reorderItems(order) {
        const products = order.items || order.products || [];
        const promises = products.map(item => {
            const product = item.product || item;
            const quantity = item.quantity || item.pivot?.quantity || 1;
            
            return fetch('/api/cart/items', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    product_id: product.id,
                    quantity: quantity
                })
            });
        });

        Promise.all(promises)
            .then(responses => {
                const failedItems = responses.filter(r => !r.ok);
                if (failedItems.length === 0) {
                    reorderModal.hide();
                    if (successAlert) {
                        showAlert(successAlert, 'All items have been added to your cart!');
                    }
                } else if (failedItems.length === responses.length) {
                    if (errorAlert) {
                        showAlert(errorAlert, 'Failed to add items to cart. Please try again.');
                    }
                } else {
                    reorderModal.hide();
                    if (successAlert) {
                        showAlert(successAlert, `${responses.length - failedItems.length} out of ${responses.length} items added to cart.`);
                    }
                }
            })
            .catch(error => {
                console.error('Error reordering items:', error);
                if (errorAlert) {
                    showAlert(errorAlert, 'Failed to add items to cart');
                }
            });
    }

    // Update pagination
    function updatePagination(paginationData) {
        if (!paginationData || !paginationContainer) return;
        
        currentPage = paginationData.current_page || 1;
        lastPage = paginationData.last_page || paginationData.total_pages || 1;
        totalOrders = paginationData.total || 0;

        if (lastPage <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = '<ul class="pagination">';
        
        // Previous button
        paginationHTML += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
            </li>
        `;
        
        // Page numbers
        for (let i = Math.max(1, currentPage - 2); i <= Math.min(lastPage, currentPage + 2); i++) {
            paginationHTML += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }
        
        // Next button
        paginationHTML += `
            <li class="page-item ${currentPage === lastPage ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
            </li>
        `;
        
        paginationHTML += '</ul>';
        paginationContainer.innerHTML = paginationHTML;
        
        // Add pagination event listeners
        document.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                if (!this.parentElement.classList.contains('disabled')) {
                    const page = parseInt(this.getAttribute('data-page'));
                    if (page !== currentPage && page >= 1 && page <= lastPage) {
                        currentPage = page;
                        loadOrders();
                    }
                }
            });
        });
    }

    // Utility functions
    function showLoading() {
        if (loadingState) loadingState.style.display = 'block';
        if (emptyState) emptyState.style.display = 'none';
        if (ordersList) ordersList.innerHTML = '';
        if (paginationContainer) paginationContainer.innerHTML = '';
    }

    function hideLoading() {
        if (loadingState) loadingState.style.display = 'none';
    }

    function showEmptyState() {
        if (emptyState) emptyState.style.display = 'block';
        if (ordersList) ordersList.innerHTML = '';
        if (paginationContainer) paginationContainer.innerHTML = '';
    }

    function hideEmptyState() {
        if (emptyState) emptyState.style.display = 'none';
    }

    function showAlert(alertElement, message) {
        if (!alertElement) return;
        
        const messageSpan = alertElement.querySelector('span') || alertElement;
        messageSpan.textContent = message;
        alertElement.style.display = 'block';
        
        // Scroll to alert if it's not visible
        if (alertElement.getBoundingClientRect().top < 0) {
            alertElement.scrollIntoView({ behavior: 'smooth' });
        }
        
        setTimeout(() => {
            alertElement.style.display = 'none';
        }, 5000);
    }

    function handleLogout() {
        fetch('/api/logout', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .finally(() => {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('demo_mode');
            localStorage.removeItem('demo_orders');
            localStorage.removeItem('last_order_id');
            window.location.href = 'login.html';
        });
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
});