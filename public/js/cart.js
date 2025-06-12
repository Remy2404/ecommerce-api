// Public/js/cart.js
// Shopping Cart page JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Elements
    const loadingState = document.getElementById('loadingState');
    const emptyCartState = document.getElementById('emptyCartState');
    const cartContent = document.getElementById('cartContent');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const cartBadge = document.getElementById('cartBadge');

    // Summary elements
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const taxEl = document.getElementById('tax');    const totalEl = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkoutBtn');

    // Payment modal elements
    const paymentModal = document.getElementById('paymentModal');
    const closePaymentModal = document.getElementById('closePaymentModal');
    const paymentForm = document.getElementById('paymentForm');
    const paymentSuccess = document.getElementById('paymentSuccess');
    const processPaymentBtn = document.getElementById('processPaymentBtn');
    const continueShoppingBtn = document.getElementById('continueShoppingBtn');

    // Payment summary elements
    const paymentSubtotal = document.getElementById('paymentSubtotal');
    const paymentShipping = document.getElementById('paymentShipping');
    const paymentTax = document.getElementById('paymentTax');
    const paymentTotal = document.getElementById('paymentTotal');

    let cartData = null;
    let selectedPaymentMethod = 'credit-card';

    // Load user info for navbar
    loadUserInfo();

    // Load cart data
    loadCart();    // Event listeners
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }

    if (closePaymentModal) {
        closePaymentModal.addEventListener('click', closeModal);
    }

    if (processPaymentBtn) {
        processPaymentBtn.addEventListener('click', processPayment);
    }    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', function() {
            closeModal();
            window.location.href = 'products.html';
        });
    }    // Add back to cart button in success view
    const backToCartBtn = document.getElementById('backToCartBtn');
    if (backToCartBtn) {
        backToCartBtn.addEventListener('click', function() {
            closeModal();
            window.location.href = 'my-orders.html'; // Redirect to orders page
        });
    }
    
    // Add view orders button in success view
    const viewOrdersBtn = document.getElementById('viewOrdersBtn');
    if (viewOrdersBtn) {
        viewOrdersBtn.addEventListener('click', function() {
            closeModal();
            window.location.href = 'my-orders.html'; // Redirect to orders page
        });
    }// Payment method selection
    document.querySelectorAll('.payment-option').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.payment-option').forEach(btn => btn.classList.remove('selected'));
            this.classList.add('selected');
            selectedPaymentMethod = this.dataset.method;
            
            const creditCardForm = document.getElementById('creditCardForm');
            // Show credit card form for any payment method (since we want to collect card info)
            if (creditCardForm) {
                creditCardForm.style.display = 'flex';
            }
        });
    });

    // Also allow clicking on the "or pay using credit card" section to enable credit card
    const separator = document.querySelector('.separator');
    if (separator) {
        separator.addEventListener('click', function() {
            document.querySelectorAll('.payment-option').forEach(btn => btn.classList.remove('selected'));
            selectedPaymentMethod = 'credit-card';
            
            const creditCardForm = document.getElementById('creditCardForm');
            if (creditCardForm) {
                creditCardForm.style.display = 'flex';
            }
        });
    }

    // Card number formatting
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }

    // Expiry date formatting
    const expiryInput = document.getElementById('expiryDate');
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }

    // CVV validation
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }

    // Close modal when clicking outside
    if (paymentModal) {
        paymentModal.addEventListener('click', function(e) {
            if (e.target === paymentModal) {
                closeModal();
            }
        });
    }

    // Logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }

    async function loadUserInfo() {
        try {
            const response = await fetch('/api/user', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (userNameDisplay) {
                    userNameDisplay.textContent = data.data.user.name;
                }
            }
        } catch (error) {
            console.error('Error loading user info:', error);
        }
    }

    async function loadCart() {
        showLoading();

        try {
            const response = await fetch('/api/cart', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });            if (response.ok) {
                const data = await response.json();
                cartData = data.data.cart; // Fix: access cart object correctly
                
                if (cartData && cartData.items && cartData.items.length > 0) {
                    renderCartItems();
                    updateCartSummary();
                    showCartContent();
                } else {
                    showEmptyCart();
                }
                updateCartBadge();
            } else {
                throw new Error('Failed to load cart');
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            showEmptyCart();
        }
    }    function renderCartItems() {
        if (!cartData || !cartData.items) return;        const itemsHtml = cartData.items.map(item => `
            <div class="border-bottom p-3" data-cart-item-id="${item.id}">
                <div class="row align-items-center">
                    <div class="col-md-2 col-3">
                        <img src="${item.image_url || 'https://via.placeholder.com/80x80?text=No+Image'}" 
                             alt="${item.product_name}" 
                             class="cart-item-image">
                    </div>
                    <div class="col-md-4 col-9">
                        <h6 class="mb-1">${item.product_name}</h6>
                        <p class="text-muted small mb-0 d-none d-md-block">Product ID: ${item.product_id}</p>
                        <span class="badge bg-secondary">Item</span>
                        <div class="mt-2">
                            <strong>$${parseFloat(item.price).toFixed(2)}</strong>
                        </div>
                    </div>
                    <div class="col-md-2 d-none d-md-block">
                        <strong>$${parseFloat(item.price).toFixed(2)}</strong>
                    </div>
                    <div class="col-md-3 col-8 mt-2 mt-md-0">
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">
                                <i class="fas fa-minus"></i>
                            </button>
                            <input type="number" 
                                   class="quantity-input" 
                                   value="${item.quantity}" 
                                   min="1" 
                                   max="99"
                                   onchange="updateQuantity(${item.id}, this.value)">
                            <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <small class="text-muted">Qty: ${item.quantity}</small>
                    </div>
                    <div class="col-md-1 col-4 mt-2 mt-md-0 text-end text-md-start">
                        <button class="btn btn-sm btn-outline-danger" onclick="removeItem(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        cartItemsContainer.innerHTML = itemsHtml;
    }    function updateCartSummary() {
        if (!cartData || !cartData.items) return;

        const subtotal = cartData.items.reduce((sum, item) => {
            return sum + (parseFloat(item.price) * item.quantity);
        }, 0);

        const shipping = subtotal > 100 ? 0 : 5.00; // Free shipping over $100
        const taxRate = 0.08; // 8% tax
        const tax = subtotal * taxRate;
        const total = subtotal + shipping + tax;

        if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
        if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
    }    function updateCartBadge() {
        if (!cartData || !cartData.items) {
            if (cartBadge) cartBadge.style.display = 'none';
            return;
        }

        const totalItems = cartData.total_items || cartData.items.reduce((sum, item) => sum + item.quantity, 0);
        if (cartBadge) {
            cartBadge.textContent = totalItems;
            cartBadge.style.display = totalItems > 0 ? 'inline' : 'none';
        }
    }

    function showLoading() {
        loadingState.style.display = 'block';
        emptyCartState.style.display = 'none';
        cartContent.style.display = 'none';
    }

    function showEmptyCart() {
        loadingState.style.display = 'none';
        emptyCartState.style.display = 'block';
        cartContent.style.display = 'none';
    }

    function showCartContent() {
        loadingState.style.display = 'none';
        emptyCartState.style.display = 'none';
        cartContent.style.display = 'block';
    }

    // Global functions for onclick handlers
    window.updateQuantity = async function(itemId, newQuantity) {
        if (newQuantity < 1) {
            removeItem(itemId);
            return;
        }        try {
            const response = await fetch(`/api/cart/items/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ quantity: parseInt(newQuantity) })
            });

            if (response.ok) {
                await loadCart(); // Reload cart to update UI
            } else {
                throw new Error('Failed to update quantity');
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            alert('Failed to update item quantity. Please try again.');
        }
    };

    window.removeItem = async function(itemId) {
        if (!confirm('Are you sure you want to remove this item from your cart?')) {
            return;
        }        try {
            const response = await fetch(`/api/cart/items/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                await loadCart(); // Reload cart to update UI
            } else {
                throw new Error('Failed to remove item');
            }
        } catch (error) {
            console.error('Error removing item:', error);
            alert('Failed to remove item. Please try again.');
        }
    };    async function handleCheckout() {
        if (!cartData || !cartData.items || cartData.items.length === 0) {
            alert('Your cart is empty');
            return;
        }

        // Update payment modal summary
        updatePaymentSummary();
        
        // Show payment modal
        showPaymentModal();
    }

    function showPaymentModal() {
        if (paymentModal) {
            paymentModal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Reset to payment form view
            paymentForm.style.display = 'block';
            paymentSuccess.style.display = 'none';
            
            // Reset form
            resetPaymentForm();
        }
    }

    function closeModal() {
        if (paymentModal) {
            paymentModal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    function updatePaymentSummary() {
        if (!cartData || !cartData.items) return;

        const subtotal = cartData.items.reduce((sum, item) => {
            return sum + (parseFloat(item.price) * item.quantity);
        }, 0);

        const shipping = subtotal > 100 ? 0 : 5.00;
        const taxRate = 0.08;
        const tax = subtotal * taxRate;
        const total = subtotal + shipping + tax;

        if (paymentSubtotal) paymentSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        if (paymentShipping) paymentShipping.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
        if (paymentTax) paymentTax.textContent = `$${tax.toFixed(2)}`;
        if (paymentTotal) paymentTotal.textContent = `$${total.toFixed(2)}`;
    }    function resetPaymentForm() {
        // Reset payment method selection
        document.querySelectorAll('.payment-option').forEach(btn => btn.classList.remove('selected'));
        
        // Select PayPal by default (first option)
        const firstBtn = document.querySelector('.payment-option');
        if (firstBtn) {
            firstBtn.classList.add('selected');
            selectedPaymentMethod = firstBtn.dataset.method;
        }

        // Show credit card form by default so users can enter their details
        const creditCardForm = document.getElementById('creditCardForm');
        if (creditCardForm) {
            creditCardForm.style.display = 'flex';
        }

        // Clear form inputs
        const inputs = document.querySelectorAll('#creditCardForm input');
        inputs.forEach(input => input.value = '');

        // Reset button state
        const paymentBtnText = document.getElementById('paymentBtnText');
        const paymentBtnSpinner = document.getElementById('paymentBtnSpinner');
        if (paymentBtnText) paymentBtnText.style.display = 'inline';
        if (paymentBtnSpinner) paymentBtnSpinner.style.display = 'none';
        if (processPaymentBtn) processPaymentBtn.disabled = false;
    }async function processPayment() {
        // Validate form if credit card payment is enabled (when credit card form is visible)
        const creditCardForm = document.getElementById('creditCardForm');
        const isCreditCardVisible = creditCardForm && creditCardForm.style.display !== 'none';
        
        if (isCreditCardVisible) {
            const cardHolderName = document.getElementById('cardHolderName').value;
            const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
            const expiryDate = document.getElementById('expiryDate').value;
            const cvv = document.getElementById('cvv').value;

            if (!cardHolderName || !cardNumber || !expiryDate || !cvv) {
                alert('Please fill in all credit card details');
                return;
            }

            if (cardNumber.length < 13 || cardNumber.length > 19) {
                alert('Please enter a valid card number');
                return;
            }

            if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
                alert('Please enter a valid expiry date (MM/YY)');
                return;
            }

            if (cvv.length < 3 || cvv.length > 4) {
                alert('Please enter a valid CVV');
                return;
            }
        }

        // Show loading state
        const paymentBtnText = document.getElementById('paymentBtnText');
        const paymentBtnSpinner = document.getElementById('paymentBtnSpinner');
        if (paymentBtnText) paymentBtnText.style.display = 'none';
        if (paymentBtnSpinner) paymentBtnSpinner.style.display = 'inline';
        if (processPaymentBtn) processPaymentBtn.disabled = true;        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Create order (simulate)
            const orderData = {
                items: cartData.items.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price_at_purchase: item.price,
                    product_name_at_purchase: item.product_name,
                    product: {
                        id: item.product_id,
                        name: item.product_name,
                        price: item.price,
                        image_url: item.image_url
                    }
                })),
                payment_method: selectedPaymentMethod,
                total_amount: calculateTotal(),
                shipping_address_line1: "123 Main St",
                shipping_address_line2: "",
                shipping_city: "Demo City",
                shipping_postal_code: "12345",
                shipping_country: "Demo Country",
                billing_address_line1: "123 Main St",
                billing_address_line2: "",
                billing_city: "Demo City",
                billing_postal_code: "12345",
                billing_country: "Demo Country"
            };

            let orderId;
            let orderCreated = false;

            // Try to create order via API first
            try {
                const response = await fetch('/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(orderData)
                });

                if (response.ok) {
                    const apiResult = await response.json();
                    orderId = apiResult.data.id;
                    orderCreated = true;
                    console.log('Order created via API:', orderId);
                } else {
                    throw new Error('API order creation failed');
                }
            } catch (apiError) {
                console.log('API order creation failed, using demo mode:', apiError);
                
                // Fallback to demo mode - create order in localStorage
                orderId = 'ORD-' + Date.now();
                
                const demoOrder = {
                    id: orderId,
                    order_number: orderId,
                    user_id: 1,
                    total_amount: calculateTotal(),
                    status: 'pending',
                    payment_method: selectedPaymentMethod,
                    payment_status: 'paid',
                    shipping_address_line1: orderData.shipping_address_line1,
                    shipping_city: orderData.shipping_city,
                    shipping_postal_code: orderData.shipping_postal_code,
                    shipping_country: orderData.shipping_country,
                    billing_address_line1: orderData.billing_address_line1,
                    billing_city: orderData.billing_city,
                    billing_postal_code: orderData.billing_postal_code,
                    billing_country: orderData.billing_country,
                    ordered_at: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    items: orderData.items
                };

                // Save to localStorage
                const demoOrders = JSON.parse(localStorage.getItem('demo_orders') || '[]');
                demoOrders.push(demoOrder);
                localStorage.setItem('demo_orders', JSON.stringify(demoOrders));
                localStorage.setItem('demo_mode', 'true');
                
                orderCreated = true;
                console.log('Demo order created and saved to localStorage:', orderId);
            }

            if (orderCreated) {
                // Store the order ID for highlighting in my-orders page
                localStorage.setItem('last_order_id', orderId);
                
                // Clear cart after successful payment
                await clearCart();
                
                // Show success view
                showPaymentSuccess(orderId);
            } else {
                throw new Error('Failed to create order');
            }

        } catch (error) {
            console.error('Payment failed:', error);
            alert('Payment failed. Please try again.');
            
            // Reset button state
            if (paymentBtnText) paymentBtnText.style.display = 'inline';
            if (paymentBtnSpinner) paymentBtnSpinner.style.display = 'none';
            if (processPaymentBtn) processPaymentBtn.disabled = false;
        }
    }

    function calculateTotal() {
        if (!cartData || !cartData.items) return 0;

        const subtotal = cartData.items.reduce((sum, item) => {
            return sum + (parseFloat(item.price) * item.quantity);
        }, 0);

        const shipping = subtotal > 100 ? 0 : 5.00;
        const taxRate = 0.08;
        const tax = subtotal * taxRate;
        
        return subtotal + shipping + tax;
    }

    async function clearCart() {        try {
            const response = await fetch('/api/cart/clear', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                cartData = { items: [] };
                updateCartBadge();
            }
        } catch (error) {
            console.error('Error clearing cart:', error);
        }
    }    function showPaymentSuccess(orderId) {
        paymentForm.style.display = 'none';
        paymentSuccess.style.display = 'block';
        
        const orderIdDisplay = document.getElementById('orderIdDisplay');
        if (orderIdDisplay) {
            orderIdDisplay.textContent = orderId;
        }

        // Auto-close modal and redirect after 5 seconds
        setTimeout(() => {
            closeModal();
            // Show success message on the page
            showSuccessMessage('🎉 Payment successful! Your order has been placed.');
            // Redirect to my-orders page to show the new order
            setTimeout(() => {
                window.location.href = 'my-orders.html';
            }, 2000);
        }, 5000);
    }

    function showSuccessMessage(message) {
        // Create a toast notification or update the page
        const alertContainer = document.createElement('div');
        alertContainer.className = 'alert alert-success alert-dismissible fade show position-fixed';
        alertContainer.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertContainer.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alertContainer);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alertContainer.parentNode) {
                alertContainer.remove();
            }
        }, 5000);
    }

    function handleLogout() {
        fetch('/api/logout', { 
            method: 'POST', 
            headers: { 'Authorization': `Bearer ${token}` } 
        })
        .finally(() => {
            localStorage.removeItem('auth_token');
            window.location.href = 'login.html';
        });
    }
});
