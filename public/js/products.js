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

    // Debug element existence
    console.log('DOM elements loaded:');
    console.log('- Add Product Button:', addProductBtn ? 'Found' : 'Not Found');
    console.log('- Save Product Button:', document.getElementById('saveProductBtn') ? 'Found' : 'Not Found');
    console.log('- Confirm Delete Button:', document.getElementById('confirmDeleteBtn') ? 'Found' : 'Not Found');
    console.log('- Select All Checkbox:', document.getElementById('selectAllProducts') ? 'Found' : 'Not Found');
    console.log('- Bulk Action Button:', document.getElementById('bulkActionBtn') ? 'Found' : 'Not Found');

    // Get user display element
    const userNameDisplay = document.getElementById('userNameDisplay');

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
    const saveProductBtn = document.getElementById('saveProductBtn');    // Delete confirmation modal
    const modalElement = document.getElementById('deleteConfirmModal');
    console.log('Delete modal element:', modalElement ? 'Found' : 'Not Found');
    
    // Try with error handling in case Bootstrap is not loaded
    let deleteConfirmModal;
    try {
        deleteConfirmModal = new bootstrap.Modal(modalElement);
        console.log('Delete confirmation modal successfully initialized');
    } catch (error) {
        console.error('Error initializing delete confirmation modal:', error);
        // Fallback approach
        deleteConfirmModal = {
            show: function() {
                console.log('Fallback show modal');
                modalElement.classList.add('show');
                modalElement.style.display = 'block';
                document.body.classList.add('modal-open');
            },
            hide: function() {
                console.log('Fallback hide modal');
                modalElement.classList.remove('show');
                modalElement.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        };
    }
    
    const deleteProductId = document.getElementById('deleteProductId');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    
    // Bulk action elements
    const selectAllCheckbox = document.getElementById('selectAllProducts');
    const bulkActionBtn = document.getElementById('bulkActionBtn');

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
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('Edit product button clicked');
                    const productId = this.getAttribute('data-id');
                    editProduct(productId);
                });
            });
              document.querySelectorAll('.delete-product').forEach(button => {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('Delete product button clicked');
                    const productId = this.getAttribute('data-id');
                    console.log('Delete button clicked for product ID:', productId);
                    confirmDelete(productId);
                });
            });
            
            // Count how many buttons we added listeners to
            console.log(`Added event listeners to ${document.querySelectorAll('.edit-product').length} edit buttons and ${document.querySelectorAll('.delete-product').length} delete buttons`);
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
    }    // Function to confirm product deletion
    function confirmDelete(id) {
        console.log('Confirming deletion of product with ID:', id);
        if (deleteProductId) {
            deleteProductId.value = id;
            console.log('Set deleteProductId value to:', deleteProductId.value);
        } else {
            console.error('deleteProductId element not found');
        }
        
        try {
            console.log('Attempting to show delete confirmation modal');
            deleteConfirmModal.show();
        } catch (error) {
            console.error('Error showing delete confirmation modal:', error);
            // Fallback approach
            const modal = document.getElementById('deleteConfirmModal');
            if (modal) {
                modal.classList.add('show');
                modal.style.display = 'block';
                document.body.classList.add('modal-open');
            }
        }
    }    // Function to delete a product
    function deleteProduct() {
        const id = deleteProductId.value;
        console.log('Deleting product with ID:', id);
        
        if (!id) {
            console.error('No product ID to delete');
            showAlert(errorAlert, 'Error: No product selected for deletion');
            return;
        }
        
        fetch(`/api/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            console.log('Delete response status:', response.status);
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Failed to delete product');
                });
            }
            return response.json();
        })
        .then(data => {
            // Close modal
            console.log('Product deleted successfully, hiding modal');
            try {
                deleteConfirmModal.hide();
            } catch (error) {
                console.error('Error hiding modal:', error);
                // Fallback approach
                const modal = document.getElementById('deleteConfirmModal');
                if (modal) {
                    modal.classList.remove('show');
                    modal.style.display = 'none';
                    document.body.classList.remove('modal-open');
                }
            }
            
            // Show success message
            showAlert(successAlert, 'Product deleted successfully!');
            
            // Reload products
            loadProducts();
        })
        .catch(error => {
            console.error('Error deleting product:', error);
            showAlert(errorAlert, `Failed to delete product: ${error.message}`);
            try {
                deleteConfirmModal.hide();
            } catch (modalError) {
                console.error('Error hiding modal after delete error:', modalError);
            }
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
            return response.json().then(data => {
                if (!response.ok) {
                    console.error('Bulk delete error response:', data);
                    const baseMsg = data.message || 'Failed to delete products';
                    const detail = data.error ? `: ${data.error}` : '';
                    throw new Error(baseMsg + detail);
                }
                return data;
            });
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

    // Handle logout function
    function handleLogout() {
        fetch('/api/logout', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .finally(() => {
            localStorage.removeItem('auth_token');
            window.location.href = 'login.html';
        });
    }    // Attach logout handlers
    document.getElementById('logoutBtn').addEventListener('click', function(e) { e.preventDefault(); handleLogout(); });
    document.getElementById('sidebarLogoutBtn').addEventListener('click', function(e) { e.preventDefault(); handleLogout(); });
      // Attach event handlers for product management
    if (addProductBtn) {
        console.log('Attaching event listener to Add Product button');
        addProductBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Add Product button clicked');
            addProduct();
        });
    } else {
        console.error('Add Product button not found');
    }
    
    // Make sure we directly access the confirm delete button by its ID
    const directConfirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    console.log('Direct access to Confirm Delete Button:', directConfirmDeleteBtn ? 'Found' : 'Not Found');
    
    if (directConfirmDeleteBtn) {
        console.log('Attaching event listener to Confirm Delete button (direct access)');
        directConfirmDeleteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Confirm Delete button clicked (direct access)');
            deleteProduct();
        });
    } 
    
    if (confirmDeleteBtn) {
        console.log('Attaching event listener to Confirm Delete button (original variable)');
        confirmDeleteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Confirm Delete button clicked (original variable)');
            deleteProduct();
        });
    } else {
        console.error('Confirm Delete button not found');
    }
    
    // Attach event listener for save product button
    if (saveProductBtn) {
        console.log('Attaching event listener to Save Product button');
        saveProductBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Save Product button clicked');
            saveProduct();
        });
    } else {
        console.error('Save Product button not found');
    }

    // Load authenticated user info and then initialize data
    fetch('/api/user', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(resp => {
            const user = resp.data.user;
            if (user && user.name) userNameDisplay.textContent = user.name;
        })
        .catch(() => {})
        .finally(() => {
            loadCategories();
            loadProducts();
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
});
