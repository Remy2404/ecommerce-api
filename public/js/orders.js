// Orders page JavaScript functionality
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
    const searchInput = document.getElementById('searchOrders');
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    const sortOrders = document.getElementById('sortOrders');
    const ordersTableBody = document.getElementById('ordersTableBody');
    const paginationContainer = document.getElementById('pagination');
    const exportOrdersBtn = document.getElementById('exportOrdersBtn');
    
    // Date range elements
    const dateRangeContainer = document.getElementById('dateRangeContainer');
    const dateFrom = document.getElementById('dateFrom');
    const dateTo = document.getElementById('dateTo');
    const applyDateFilter = document.getElementById('applyDateFilter');
    
    // Statistics elements
    const totalOrdersElement = document.getElementById('totalOrders');
    const totalRevenueElement = document.getElementById('totalRevenue');
    const pendingShipmentElement = document.getElementById('pendingShipment');
    const uniqueCustomersElement = document.getElementById('uniqueCustomers');

    // Order details modal
    const orderDetailModal = new bootstrap.Modal(document.getElementById('orderDetailModal'));
    const viewOrderId = document.getElementById('viewOrderId');
    const viewOrderDate = document.getElementById('viewOrderDate');
    const viewOrderStatus = document.getElementById('viewOrderStatus');
    const viewCustomerName = document.getElementById('viewCustomerName');
    const viewCustomerEmail = document.getElementById('viewCustomerEmail');
    const viewCustomerPhone = document.getElementById('viewCustomerPhone');
    const viewShippingAddress = document.getElementById('viewShippingAddress');
    const viewBillingAddress = document.getElementById('viewBillingAddress');
    const orderItemsBody = document.getElementById('orderItemsBody');
    const viewSubtotal = document.getElementById('viewSubtotal');
    const viewShipping = document.getElementById('viewShipping');
    const viewTax = document.getElementById('viewTax');
    const viewTotal = document.getElementById('viewTotal');
    const updateOrderStatus = document.getElementById('updateOrderStatus');
    const saveStatusBtn = document.getElementById('saveStatusBtn');
    const printOrderBtn = document.getElementById('printOrderBtn');

    // Pagination state
    let currentPage = 1;
    let lastPage = 1;
    let totalOrders = 0;
    let ordersPerPage = 10;

    // Function to load orders with filtering, sorting, and pagination
    function loadOrders() {
        // Show loading state
        ordersTableBody.innerHTML = '<tr><td colspan="6" class="text-center"><div class="loading-spinner"></div> Loading orders...</td></tr>';
        
        // Build query parameters
        const searchTerm = searchInput.value.trim();
        const status = statusFilter.value;
        const dateOption = dateFilter.value;
        const sortOption = sortOrders.value;
        
        let endpoint = `/api/orders?page=${currentPage}`;
        
        if (searchTerm) {
            endpoint += `&search=${encodeURIComponent(searchTerm)}`;
        }
        
        if (status) {
            endpoint += `&status=${status}`;
        }
        
        // Add date filtering parameters
        if (dateOption && dateOption !== 'custom') {
            endpoint += `&date_filter=${dateOption}`;
        } else if (dateOption === 'custom' && dateFrom.value && dateTo.value) {
            endpoint += `&date_from=${dateFrom.value}&date_to=${dateTo.value}`;
        }
        
        // Add sorting parameters
        if (sortOption) {
            const [field, direction] = sortOption.split('_');
            endpoint += `&sort_by=${field}&sort_direction=${direction || 'desc'}`;
        }
        
        fetch(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }
            return response.json();
        })
        .then(data => {
            // Update pagination state
            currentPage = data.meta.current_page;
            lastPage = data.meta.last_page;
            totalOrders = data.meta.total;
            
            // Update statistics
            if (data.meta.statistics) {
                const stats = data.meta.statistics;
                totalOrdersElement.textContent = stats.total_orders || 0;
                totalRevenueElement.textContent = `$${parseFloat(stats.total_revenue || 0).toFixed(2)}`;
                pendingShipmentElement.textContent = stats.pending_shipment || 0;
                uniqueCustomersElement.textContent = stats.unique_customers || 0;
            }
            
            if (data.data.length === 0) {
                ordersTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No orders found</td></tr>';
                paginationContainer.innerHTML = '';
                return;
            }
            
            // Render orders
            let tableContent = '';
            data.data.forEach(order => {
                const orderDate = new Date(order.order_date);
                const formattedDate = orderDate.toLocaleDateString() + ' ' + orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                let statusBadgeClass = '';
                switch (order.status.toLowerCase()) {
                    case 'pending':
                        statusBadgeClass = 'status-pending';
                        break;
                    case 'paid':
                        statusBadgeClass = 'status-paid';
                        break;
                    case 'processing':
                        statusBadgeClass = 'status-processing';
                        break;
                    case 'shipped':
                        statusBadgeClass = 'status-shipped';
                        break;
                    case 'delivered':
                        statusBadgeClass = 'status-delivered';
                        break;
                    case 'cancelled':
                        statusBadgeClass = 'status-cancelled';
                        break;
                    default:
                        statusBadgeClass = 'bg-secondary';
                }
                
                tableContent += `
                <tr>
                    <td>#${order.id}</td>
                    <td>${order.user ? order.user.name : 'Unknown'}</td>
                    <td>${formattedDate}</td>
                    <td>$${parseFloat(order.total_amount).toFixed(2)}</td>
                    <td><span class="badge order-status ${statusBadgeClass}">${order.status}</span></td>
                    <td class="order-actions">
                        <button class="btn btn-sm btn-primary view-order" data-id="${order.id}">
                            <i class="bi bi-eye"></i> View
                        </button>
                    </td>
                </tr>
                `;
            });
            
            ordersTableBody.innerHTML = tableContent;
            
            // Set up pagination
            renderPagination();
            
            // Add event listeners to the view buttons
            document.querySelectorAll('.view-order').forEach(button => {
                button.addEventListener('click', function() {
                    const orderId = this.getAttribute('data-id');
                    viewOrderDetails(orderId);
                });
            });
        })
        .catch(error => {
            console.error('Error loading orders:', error);
            ordersTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading orders. Please try again.</td></tr>';
            showAlert(errorAlert, 'Failed to load orders. Please try again later.');
        });
    }

    // Function to render pagination controls
    function renderPagination() {
        if (lastPage <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        
        let paginationHTML = '<ul class="pagination">';
        
        // Previous button
        paginationHTML += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous">
                    <span aria-hidden="true">&laquo;</span>
                </a>
            </li>
        `;
        
        // Page numbers
        for (let i = 1; i <= lastPage; i++) {
            if (
                i === 1 || // First page
                i === lastPage || // Last page
                (i >= currentPage - 1 && i <= currentPage + 1) // Pages around current
            ) {
                paginationHTML += `
                    <li class="page-item ${i === currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                    </li>
                `;
            } else if (
                i === currentPage - 2 ||
                i === currentPage + 2
            ) {
                paginationHTML += `
                    <li class="page-item disabled">
                        <span class="page-link">...</span>
                    </li>
                `;
            }
        }
        
        // Next button
        paginationHTML += `
            <li class="page-item ${currentPage === lastPage ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next">
                    <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
        `;
        
        paginationHTML += '</ul>';
        paginationContainer.innerHTML = paginationHTML;
        
        // Add event listeners to pagination links
        document.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                if (!this.parentElement.classList.contains('disabled')) {
                    const page = parseInt(this.getAttribute('data-page'));
                    if (page !== currentPage) {
                        currentPage = page;
                        loadOrders();
                    }
                }
            });
        });
    }

    // Function to view order details
    function viewOrderDetails(orderId) {
        fetch(`/api/orders/${orderId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch order details');
            }
            return response.json();
        })
        .then(data => {
            const order = data.data;
            
            // Set order information
            viewOrderId.textContent = order.id;
            
            const orderDate = new Date(order.order_date);
            viewOrderDate.textContent = orderDate.toLocaleDateString() + ' ' + orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            // Set status badge class
            viewOrderStatus.textContent = order.status;
            viewOrderStatus.className = 'badge order-status';
            switch (order.status.toLowerCase()) {
                case 'pending':
                    viewOrderStatus.classList.add('status-pending');
                    break;
                case 'paid':
                    viewOrderStatus.classList.add('status-paid');
                    break;
                case 'processing':
                    viewOrderStatus.classList.add('status-processing');
                    break;
                case 'shipped':
                    viewOrderStatus.classList.add('status-shipped');
                    break;
                case 'delivered':
                    viewOrderStatus.classList.add('status-delivered');
                    break;
                case 'cancelled':
                    viewOrderStatus.classList.add('status-cancelled');
                    break;
                default:
                    viewOrderStatus.classList.add('bg-secondary');
            }
            
            // Set customer information
            if (order.user) {
                viewCustomerName.textContent = order.user.name;
                viewCustomerEmail.textContent = order.user.email;
                viewCustomerPhone.textContent = order.user.profile && order.user.profile.phone_number 
                    ? order.user.profile.phone_number 
                    : 'Not provided';
            } else {
                viewCustomerName.textContent = 'Guest';
                viewCustomerEmail.textContent = 'Not available';
                viewCustomerPhone.textContent = 'Not available';
            }
            
            // Set address information
            viewShippingAddress.textContent = order.shipping_address || 'Not provided';
            viewBillingAddress.textContent = order.billing_address || 'Same as shipping address';
            
            // Set the current status in the dropdown
            updateOrderStatus.value = order.status.toLowerCase();
            
            // Render order items
            let itemsContent = '';
            let subtotal = 0;
            
            if (order.order_items && order.order_items.length > 0) {
                order.order_items.forEach(item => {
                    const lineTotal = item.price_at_purchase * item.quantity;
                    subtotal += lineTotal;
                    
                    itemsContent += `
                    <tr>
                        <td>
                            <div class="d-flex align-items-center">
                                ${item.product && item.product.image_url 
                                    ? `<img src="${item.product.image_url}" alt="${item.product_name_at_purchase}" class="order-item-image">`
                                    : `<div class="order-item-image d-flex align-items-center justify-content-center bg-light"><i class="bi bi-image"></i></div>`
                                }
                                <span class="order-item-name">${item.product_name_at_purchase}</span>
                            </div>
                        </td>
                        <td>$${parseFloat(item.price_at_purchase).toFixed(2)}</td>
                        <td>${item.quantity}</td>
                        <td class="text-end">$${parseFloat(lineTotal).toFixed(2)}</td>
                    </tr>
                    `;
                });
            } else {
                itemsContent = '<tr><td colspan="4" class="text-center">No items in this order</td></tr>';
            }
            
            orderItemsBody.innerHTML = itemsContent;
            
            // Set totals
            viewSubtotal.textContent = `$${parseFloat(subtotal).toFixed(2)}`;
            
            // Check if shipping and tax are available
            if (order.shipping_cost && parseFloat(order.shipping_cost) > 0) {
                document.getElementById('viewShippingRow').style.display = '';
                viewShipping.textContent = `$${parseFloat(order.shipping_cost).toFixed(2)}`;
            } else {
                document.getElementById('viewShippingRow').style.display = 'none';
            }
            
            if (order.tax_amount && parseFloat(order.tax_amount) > 0) {
                document.getElementById('viewTaxRow').style.display = '';
                viewTax.textContent = `$${parseFloat(order.tax_amount).toFixed(2)}`;
            } else {
                document.getElementById('viewTaxRow').style.display = 'none';
            }
            
            viewTotal.textContent = `$${parseFloat(order.total_amount).toFixed(2)}`;
            
            // Show the modal
            orderDetailModal.show();
            
            // Set the order ID for the status update function
            saveStatusBtn.setAttribute('data-order-id', order.id);
        })
        .catch(error => {
            console.error('Error fetching order details:', error);
            showAlert(errorAlert, 'Failed to load order details. Please try again.');
        });
    }

    // Function to update order status
    function updateStatus(orderId, newStatus) {
        fetch(`/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Failed to update order status');
                });
            }
            return response.json();
        })
        .then(data => {
            // Update the status badge in the modal
            viewOrderStatus.textContent = newStatus;
            viewOrderStatus.className = 'badge order-status';
            
            switch (newStatus.toLowerCase()) {
                case 'pending':
                    viewOrderStatus.classList.add('status-pending');
                    break;
                case 'paid':
                    viewOrderStatus.classList.add('status-paid');
                    break;
                case 'processing':
                    viewOrderStatus.classList.add('status-processing');
                    break;
                case 'shipped':
                    viewOrderStatus.classList.add('status-shipped');
                    break;
                case 'delivered':
                    viewOrderStatus.classList.add('status-delivered');
                    break;
                case 'cancelled':
                    viewOrderStatus.classList.add('status-cancelled');
                    break;
                default:
                    viewOrderStatus.classList.add('bg-secondary');
            }
            
            // Show success message
            showAlert(successAlert, 'Order status updated successfully!');
            
            // Reload orders to update the table
            loadOrders();
        })
        .catch(error => {
            console.error('Error updating order status:', error);
            showAlert(errorAlert, `Failed to update order status: ${error.message}`);
        });
    }

    // Function to export orders
    function exportOrders() {
        // Build query parameters based on current filters
        const searchTerm = searchInput.value.trim();
        const status = statusFilter.value;
        const dateOption = dateFilter.value;
        
        let endpoint = '/api/orders/export';
        let queryParams = [];
        
        if (searchTerm) {
            queryParams.push(`search=${encodeURIComponent(searchTerm)}`);
        }
        
        if (status) {
            queryParams.push(`status=${status}`);
        }
        
        // Add date filtering parameters
        if (dateOption && dateOption !== 'custom') {
            queryParams.push(`date_filter=${dateOption}`);
        } else if (dateOption === 'custom' && dateFrom.value && dateTo.value) {
            queryParams.push(`date_from=${dateFrom.value}`);
            queryParams.push(`date_to=${dateTo.value}`);
        }
        
        if (queryParams.length > 0) {
            endpoint += '?' + queryParams.join('&');
        }
        
        // Show loading message
        exportOrdersBtn.disabled = true;
        exportOrdersBtn.innerHTML = '<div class="loading-spinner"></div> Exporting...';
        
        // Request CSV file
        fetch(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/csv',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to export orders');
            }
            return response.blob();
        })
        .then(blob => {
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            
            // Generate filename with current date
            const date = new Date();
            const formattedDate = date.toISOString().split('T')[0];
            a.download = `orders-export-${formattedDate}.csv`;
            
            // Trigger download
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            // Reset button
            exportOrdersBtn.disabled = false;
            exportOrdersBtn.innerHTML = '<i class="bi bi-download"></i> Export';
            
            showAlert(successAlert, 'Orders exported successfully!');
        })
        .catch(error => {
            console.error('Error exporting orders:', error);
            showAlert(errorAlert, 'Failed to export orders. Please try again later.');
            
            // Reset button
            exportOrdersBtn.disabled = false;
            exportOrdersBtn.innerHTML = '<i class="bi bi-download"></i> Export';
        });
    }

    // Function to print order details
    function printOrder() {
        window.print();
    }

    // Function to show alert message
    function showAlert(alertElement, message) {
        alertElement.textContent = message;
        alertElement.style.display = 'block';
        
        setTimeout(() => {
            alertElement.style.display = 'none';
        }, 5000);
    }

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

    // Event Listeners
    saveStatusBtn.addEventListener('click', function() {
        const orderId = this.getAttribute('data-order-id');
        const newStatus = updateOrderStatus.value;
        updateStatus(orderId, newStatus);
    });

    printOrderBtn.addEventListener('click', printOrder);
    
    exportOrdersBtn.addEventListener('click', exportOrders);

    // Date filter change handler
    dateFilter.addEventListener('change', function() {
        if (this.value === 'custom') {
            dateRangeContainer.style.display = 'flex';
        } else {
            dateRangeContainer.style.display = 'none';
            currentPage = 1; // Reset to first page on filter change
            loadOrders();
        }
    });

    // Apply custom date filter
    applyDateFilter.addEventListener('click', function() {
        if (dateFrom.value && dateTo.value) {
            currentPage = 1; // Reset to first page on filter change
            loadOrders();
        } else {
            showAlert(errorAlert, 'Please select both start and end dates.');
        }
    });

    // Search input handler with debounce
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentPage = 1; // Reset to first page on new search
            loadOrders();
        }, 500);
    });

    // Filter change handlers
    statusFilter.addEventListener('change', function() {
        currentPage = 1; // Reset to first page on filter change
        loadOrders();
    });

    sortOrders.addEventListener('change', function() {
        loadOrders();
    });

    // Handle sidebar toggle on mobile
    document.getElementById('sidebarToggle').addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('show');
    });

    // Attach logout handler to both logout buttons
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        handleLogout();
    });
    
    document.getElementById('sidebarLogoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        handleLogout();
    });

    // Initial load
    loadOrders();
});
