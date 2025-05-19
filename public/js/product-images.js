// Product Images Management JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Get product ID from URL if available (for edit mode)
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        document.getElementById('imageManagementSection').style.display = 'none';
        document.getElementById('saveProductBtn').addEventListener('click', function() {
            const message = document.createElement('div');
            message.className = 'alert alert-info';
            message.textContent = 'Save the product first to add images';
            document.getElementById('imageManagementSection').appendChild(message);
            setTimeout(() => message.remove(), 3000);
        });
        return;
    }

    // DOM elements
    const productImagesContainer = document.getElementById('productImages');
    const successAlert = document.getElementById('successAlert');
    const errorAlert = document.getElementById('errorAlert');
    const imageForm = document.getElementById('imageForm');
    const imageUrl = document.getElementById('imageUrl');
    const imageAltText = document.getElementById('imageAltText');
    const isPrimaryImage = document.getElementById('isPrimaryImage');
    const addImageBtn = document.getElementById('addImageBtn');
    const imageUploadForm = document.getElementById('imageUploadForm');
    const imageFile = document.getElementById('imageFile');
    const uploadImageBtn = document.getElementById('uploadImageBtn');

    // Load product images
    function loadProductImages() {
        fetch(`/api/products/${productId}/images`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch product images');
            }
            return response.json();
        })
        .then(data => {
            if (data.data && data.data.length > 0) {
                renderProductImages(data.data);
            } else {
                productImagesContainer.innerHTML = '<div class="alert alert-info">No images available for this product. Add your first image.</div>';
            }
        })
        .catch(error => {
            console.error('Error loading product images:', error);
            showAlert(errorAlert, 'Failed to load product images. Please try again later.');
        });
    }

    // Render product images
    function renderProductImages(images) {
        let imagesHTML = '<div class="row">';
        
        images.forEach(image => {
            imagesHTML += `
                <div class="col-md-4 mb-3">
                    <div class="card">
                        <img src="${image.image_url}" class="card-img-top" alt="${image.alt_text || 'Product image'}">
                        <div class="card-body">
                            <p class="card-text">${image.alt_text || 'No description'}</p>
                            ${image.is_primary ? '<span class="badge bg-primary">Primary Image</span>' : ''}
                            <div class="mt-2">
                                <button class="btn btn-sm btn-danger delete-image" data-id="${image.id}">
                                    <i class="bi bi-trash"></i> Delete
                                </button>
                                ${!image.is_primary ? `<button class="btn btn-sm btn-primary ms-2 set-primary" data-id="${image.id}">
                                    <i class="bi bi-star"></i> Set as Primary
                                </button>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        imagesHTML += '</div>';
        productImagesContainer.innerHTML = imagesHTML;
        
        // Add event listeners to the delete and set primary buttons
        document.querySelectorAll('.delete-image').forEach(button => {
            button.addEventListener('click', function() {
                const imageId = this.getAttribute('data-id');
                deleteProductImage(imageId);
            });
        });
        
        document.querySelectorAll('.set-primary').forEach(button => {
            button.addEventListener('click', function() {
                const imageId = this.getAttribute('data-id');
                setPrimaryImage(imageId);
            });
        });
    }

    // Add a new product image by URL
    function addProductImage() {
        // Validate form
        if (!imageForm.checkValidity()) {
            imageForm.classList.add('was-validated');
            return;
        }
        
        const imageData = {
            image_url: imageUrl.value.trim(),
            alt_text: imageAltText.value.trim(),
            is_primary: isPrimaryImage.checked
        };
        
        fetch(`/api/products/${productId}/images`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(imageData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Failed to add image');
                });
            }
            return response.json();
        })
        .then(data => {
            // Reset form
            imageForm.reset();
            
            // Show success message
            showAlert(successAlert, 'Image added successfully');
            
            // Reload product images
            loadProductImages();
        })
        .catch(error => {
            console.error('Error adding product image:', error);
            showAlert(errorAlert, `Failed to add image: ${error.message}`);
        });
    }

    // Upload a new product image
    function uploadProductImage() {
        // Validate form
        if (!imageUploadForm.checkValidity() || !imageFile.files || !imageFile.files[0]) {
            imageUploadForm.classList.add('was-validated');
            return;
        }
        
        const formData = new FormData();
        formData.append('image', imageFile.files[0]);
        formData.append('alt_text', document.getElementById('uploadImageAltText').value.trim());
        formData.append('is_primary', document.getElementById('isUploadPrimaryImage').checked);
        
        fetch(`/api/products/${productId}/images/upload`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Failed to upload image');
                });
            }
            return response.json();
        })
        .then(data => {
            // Reset form
            imageUploadForm.reset();
            
            // Show success message
            showAlert(successAlert, 'Image uploaded successfully');
            
            // Reload product images
            loadProductImages();
        })
        .catch(error => {
            console.error('Error uploading product image:', error);
            showAlert(errorAlert, `Failed to upload image: ${error.message}`);
        });
    }

    // Set an image as primary
    function setPrimaryImage(imageId) {
        fetch(`/api/products/${productId}/images/${imageId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                is_primary: true
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Failed to set primary image');
                });
            }
            return response.json();
        })
        .then(data => {
            // Show success message
            showAlert(successAlert, 'Primary image updated successfully');
            
            // Reload product images
            loadProductImages();
        })
        .catch(error => {
            console.error('Error setting primary image:', error);
            showAlert(errorAlert, `Failed to set primary image: ${error.message}`);
        });
    }

    // Delete a product image
    function deleteProductImage(imageId) {
        if (!confirm('Are you sure you want to delete this image?')) {
            return;
        }
        
        fetch(`/api/products/${productId}/images/${imageId}`, {
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
                    throw new Error(data.message || 'Failed to delete image');
                });
            }
            return response.json();
        })
        .then(data => {
            // Show success message
            showAlert(successAlert, 'Image deleted successfully');
            
            // Reload product images
            loadProductImages();
        })
        .catch(error => {
            console.error('Error deleting product image:', error);
            showAlert(errorAlert, `Failed to delete image: ${error.message}`);
        });
    }

    // Function to show alert message
    function showAlert(alertElement, message) {
        alertElement.textContent = message;
        alertElement.style.display = 'block';
        
        setTimeout(() => {
            alertElement.style.display = 'none';
        }, 5000);
    }

    // Event listeners
    addImageBtn.addEventListener('click', addProductImage);
    uploadImageBtn && uploadImageBtn.addEventListener('click', uploadProductImage);

    // Initial load
    loadProductImages();
});
