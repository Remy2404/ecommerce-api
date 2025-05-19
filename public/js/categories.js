// Categories page JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Categories.js initialized');
    
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Load authenticated user info
    const userNameDisplay = document.getElementById('userNameDisplay');
    let currentUser = null;
    fetch('/api/user', { 
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json' 
        }
    })
    .then(res => {
        if (!res.ok) {
            throw new Error('Failed to fetch user');
        }
        return res.json();
    })
    .then(resp => {
        console.log('User data loaded:', resp);
        const user = resp.data || resp; // Handle both response formats
        currentUser = user;
        if (userNameDisplay) {
            userNameDisplay.textContent = user.name || 'User';
        }
    })
    .catch(err => {
        console.error('Error fetching user data:', err);
    })
    .finally(() => {
        loadCategories();
        loadCategorySummary();
        loadParentCategories();
    });

    // Handle logout function
    function handleLogout() {
        fetch('/api/logout', { 
            method: 'POST', 
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            } 
        })
        .finally(() => { 
            localStorage.removeItem('auth_token'); 
            window.location.href = 'login.html'; 
        });
    }

    // Attach logout handlers
    const logoutBtn = document.getElementById('logoutBtn');
    const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) { 
            e.preventDefault(); 
            handleLogout(); 
        });
    }
    
    if (sidebarLogoutBtn) {
        sidebarLogoutBtn.addEventListener('click', function(e) { 
            e.preventDefault(); 
            handleLogout(); 
        });
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
    const recentCategoryElement = document.getElementById('recentCategory');    // Modal elements
    const categoryModalElement = document.getElementById('categoryModal');
    // Use the globally defined modal if available, otherwise initialize here
    const categoryModal = window.categoryModal || (categoryModalElement ? new bootstrap.Modal(categoryModalElement) : null);
    const categoryForm = document.getElementById('categoryForm');
    const categoryId = document.getElementById('categoryId');
    const categoryName = document.getElementById('categoryName');
    const categorySlug = document.getElementById('categorySlug');
    const categoryDescription = document.getElementById('categoryDescription');
    const parentCategory = document.getElementById('parentCategory');
    const saveCategoryBtn = document.getElementById('saveCategoryBtn');

    // Delete confirmation modal
    const deleteConfirmModalElement = document.getElementById('deleteConfirmModal');
    // Use the globally defined modal if available, otherwise initialize here
    const deleteConfirmModal = window.deleteConfirmModal || (deleteConfirmModalElement ? new bootstrap.Modal(deleteConfirmModalElement) : null);
    const deleteCategoryId = document.getElementById('deleteCategoryId');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    // Check for missing elements
    if (!categoryModal) console.error('Category modal not found or not initialized');
    if (!deleteConfirmModal) console.error('Delete confirm modal not found or not initialized');
    if (!addCategoryBtn) console.error('Add category button not found');
    if (!saveCategoryBtn) console.error('Save category button not found');
    if (!confirmDeleteBtn) console.error('Confirm delete button not found');

    // Pagination state
    let currentPage = 1;
    let lastPage = 1;
    let totalCategories = 0;
    let categoriesPerPage = 10;

    // Function to load categories with filtering, sorting, and pagination
    function loadCategories() {
        console.log('Loading categories...');
        // Show loading state
        if (categoriesTableBody) {
            categoriesTableBody.innerHTML = '<tr><td colspan="4" class="text-center"><div class="loading-spinner"></div> Loading categories...</td></tr>';
        }
        
        // Build query parameters
        const searchTerm = searchInput ? searchInput.value.trim() : '';
        const sortOption = sortCategories ? sortCategories.value : '';
        
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
            console.log('Categories loaded:', data);
            // Update pagination state
            currentPage = data.meta.current_page;
            lastPage = data.meta.last_page;
            totalCategories = data.meta.total;
            
            // Update summary
            if (totalCategoriesElement) {
                totalCategoriesElement.textContent = totalCategories;
            }
            
            if (data.data.length === 0) {
                if (categoriesTableBody) {
                    categoriesTableBody.innerHTML = '<tr><td colspan="4" class="text-center">No categories found</td></tr>';
                }
                if (paginationContainer) {
                    paginationContainer.innerHTML = '';
                }
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
            
            if (categoriesTableBody) {
                categoriesTableBody.innerHTML = tableContent;
            }
            
            // Set up pagination
            renderPagination();
              // Add event listeners to the new buttons
            document.querySelectorAll('.edit-category').forEach(button => {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('Edit button clicked');
                    const categoryId = this.getAttribute('data-id');
                    editCategory(categoryId);
                });
            });
            
            document.querySelectorAll('.delete-category').forEach(button => {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('Delete button clicked');
                    const categoryId = this.getAttribute('data-id');
                    confirmDelete(categoryId);
                });
            });
        })
        .catch(error => {
            console.error('Error loading categories:', error);
            if (categoriesTableBody) {
                categoriesTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error loading categories. Please try again.</td></tr>';
            }
            showAlert(errorAlert, 'Failed to load categories. Please try again later.');
        });
    }

    // Function to load category summary statistics
    function loadCategorySummary() {
        console.log('Loading category summary...');
        fetch('/api/categories/summary', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch category summary');
            return response.json();
        })
        .then(data => {
            console.log('Category summary loaded:', data);
            // Update summary elements
            if (data.data.total_categories !== undefined && totalCategoriesElement) {
                totalCategoriesElement.textContent = data.data.total_categories;
            }
            if (data.data.top_category && topCategoryElement) {
                topCategoryElement.textContent = data.data.top_category.name;
            }
            if (data.data.recent_category && recentCategoryElement) {
                recentCategoryElement.textContent = data.data.recent_category.name;
            }
        })
        .catch(error => {
            console.error('Error loading category summary:', error);
        });
    }

    // Function to fetch parent categories for the dropdown
    function loadParentCategories() {
        console.log('Loading parent categories...');
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
            console.log('Parent categories loaded:', data);
            // Populate parent category dropdown
            if (parentCategory) {
                let parentOptions = '<option value="">None</option>';
                data.data.forEach(category => {
                    parentOptions += `<option value="${category.id}">${category.name}</option>`;
                });
                parentCategory.innerHTML = parentOptions;
            }
        })
        .catch(error => {
            console.error('Error loading parent categories:', error);
            showAlert(errorAlert, 'Failed to load parent categories. Please try again later.');
        });
    }

    // Function to render pagination controls
    function renderPagination() {
        if (lastPage <= 1 || !paginationContainer) {
            if (paginationContainer) paginationContainer.innerHTML = '';
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
    }    // Function to fetch category details for editing
    function editCategory(id) {
        console.log('Editing category with ID:', id);
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
            console.log('Category details loaded:', data);
            const category = data.data;
            
            // Populate form with category details
            if (categoryId) categoryId.value = category.id;
            if (categoryName) categoryName.value = category.name;
            if (categorySlug) categorySlug.value = category.slug || '';
            if (categoryDescription) categoryDescription.value = category.description || '';
            if (parentCategory) parentCategory.value = category.parent_id || '';
            
            // Update modal title
            const modalTitle = document.getElementById('categoryModalLabel');
            if (modalTitle) modalTitle.textContent = 'Edit Category';
            
            // Show the modal
            if (categoryModal) {
                try {
                    categoryModal.show();
                    console.log('Category edit modal shown successfully');
                } catch (error) {
                    console.error('Error showing category edit modal:', error);
                    
                    // Fallback approach: Try to access the modal directly from the DOM
                    try {
                        const modalElement = document.getElementById('categoryModal');
                        if (modalElement) {
                            const bsModal = new bootstrap.Modal(modalElement);
                            bsModal.show();
                            console.log('Edit modal shown using fallback approach');
                            // Store the reference for future use
                            window.categoryModal = bsModal;
                        } else {
                            console.error('Could not find modal element in the DOM');
                            alert('Error opening the edit form. Please refresh the page and try again.');
                        }
                    } catch (fallbackError) {
                        console.error('Fallback approach failed:', fallbackError);
                        alert('Error opening the edit form. Please refresh the page and try again.');
                    }
                }
            } else {
                console.error('Category modal not initialized');
                try {
                    // Try to initialize the modal
                    const modalElement = document.getElementById('categoryModal');
                    if (modalElement) {
                        const bsModal = new bootstrap.Modal(modalElement);
                        bsModal.show();
                        console.log('Edit modal initialized and shown directly');
                        // Store the reference for future use
                        window.categoryModal = bsModal;
                    } else {
                        console.error('Could not find modal element in the DOM for editing');
                        alert('Could not open the edit form. Please refresh the page and try again.');
                    }
                } catch (directError) {
                    console.error('Error initializing edit modal directly:', directError);
                    alert('Could not open the edit form. Please refresh the page and try again.');
                }
            }
        })
        .catch(error => {
            console.error('Error fetching category details:', error);
            showAlert(errorAlert, 'Failed to load category details. Please try again.');
        });
    }// Function to prepare for adding a new category
    function addCategory() {
        console.log('Adding new category');
        // Reset form
        if (categoryForm) categoryForm.reset();
        if (categoryId) categoryId.value = '';
        
        // Update modal title
        const modalTitle = document.getElementById('categoryModalLabel');
        if (modalTitle) modalTitle.textContent = 'Add New Category';
        
        // Show the modal
        if (categoryModal) {
            try {
                categoryModal.show();
                console.log('Category modal shown successfully');
            } catch (error) {
                console.error('Error showing category modal:', error);
                
                // Fallback approach: Try to access the modal directly from the DOM
                try {
                    const modalElement = document.getElementById('categoryModal');
                    if (modalElement) {
                        const bsModal = new bootstrap.Modal(modalElement);
                        bsModal.show();
                        console.log('Modal shown using fallback approach');
                        // Store the reference for future use
                        window.categoryModal = bsModal;
                    } else {
                        console.error('Could not find modal element in the DOM');
                    }
                } catch (fallbackError) {
                    console.error('Fallback approach failed:', fallbackError);
                    alert('Error opening the modal. Please refresh the page and try again.');
                }
            }
        } else {
            console.error('Category modal not initialized');
            try {
                // Try to initialize the modal
                const modalElement = document.getElementById('categoryModal');
                if (modalElement) {
                    const bsModal = new bootstrap.Modal(modalElement);
                    bsModal.show();
                    console.log('Modal initialized and shown directly');
                    // Store the reference for future use
                    window.categoryModal = bsModal;
                }
            } catch (directError) {
                console.error('Error initializing modal directly:', directError);
                alert('Could not open the add category form. Please refresh the page and try again.');
            }
        }
    }    // Function to save category (create or update)
    function saveCategory() {
        console.log('Saving category...');
        
        // Validate form
        if (categoryForm && !categoryForm.checkValidity()) {
            categoryForm.classList.add('was-validated');
            console.log('Form validation failed');
            return;
        }
        
        // Check required fields
        if (!categoryName || !categoryName.value.trim()) {
            console.error('Category name is required');
            showAlert(errorAlert, 'Category name is required');
            return;
        }
        
        // Prepare category data
        const categoryData = {
            name: categoryName ? categoryName.value.trim() : '',
            slug: categorySlug && categorySlug.value.trim() ? categorySlug.value.trim() : null,
            description: categoryDescription && categoryDescription.value.trim() ? categoryDescription.value.trim() : null
        };
        
        if (parentCategory && parentCategory.value) {
            categoryData.parent_id = parseInt(parentCategory.value);
        }
        
        const isEditing = categoryId && !!categoryId.value;
        const method = isEditing ? 'PUT' : 'POST';
        const endpoint = isEditing ? `/api/categories/${categoryId.value}` : '/api/categories';
        
        console.log('Submitting category data:', categoryData, 'to endpoint:', endpoint, 'with method:', method);
        
        // Disable save button to prevent double submission
        if (saveCategoryBtn) {
            saveCategoryBtn.disabled = true;
            saveCategoryBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
        }
        
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
                    console.error('Error response from server:', data);
                    throw new Error(data.message || 'Failed to save category');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Category saved successfully:', data);
            // Close modal
            if (categoryModal) {
                try {
                    categoryModal.hide();
                } catch (error) {
                    console.error('Error hiding modal:', error);
                    // Try direct DOM approach as fallback
                    const modalElement = document.getElementById('categoryModal');
                    if (modalElement && modalElement.classList.contains('show')) {
                        const bsModal = bootstrap.Modal.getInstance(modalElement);
                        if (bsModal) bsModal.hide();
                    }
                }
            } else {
                console.log('No modal reference to hide');
            }
            
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
        })
        .finally(() => {
            // Re-enable save button
            if (saveCategoryBtn) {
                saveCategoryBtn.disabled = false;
                saveCategoryBtn.textContent = 'Save Category';
            }
        });
    }
    
    // Function to confirm category deletion
    function confirmDelete(id) {
        console.log('Confirming deletion of category ID:', id);
        if (deleteCategoryId) deleteCategoryId.value = id;
        
        if (deleteConfirmModal) {
            try {
                deleteConfirmModal.show();
                console.log('Delete confirmation modal shown successfully');
            } catch (error) {
                console.error('Error showing delete confirmation modal:', error);
                
                // Fallback approach: Try to access the modal directly from the DOM
                try {
                    const modalElement = document.getElementById('deleteConfirmModal');
                    if (modalElement) {
                        const bsModal = new bootstrap.Modal(modalElement);
                        bsModal.show();
                        console.log('Delete modal shown using fallback approach');
                        // Store the reference for future use
                        window.deleteConfirmModal = bsModal;
                    } else {
                        console.error('Could not find delete modal element in the DOM');
                    }
                } catch (fallbackError) {
                    console.error('Fallback approach failed:', fallbackError);
                    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
                        deleteCategory();
                    }
                }
            }
        } else {
            console.error('Delete confirmation modal not initialized');
            try {
                // Try to initialize the modal
                const modalElement = document.getElementById('deleteConfirmModal');
                if (modalElement) {
                    const bsModal = new bootstrap.Modal(modalElement);
                    bsModal.show();
                    console.log('Delete modal initialized and shown directly');
                    // Store the reference for future use
                    window.deleteConfirmModal = bsModal;
                } else {
                    // If modal can't be found, use a simple confirmation
                    console.log('Using simple confirmation as fallback');
                    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
                        deleteCategory();
                    }
                }
            } catch (directError) {
                console.error('Error initializing delete modal directly:', directError);
                // Fallback to simple confirm
                if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
                    deleteCategory();
                }
            }
        }
    }

    // Function to delete a category
    function deleteCategory() {
        const id = deleteCategoryId ? deleteCategoryId.value : null;
        if (!id) {
            console.error('No category ID to delete');
            return;
        }
        
        console.log('Deleting category ID:', id);
        
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
            console.log('Category deleted successfully:', data);
            // Close modal
            if (deleteConfirmModal) deleteConfirmModal.hide();
            
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
            if (deleteConfirmModal) deleteConfirmModal.hide();
        });
    }

    // Generate a slug from the category name
    if (categoryName) {
        categoryName.addEventListener('input', function() {
            // Only auto-generate slug if the slug field is empty or if we're creating a new category
            if ((!categorySlug || !categorySlug.value) && (!categoryId || !categoryId.value)) {
                const name = categoryName.value.trim();
                if (categorySlug) {
                    categorySlug.value = name
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '');
                }
            }
        });
    }

    // Function to show alert message
    function showAlert(alertElement, message) {
        if (!alertElement) return;
        
        alertElement.textContent = message;
        alertElement.style.display = 'block';
        
        setTimeout(() => {
            alertElement.style.display = 'none';
        }, 5000);
    }    // Event Listeners
    if (addCategoryBtn) {
        console.log('Adding event listener to addCategoryBtn');
        // Remove any existing event listeners to prevent duplication
        addCategoryBtn.removeEventListener('click', addCategory);
        // Add the event listener
        addCategoryBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Add category button clicked');
            addCategory();
        });
    } else {
        console.error('Add Category button not found in DOM');
    }
    
    if (saveCategoryBtn) {
        console.log('Adding event listener to saveCategoryBtn');
        // Remove any existing event listeners to prevent duplication
        saveCategoryBtn.removeEventListener('click', saveCategory);
        // Add the event listener
        saveCategoryBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Save category button clicked');
            saveCategory();
        });
    } else {
        console.error('Save Category button not found in DOM');
    }
    
    if (confirmDeleteBtn) {
        console.log('Adding event listener to confirmDeleteBtn');
        // Remove any existing event listeners to prevent duplication
        confirmDeleteBtn.removeEventListener('click', deleteCategory);
        // Add the event listener
        confirmDeleteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Confirm delete button clicked');
            deleteCategory();
        });
    } else {
        console.error('Confirm Delete button not found in DOM');
    }

    // Search input handler with debounce
    let searchTimeout;
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentPage = 1; // Reset to first page on new search
                loadCategories();
            }, 500);
        });
    }

    // Sort change handler
    if (sortCategories) {
        sortCategories.addEventListener('change', function() {
            loadCategories();
        });
    }

    // Handle sidebar toggle on mobile
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) sidebar.classList.toggle('show');
        });
    }

    // Initial load
    console.log('Initial data load');
    loadCategories();
    loadCategorySummary();
    loadParentCategories();
});
