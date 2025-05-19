// Products page JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    // Allow visiting the page even without a token, but some features might be restricted
    const isLoggedIn = !!token;

    // DOM elements
    const successAlert = document.getElementById('successAlert');
    const errorAlert = document.getElementById('errorAlert');
    const searchInput = document.getElementById('searchProducts');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortProducts = document.getElementById('sortProducts');
    const productsTableBody = document.getElementById('productsTableBody');
    const paginationContainer = document.getElementById('pagination');
    const addProductBtn = document.getElementById('addProductBtn');

    // Modal elements
    const productModal = new bootstrap.Modal(document.getElementById('productModal'));
    const productForm = document.getElementById('productForm');
    const productId = document.getElementById('productId');
    const productName = document.getElementById('productName');
    const productCategory = document.getElementById('productCategory');
    const productPrice = document.getElementById('productPrice');
    const productStock = document.getElementById('productStock');
    const productDescription = document.getElementById('productDescription');
    const productImage = document.getElementById('productImage');
    const productActive = document.getElementById('productActive');
    const saveProductBtn = document.getElementById('saveProductBtn');

    // Delete confirmation modal
    const deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    const deleteProductId = document.getElementById('deleteProductId');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    // Pagination state
    let currentPage = 1;
    let lastPage = 1;
    let totalProducts = 0;
    let productsPerPage = 10;

    // Fetch all categories for the filter and form dropdown
    function loadCategories() {
        fetch('/api/categories', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            return response.json();
        })
        .then(data => {
            // Populate category filter dropdown
            let categoryOptions = '<option value="">All Categories</option>';
            data.data.forEach(category => {
                categoryOptions += `<option value="${category.id}">${category.name}</option>`;
            });
            categoryFilter.innerHTML = categoryOptions;
            
            // Populate product form category dropdown
            let productCategoryOptions = '<option value="">Select Category</option>';
            data.data.forEach(category => {
                productCategoryOptions += `<option value="${category.id}">${category.name}</option>`;
            });
            productCategory.innerHTML = productCategoryOptions;
        })
        .catch(error => {
            console.error('Error loading categories:', error);
            showAlert(errorAlert, 'Failed to load categories. Please try again later.');
        });
    }    // Function to load products with filtering, sorting, and pagination
    function loadProducts() {
        // Show loading state
        productsTableBody.innerHTML = '<tr><td colspan="7" class="text-center"><div class="loading-spinner"></div> Loading products...</td></tr>';
        
        // Build query parameters
        const searchTerm = searchInput.value.trim();
        const categoryId = categoryFilter.value;
        const sortOption = sortProducts.value;
        
        let endpoint = `/api/products?page=${currentPage}`;
        
        if (searchTerm) {
            endpoint += `&search=${encodeURIComponent(searchTerm)}`;
        }
        
        if (categoryId) {
            endpoint += `&category=${categoryId}`;
        }
        
        // Add sorting parameters
        if (sortOption) {
            const [field, direction] = sortOption.split('_');
            endpoint += `&sort_by=${field}&sort_direction=${direction}`;
        }
          const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        // Only add authorization header if token exists
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        fetch(endpoint, {
            method: 'GET',
            headers: headers
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            return response.json();
        })
        .then(data => {
            console.log('API Response:', data); // Debug response
            
            // Update pagination state - handle both meta and pagination formats
            if (data.meta) {
                currentPage = data.meta.current_page;
                lastPage = data.meta.last_page;
                totalProducts = data.meta.total;
            } else if (data.pagination) {
                currentPage = data.pagination.current_page;
                lastPage = data.pagination.total_pages;
                totalProducts = data.pagination.total;
            } else {
                console.error('No pagination data found in response');
            }
              if (data.data.length === 0) {
                productsTableBody.innerHTML = '<tr><td colspan="8" class="text-center">No products found</td></tr>';
                paginationContainer.innerHTML = '';
                return;
            }
            
            // Render products
            let tableContent = '';
            data.data.forEach(product => {
                let statusBadge = '';
                if (product.is_active) {
                    statusBadge = '<span class="badge bg-success product-status">Active</span>';
                } else {
                    statusBadge = '<span class="badge bg-secondary product-status">Inactive</span>';
                }
                
                tableContent += `
                <tr>
                    <td>
                        <div class="form-check">
                            <input class="form-check-input product-checkbox" type="checkbox" value="${product.id}">
                        </div>
                    </td>
                    <td class="product-image-cell">
                        ${product.image_url 
                            ? `<img src="${product.image_url}" alt="${product.name}" class="product-image">`
                            : `<div class="product-placeholder"><i class="bi bi-image"></i></div>`
                        }
                    </td>
                    <td>${product.name}</td>
                    <td>${product.category ? product.category.name : 'Uncategorized'}</td>
                    <td>$${parseFloat(product.price).toFixed(2)}</td>
                    <td>${product.stock_quantity}</td>
                    <td>${statusBadge}</td>
                    <td class="product-actions">
                        <button class="btn btn-sm btn-primary edit-product" data-id="${product.id}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-product" data-id="${product.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
                `;
            });
            
            productsTableBody.innerHTML = tableContent;
            
            // Set up pagination
            renderPagination();
            
            // Add event listeners to the new buttons
            document.querySelectorAll('.edit-product').forEach(button => {
                button.addEventListener('click', function() {
                    const productId = this.getAttribute('data-id');
                    editProduct(productId);
                });
            });
            
            document.querySelectorAll('.delete-product').forEach(button => {
                button.addEventListener('click', function() {
                    const productId = this.getAttribute('data-id');
                    confirmDelete(productId);
                });
            });
        })        .catch(error => {
            console.error('Error loading products:', error);
            productsTableBody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Error loading products. Please try again.</td></tr>';
            
            // Check if token might be expired or invalid
            if (error.message === 'Failed to fetch products') {
                // Try to handle token issues
                if (!token) {
                    showAlert(errorAlert, 'You are not logged in. Please log in again.');
                    setTimeout(() => {
                        localStorage.removeItem('auth_token');
                        window.location.href = 'login.html';
                    }, 2000);
                    return;
                }
                
                showAlert(errorAlert, 'Failed to load products. Your session may have expired. Please try logging in again.');
            } else {
                showAlert(errorAlert, 'Failed to load products. Please try again later.');
            }
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
                        loadProducts();
                    }
                }
            });
        });
    }

    // Function to fetch product details for editing
    function editProduct(id) {
        fetch(`/api/products/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch product details');
            }
            return response.json();
        })
        .then(data => {
            const product = data.data;
            
            // Populate form with product details
            productId.value = product.id;
            productName.value = product.name;
            productCategory.value = product.category_id || '';
            productPrice.value = product.price;
            productStock.value = product.stock_quantity;
            productDescription.value = product.description || '';
            productImage.value = product.image_url || '';
            productActive.checked = product.is_active;
            
            // Update modal title
            document.getElementById('productModalLabel').textContent = 'Edit Product';
            
            // Show the modal
            productModal.show();
        })
        .catch(error => {
            console.error('Error fetching product details:', error);
            showAlert(errorAlert, 'Failed to load product details. Please try again.');
        });
    }

    // Function to prepare for adding a new product
    function addProduct() {
        // Reset form
        productForm.reset();
        productId.value = '';
        
        // Update modal title
        document.getElementById('productModalLabel').textContent = 'Add New Product';
        
        // Show the modal
        productModal.show();
    }

    // Function to save product (create or update)
    function saveProduct() {
        // Validate form
        if (!productForm.checkValidity()) {
            productForm.classList.add('was-validated');
            return;
        }
        
        // Prepare product data
        const productData = {
            name: productName.value.trim(),
            price: parseFloat(productPrice.value),
            stock_quantity: parseInt(productStock.value),
            description: productDescription.value.trim(),
            image_url: productImage.value.trim(),
            is_active: productActive.checked
        };
        
        if (productCategory.value) {
            productData.category_id = parseInt(productCategory.value);
        }
        
        const isEditing = !!productId.value;
        const method = isEditing ? 'PUT' : 'POST';
        const endpoint = isEditing ? `/api/products/${productId.value}` : '/api/products';
        
        fetch(endpoint, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Failed to save product');
                });
            }
            return response.json();
        })
        .then(data => {
            // Close modal
            productModal.hide();
            
            // Show success message
            showAlert(successAlert, `Product ${isEditing ? 'updated' : 'created'} successfully!`);
            
            // Reload products
            loadProducts();
        })
        .catch(error => {
            console.error('Error saving product:', error);
            showAlert(errorAlert, `Failed to ${isEditing ? 'update' : 'create'} product: ${error.message}`);
        });
    }

    // Function to confirm product deletion
    function confirmDelete(id) {
        deleteProductId.value = id;
        deleteConfirmModal.show();
    }

    // Function to delete a product
    function deleteProduct() {
        const id = deleteProductId.value;
        
        fetch(`/api/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Failed to delete product');
                });
            }
            return response.json();
        })
        .then(data => {
            // Close modal
            deleteConfirmModal.hide();
            
            // Show success message
            showAlert(successAlert, 'Product deleted successfully!');
            
            // Reload products
            loadProducts();
        })
        .catch(error => {
            console.error('Error deleting product:', error);
            showAlert(errorAlert, `Failed to delete product: ${error.message}`);
            deleteConfirmModal.hide();
        });
    }

    // Function to handle bulk delete
    function bulkDeleteProducts() {
        const checkboxes = document.querySelectorAll('.product-checkbox:checked');
        
        if (checkboxes.length === 0) {
            showAlert(errorAlert, 'No products selected for deletion');
            return;
        }
        
        if (!confirm(`Are you sure you want to delete ${checkboxes.length} products? This action cannot be undone. Products used in orders will be marked as inactive.`)) {
            return;
        }
        
        // Collect selected product IDs
        const productIds = Array.from(checkboxes).map(checkbox => checkbox.value);
        
        // Send bulk delete request
        fetch('/api/products/bulk-delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ product_ids: productIds })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Failed to delete products');
                });
            }
            return response.json();
        })
        .then(data => {
            showAlert(successAlert, data.message);
            loadProducts();
        })
        .catch(error => {
            console.error('Error deleting products:', error);
            showAlert(errorAlert, `Failed to delete products: ${error.message}`);
        });
    }

    // Function to handle select all checkbox
    function toggleSelectAllProducts() {
        const selectAllCheckbox = document.getElementById('selectAllProducts');
        const productCheckboxes = document.querySelectorAll('.product-checkbox');
        
        productCheckboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
        
        updateBulkActionButton();
    }

    // Function to update the state of the bulk action button
    function updateBulkActionButton() {
        const checkboxes = document.querySelectorAll('.product-checkbox:checked');
        const bulkActionBtn = document.getElementById('bulkActionBtn');
        
        if (checkboxes.length > 0) {
            bulkActionBtn.removeAttribute('disabled');
            bulkActionBtn.textContent = `Delete Selected (${checkboxes.length})`;
        } else {
            bulkActionBtn.setAttribute('disabled', 'disabled');
            bulkActionBtn.textContent = 'Delete Selected';
        }
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
    }    // Event Listeners
    addProductBtn.addEventListener('click', addProduct);
    saveProductBtn.addEventListener('click', saveProduct);
    confirmDeleteBtn.addEventListener('click', deleteProduct);
    
    // Bulk actions
    document.getElementById('selectAllProducts').addEventListener('change', toggleSelectAllProducts);
    document.getElementById('bulkActionBtn').addEventListener('click', bulkDeleteProducts);
    
    // Event delegation for product checkboxes
    productsTableBody.addEventListener('change', function(e) {
        if (e.target.classList.contains('product-checkbox')) {
            updateBulkActionButton();
        }
    });

    // Search input handler with debounce
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentPage = 1; // Reset to first page on new search
            loadProducts();
        }, 500);
    });

    // Category filter and sort change handlers
    categoryFilter.addEventListener('change', function() {
        currentPage = 1; // Reset to first page on filter change
        loadProducts();
    });

    sortProducts.addEventListener('change', function() {
        loadProducts();
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
    loadCategories();
    loadProducts();
});
