// Categories page JavaScript functionality
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
    const searchInput = document.getElementById('searchCategories');
    const sortCategories = document.getElementById('sortCategories');
    const categoriesTableBody = document.getElementById('categoriesTableBody');
    const paginationContainer = document.getElementById('pagination');
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    
    // Summary elements
    const totalCategoriesElement = document.getElementById('totalCategories');
    const topCategoryElement = document.getElementById('topCategory');
    const recentCategoryElement = document.getElementById('recentCategory');

    // Modal elements
    const categoryModal = new bootstrap.Modal(document.getElementById('categoryModal'));
    const categoryForm = document.getElementById('categoryForm');
    const categoryId = document.getElementById('categoryId');
    const categoryName = document.getElementById('categoryName');
    const categorySlug = document.getElementById('categorySlug');
    const categoryDescription = document.getElementById('categoryDescription');
    const parentCategory = document.getElementById('parentCategory');
    const saveCategoryBtn = document.getElementById('saveCategoryBtn');

    // Delete confirmation modal
    const deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    const deleteCategoryId = document.getElementById('deleteCategoryId');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    // Pagination state
    let currentPage = 1;
    let lastPage = 1;
    let totalCategories = 0;
    let categoriesPerPage = 10;

    // Function to load categories with filtering, sorting, and pagination
    function loadCategories() {
        // Show loading state
        categoriesTableBody.innerHTML = '<tr><td colspan="4" class="text-center"><div class="loading-spinner"></div> Loading categories...</td></tr>';
        
        // Build query parameters
        const searchTerm = searchInput.value.trim();
        const sortOption = sortCategories.value;
        
        let endpoint = `/api/categories?page=${currentPage}`;
        
        if (searchTerm) {
            endpoint += `&search=${encodeURIComponent(searchTerm)}`;
        }
        
        // Add sorting parameters
        if (sortOption) {
            const [field, direction] = sortOption.split('_');
            endpoint += `&sort_by=${field}&sort_direction=${direction}`;
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
                throw new Error('Failed to fetch categories');
            }
            return response.json();
        })
        .then(data => {
            // Update pagination state
            currentPage = data.meta.current_page;
            lastPage = data.meta.last_page;
            totalCategories = data.meta.total;
            
            // Update summary
            totalCategoriesElement.textContent = totalCategories;
            
            if (data.data.length === 0) {
                categoriesTableBody.innerHTML = '<tr><td colspan="4" class="text-center">No categories found</td></tr>';
                paginationContainer.innerHTML = '';
                return;
            }
            
            // Render categories
            let tableContent = '';
            data.data.forEach(category => {
                const createdDate = new Date(category.created_at);
                const formattedDate = createdDate.toLocaleDateString();
                
                tableContent += `
                <tr>
                    <td>
                        ${category.name}
                        ${category.parent_id ? `<small class="text-muted d-block">Sub-category of ${category.parent ? category.parent.name : ''}</small>` : ''}
                    </td>
                    <td>
                        <span class="badge bg-primary rounded-pill">${category.products_count || 0}</span>
                    </td>
                    <td>${formattedDate}</td>
                    <td class="category-actions">
                        <button class="btn btn-sm btn-primary edit-category" data-id="${category.id}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-category" data-id="${category.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
                `;
            });
            
            categoriesTableBody.innerHTML = tableContent;
            
            // Set up pagination
            renderPagination();
            
            // Add event listeners to the new buttons
            document.querySelectorAll('.edit-category').forEach(button => {
                button.addEventListener('click', function() {
                    const categoryId = this.getAttribute('data-id');
                    editCategory(categoryId);
                });
            });
            
            document.querySelectorAll('.delete-category').forEach(button => {
                button.addEventListener('click', function() {
                    const categoryId = this.getAttribute('data-id');
                    confirmDelete(categoryId);
                });
            });
        })
        .catch(error => {
            console.error('Error loading categories:', error);
            categoriesTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error loading categories. Please try again.</td></tr>';
            showAlert(errorAlert, 'Failed to load categories. Please try again later.');
        });
    }

    // Function to load category summary statistics
    function loadCategorySummary() {
        fetch('/api/categories/summary', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch category summary');
            }
            return response.json();
        })
        .then(data => {
            // Update summary elements
            if (data.data.top_category) {
                topCategoryElement.textContent = data.data.top_category.name;
            }
            
            if (data.data.recent_category) {
                recentCategoryElement.textContent = data.data.recent_category.name;
            }
        })
        .catch(error => {
            console.error('Error loading category summary:', error);
        });
    }

    // Function to fetch parent categories for the dropdown
    function loadParentCategories() {
        fetch('/api/categories?parent_only=true', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch parent categories');
            }
            return response.json();
        })
        .then(data => {
            // Populate parent category dropdown
            let parentOptions = '<option value="">None</option>';
            data.data.forEach(category => {
                parentOptions += `<option value="${category.id}">${category.name}</option>`;
            });
            parentCategory.innerHTML = parentOptions;
        })
        .catch(error => {
            console.error('Error loading parent categories:', error);
            showAlert(errorAlert, 'Failed to load parent categories. Please try again later.');
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
                        loadCategories();
                    }
                }
            });
        });
    }

    // Function to fetch category details for editing
    function editCategory(id) {
        fetch(`/api/categories/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch category details');
            }
            return response.json();
        })
        .then(data => {
            const category = data.data;
            
            // Populate form with category details
            categoryId.value = category.id;
            categoryName.value = category.name;
            categorySlug.value = category.slug || '';
            categoryDescription.value = category.description || '';
            parentCategory.value = category.parent_id || '';
            
            // Update modal title
            document.getElementById('categoryModalLabel').textContent = 'Edit Category';
            
            // Show the modal
            categoryModal.show();
        })
        .catch(error => {
            console.error('Error fetching category details:', error);
            showAlert(errorAlert, 'Failed to load category details. Please try again.');
        });
    }

    // Function to prepare for adding a new category
    function addCategory() {
        // Reset form
        categoryForm.reset();
        categoryId.value = '';
        
        // Update modal title
        document.getElementById('categoryModalLabel').textContent = 'Add New Category';
        
        // Show the modal
        categoryModal.show();
    }

    // Function to save category (create or update)
    function saveCategory() {
        // Validate form
        if (!categoryForm.checkValidity()) {
            categoryForm.classList.add('was-validated');
            return;
        }
        
        // Prepare category data
        const categoryData = {
            name: categoryName.value.trim(),
            slug: categorySlug.value.trim() || null,
            description: categoryDescription.value.trim() || null
        };
        
        if (parentCategory.value) {
            categoryData.parent_id = parseInt(parentCategory.value);
        }
        
        const isEditing = !!categoryId.value;
        const method = isEditing ? 'PUT' : 'POST';
        const endpoint = isEditing ? `/api/categories/${categoryId.value}` : '/api/categories';
        
        fetch(endpoint, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(categoryData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Failed to save category');
                });
            }
            return response.json();
        })
        .then(data => {
            // Close modal
            categoryModal.hide();
            
            // Show success message
            showAlert(successAlert, `Category ${isEditing ? 'updated' : 'created'} successfully!`);
            
            // Reload categories and summary
            loadCategories();
            loadCategorySummary();
            loadParentCategories();
        })
        .catch(error => {
            console.error('Error saving category:', error);
            showAlert(errorAlert, `Failed to ${isEditing ? 'update' : 'create'} category: ${error.message}`);
        });
    }

    // Function to confirm category deletion
    function confirmDelete(id) {
        deleteCategoryId.value = id;
        deleteConfirmModal.show();
    }

    // Function to delete a category
    function deleteCategory() {
        const id = deleteCategoryId.value;
        
        fetch(`/api/categories/${id}`, {
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
                    throw new Error(data.message || 'Failed to delete category');
                });
            }
            return response.json();
        })
        .then(data => {
            // Close modal
            deleteConfirmModal.hide();
            
            // Show success message
            showAlert(successAlert, 'Category deleted successfully!');
            
            // Reload categories and summary
            loadCategories();
            loadCategorySummary();
            loadParentCategories();
        })
        .catch(error => {
            console.error('Error deleting category:', error);
            showAlert(errorAlert, `Failed to delete category: ${error.message}`);
            deleteConfirmModal.hide();
        });
    }

    // Generate a slug from the category name
    categoryName.addEventListener('input', function() {
        // Only auto-generate slug if the slug field is empty or if we're creating a new category
        if (!categorySlug.value || !categoryId.value) {
            const name = categoryName.value.trim();
            categorySlug.value = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
        }
    });

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
    addCategoryBtn.addEventListener('click', addCategory);
    saveCategoryBtn.addEventListener('click', saveCategory);
    confirmDeleteBtn.addEventListener('click', deleteCategory);

    // Search input handler with debounce
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentPage = 1; // Reset to first page on new search
            loadCategories();
        }, 500);
    });

    // Sort change handler
    sortCategories.addEventListener('change', function() {
        loadCategories();
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
    loadCategorySummary();
    loadParentCategories();
});
