document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const token = localStorage.getItem('auth_token');
    if (token) {
        // Update navigation for logged in users
        const navLinks = document.querySelector('#navbarNav');
        const authButtons = navLinks.querySelector('.d-flex');
        authButtons.innerHTML = `
            <a href="dashboard.html" class="btn btn-outline-light me-2">Dashboard</a>
            <button id="logoutBtn" class="btn btn-light">Logout</button>
        `;
        
        // Add logout functionality
        document.getElementById('logoutBtn').addEventListener('click', function() {
            fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(() => {
                localStorage.removeItem('auth_token');
                window.location.reload();
            })
            .catch(error => {
                console.error('Logout error:', error);
                localStorage.removeItem('auth_token');
                window.location.reload();
            });
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add counter animation for statistics (if any stats are added later)
    function animateCounters() {
        const counters = document.querySelectorAll('.counter');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const count = +counter.innerText;
            const increment = target / 100;
            
            if (count < target) {
                counter.innerText = Math.ceil(count + increment);
                setTimeout(() => animateCounters(), 20);
            } else {
                counter.innerText = target;
            }
        });
    }

    // Parallax effect for hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero-section');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });

    // Add loading animation when navigating to other pages
    document.querySelectorAll('a[href$=".html"]').forEach(link => {
        link.addEventListener('click', function(e) {
            // Only add loading for internal links
            if (this.hostname === window.location.hostname) {
                const loadingOverlay = document.createElement('div');
                loadingOverlay.className = 'loading-overlay';
                loadingOverlay.innerHTML = `
                    <div class="loading-spinner">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                `;
                document.body.appendChild(loadingOverlay);
            }
        });
    });

    // Add intersection observer for enhanced animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe all sections for animation
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // Add hover effects for interactive elements
    document.querySelectorAll('.feature-card, .problem-card, .challenge-item').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add click-to-copy functionality for code snippets
    document.querySelectorAll('pre').forEach(pre => {
        const copyButton = document.createElement('button');
        copyButton.className = 'btn btn-sm btn-outline-light copy-btn';
        copyButton.innerHTML = '<i class="bi bi-clipboard"></i>';
        copyButton.style.position = 'absolute';
        copyButton.style.top = '10px';
        copyButton.style.right = '10px';
        
        pre.style.position = 'relative';
        pre.appendChild(copyButton);
        
        copyButton.addEventListener('click', function() {
            navigator.clipboard.writeText(pre.textContent).then(() => {
                copyButton.innerHTML = '<i class="bi bi-check"></i>';
                setTimeout(() => {
                    copyButton.innerHTML = '<i class="bi bi-clipboard"></i>';
                }, 2000);
            });
        });
    });

    // Add dynamic typing effect to hero subtitle (optional enhancement)
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        const originalText = heroSubtitle.textContent;
        const words = ['RESTful API', 'Laravel Backend', 'Modern Solution', 'Scalable Platform'];
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function typeEffect() {
            const currentWord = words[wordIndex];
            
            if (isDeleting) {
                heroSubtitle.textContent = `A powerful ${currentWord.substring(0, charIndex - 1)} for your ecommerce applications`;
                charIndex--;
            } else {
                heroSubtitle.textContent = `A powerful ${currentWord.substring(0, charIndex + 1)} for your ecommerce applications`;
                charIndex++;
            }

            if (!isDeleting && charIndex === currentWord.length) {
                setTimeout(() => isDeleting = true, 2000);
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
            }

            setTimeout(typeEffect, isDeleting ? 50 : 150);
        }

        // Start typing effect after a delay
        setTimeout(typeEffect, 2000);
    }

    // Database Schema Interactive Features
    initializeDatabaseSchema();
});

function initializeDatabaseSchema() {
    // Initialize Mermaid with custom configuration
    if (typeof mermaid !== 'undefined') {
        mermaid.initialize({
            startOnLoad: false, // Changed to false for better control
            theme: 'default',
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true
            },
            er: {
                useMaxWidth: true,
                entityPadding: 15,
                edgeLengthFactor: 20,
                fontSize: 12,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            },
            themeVariables: {
                primaryColor: '#5c6ac4',
                primaryTextColor: '#fff',
                primaryBorderColor: '#4c5bac',
                lineColor: '#6c757d',
                secondaryColor: '#f8f9fa',
                tertiaryColor: '#e9ecef'
            }
        });

        // Wait for DOM elements to be ready, then add event listeners
        waitForElementsAndAttachListeners();

        // Force render the diagram with retry mechanism
        renderDiagramWithRetry();
    } else {
        console.warn('Mermaid library not loaded, showing fallback');
        showSchemaFallback();
        waitForElementsAndAttachListeners(); // Still add event listeners for fallback
    }
}

function renderDiagramWithRetry(retryCount = 0) {
    const maxRetries = 3;
    const diagramElement = document.getElementById('databaseDiagram');
    
    if (!diagramElement) {
        console.error('Database diagram element not found');
        return;
    }

    const diagramText = diagramElement.textContent.trim();
    
    mermaid.render('databaseDiagramSvg', diagramText)
        .then(({svg}) => {
            diagramElement.innerHTML = svg;
            console.log('Mermaid diagram rendered successfully');
            addSchemaInteractivity();
        })
        .catch(error => {
            console.error('Mermaid rendering error (attempt ' + (retryCount + 1) + '):', error);
            if (retryCount < maxRetries) {
                setTimeout(() => renderDiagramWithRetry(retryCount + 1), 1000);
            } else {
                console.warn('Max retries reached, showing fallback');
                showSchemaFallback();
            }
        });
}

function waitForElementsAndAttachListeners() {
    // Function to check if elements exist and attach listeners
    function checkAndAttach() {
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        const resetZoomBtn = document.getElementById('resetZoomBtn');
        const schemaContainer = document.getElementById('schemaContainer');

        console.log('Checking for elements...');
        console.log('Fullscreen button found:', !!fullscreenBtn);
        console.log('Reset zoom button found:', !!resetZoomBtn);
        console.log('Schema container found:', !!schemaContainer);

        if (fullscreenBtn && resetZoomBtn && schemaContainer) {
            console.log('All elements found, attaching event listeners');
            addSchemaEventListeners();
            return true;
        }
        return false;
    }

    // Try immediately
    if (checkAndAttach()) {
        return;
    }

    // If elements not found, try with increasing delays
    const delays = [100, 250, 500, 1000, 2000];
    let attemptCount = 0;

    function retryAttach() {
        attemptCount++;
        console.log(`Retry attempt ${attemptCount} to find elements`);
        
        if (checkAndAttach()) {
            console.log('Elements found and listeners attached successfully');
            return;
        }

        if (attemptCount < delays.length) {
            setTimeout(retryAttach, delays[attemptCount - 1]);
        } else {
            console.error('Failed to find required elements after all retry attempts');
        }
    }

    setTimeout(retryAttach, delays[0]);
}

function addSchemaEventListeners() {
    // Add event listeners for schema controls
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const resetZoomBtn = document.getElementById('resetZoomBtn');
    const schemaContainer = document.getElementById('schemaContainer');

    console.log('Adding schema event listeners...');
    console.log('Fullscreen button:', fullscreenBtn);
    console.log('Reset zoom button:', resetZoomBtn);
    console.log('Schema container:', schemaContainer);

    if (fullscreenBtn) {
        // Remove any existing listeners to prevent duplicates
        const newFullscreenBtn = fullscreenBtn.cloneNode(true);
        if (fullscreenBtn.parentNode) {
            fullscreenBtn.parentNode.replaceChild(newFullscreenBtn, fullscreenBtn);
            
            newFullscreenBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Fullscreen button clicked');
                toggleFullscreen();
            });
            console.log('Fullscreen event listener added');
        }
    } else {
        console.error('Fullscreen button not found');
    }

    if (resetZoomBtn) {
        // Remove any existing listeners to prevent duplicates
        const newResetZoomBtn = resetZoomBtn.cloneNode(true);
        if (resetZoomBtn.parentNode) {
            resetZoomBtn.parentNode.replaceChild(newResetZoomBtn, resetZoomBtn);
            
            newResetZoomBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Reset zoom button clicked');
                resetSchemaZoom();
            });
            console.log('Reset zoom event listener added');
        }
    } else {
        console.error('Reset zoom button not found');
    }

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && schemaContainer && schemaContainer.classList.contains('fullscreen')) {
            console.log('Escape key pressed, exiting fullscreen');
            exitFullscreen();
        }
    });
    
    console.log('All schema event listeners added successfully');
}

function addSchemaInteractivity() {
    const svg = document.querySelector('#databaseDiagram svg');
    if (!svg) {
        console.error('SVG element not found for interactivity');
        return;
    }

    console.log('Adding schema interactivity to SVG');

    // Add zoom and pan functionality
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    svg.style.cursor = 'grab';
    svg.style.transformOrigin = 'center';
    svg.style.transition = 'transform 0.1s ease-out';

    // Add event listeners
    svg.addEventListener('wheel', handleZoom, { passive: false });
    svg.addEventListener('mousedown', startDrag);
    svg.addEventListener('mousemove', drag);
    svg.addEventListener('mouseup', endDrag);
    svg.addEventListener('mouseleave', endDrag);

    // Touch events for mobile
    svg.addEventListener('touchstart', handleTouchStart, { passive: false });
    svg.addEventListener('touchmove', handleTouchMove, { passive: false });
    svg.addEventListener('touchend', handleTouchEnd);

    let lastTouchDistance = 0;

    function handleZoom(e) {
        e.preventDefault();
        const rect = svg.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(0.3, Math.min(5, scale * zoomFactor));

        if (newScale !== scale) {
            const scaleChange = newScale / scale;
            translateX = x - (x - translateX) * scaleChange;
            translateY = y - (y - translateY) * scaleChange;
            scale = newScale;
            updateTransform();
        }
    }

    function startDrag(e) {
        e.preventDefault();
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        svg.style.cursor = 'grabbing';
        svg.style.transition = 'none';
    }

    function drag(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        const deltaX = e.clientX - lastX;
        const deltaY = e.clientY - lastY;
        
        translateX += deltaX;
        translateY += deltaY;
        
        lastX = e.clientX;
        lastY = e.clientY;
        
        updateTransform();
    }

    function endDrag(e) {
        if (isDragging) {
            isDragging = false;
            svg.style.cursor = 'grab';
            svg.style.transition = 'transform 0.1s ease-out';
        }
    }

    function handleTouchStart(e) {
        if (e.touches.length === 1) {
            // Single touch - start drag
            const touch = e.touches[0];
            isDragging = true;
            lastX = touch.clientX;
            lastY = touch.clientY;
        } else if (e.touches.length === 2) {
            // Two finger touch - prepare for zoom
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            lastTouchDistance = Math.sqrt(
                Math.pow(touch2.clientX - touch1.clientX, 2) +
                Math.pow(touch2.clientY - touch1.clientY, 2)
            );
        }
        e.preventDefault();
    }

    function handleTouchMove(e) {
        if (e.touches.length === 1 && isDragging) {
            // Single touch - drag
            const touch = e.touches[0];
            const deltaX = touch.clientX - lastX;
            const deltaY = touch.clientY - lastY;
            
            translateX += deltaX;
            translateY += deltaY;
            
            lastX = touch.clientX;
            lastY = touch.clientY;
            
            updateTransform();
        } else if (e.touches.length === 2) {
            // Two finger touch - zoom
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.sqrt(
                Math.pow(touch2.clientX - touch1.clientX, 2) +
                Math.pow(touch2.clientY - touch1.clientY, 2)
            );

            if (lastTouchDistance > 0) {
                const zoomFactor = currentDistance / lastTouchDistance;
                const newScale = Math.max(0.3, Math.min(5, scale * zoomFactor));
                
                if (newScale !== scale) {
                    scale = newScale;
                    updateTransform();
                }
            }
            
            lastTouchDistance = currentDistance;
        }
        e.preventDefault();
    }

    function handleTouchEnd(e) {
        isDragging = false;
        lastTouchDistance = 0;
    }

    function updateTransform() {
        const transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        svg.style.transform = transform;
        console.log('Transform updated:', transform);
    }

    // Store reset function for later use - make it globally accessible
    window.resetSchemaTransform = function() {
        console.log('Resetting schema transform');
        scale = 1;
        translateX = 0;
        translateY = 0;
        svg.style.transition = 'transform 0.3s ease';
        updateTransform();
        setTimeout(() => {
            svg.style.transition = 'transform 0.1s ease-out';
        }, 300);
    };

    console.log('Schema interactivity added successfully');
}

function toggleFullscreen() {
    console.log('Toggle fullscreen called');
    const schemaContainer = document.getElementById('schemaContainer');
    
    if (!schemaContainer) {
        console.error('Schema container not found');
        return;
    }

    console.log('Current fullscreen state:', schemaContainer.classList.contains('fullscreen'));

    if (schemaContainer.classList.contains('fullscreen')) {
        console.log('Exiting fullscreen');
        exitFullscreen();
    } else {
        console.log('Entering fullscreen');
        enterFullscreen();
    }
}

function enterFullscreen() {
    const schemaContainer = document.getElementById('schemaContainer');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    if (!schemaContainer) {
        console.error('Schema container not found for fullscreen');
        return;
    }

    console.log('Entering fullscreen mode');
    
    // Add fullscreen class with smooth transition
    schemaContainer.style.transition = 'all 0.3s ease';
    schemaContainer.classList.add('fullscreen');
    
    // Update button icon
    if (fullscreenBtn) {
        fullscreenBtn.innerHTML = '<i class="bi bi-fullscreen-exit"></i>';
        fullscreenBtn.title = 'Exit Fullscreen';
    }
    
    // Add close button in fullscreen mode
    const existingCloseBtn = document.getElementById('fullscreenCloseBtn');
    if (existingCloseBtn) {
        existingCloseBtn.remove();
    }
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn btn-danger position-absolute';
    closeBtn.style.cssText = 'top: 20px; right: 20px; z-index: 10001; opacity: 0.9;';
    closeBtn.innerHTML = '<i class="bi bi-x-lg"></i>';
    closeBtn.onclick = function(e) {
        e.preventDefault();
        console.log('Close button clicked');
        exitFullscreen();
    };
    closeBtn.id = 'fullscreenCloseBtn';
    closeBtn.title = 'Exit Fullscreen (ESC)';
    schemaContainer.appendChild(closeBtn);
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    
    // Force a repaint to ensure the fullscreen class is applied
    setTimeout(() => {
        schemaContainer.style.transition = '';
    }, 300);
    
    console.log('Fullscreen mode activated');
}

function exitFullscreen() {
    const schemaContainer = document.getElementById('schemaContainer');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const closeBtn = document.getElementById('fullscreenCloseBtn');
    
    console.log('Exiting fullscreen mode');
    
    if (schemaContainer) {
        schemaContainer.style.transition = 'all 0.3s ease';
        schemaContainer.classList.remove('fullscreen');
        
        // Remove transition after animation
        setTimeout(() => {
            schemaContainer.style.transition = '';
        }, 300);
    }
    
    if (fullscreenBtn) {
        fullscreenBtn.innerHTML = '<i class="bi bi-arrows-fullscreen"></i>';
        fullscreenBtn.title = 'Fullscreen View';
    }
    
    if (closeBtn) {
        closeBtn.remove();
    }
    
    // Restore body scrolling
    document.body.style.overflow = '';
    
    console.log('Fullscreen mode deactivated');
}

function resetSchemaZoom() {
    console.log('Reset zoom called');
    
    if (typeof window.resetSchemaTransform === 'function') {
        console.log('Calling resetSchemaTransform');
        window.resetSchemaTransform();
    } else {
        console.warn('resetSchemaTransform function not available, attempting direct reset');
        // Fallback: try to reset SVG transform directly
        const svg = document.querySelector('#databaseDiagram svg');
        if (svg) {
            svg.style.transform = 'translate(0px, 0px) scale(1)';
            console.log('Direct SVG transform reset applied');
        } else {
            console.error('SVG element not found for zoom reset');
        }
    }
}

function showSchemaFallback() {
    const diagramElement = document.getElementById('databaseDiagram');
    if (diagramElement) {
        diagramElement.innerHTML = `
            <div class="schema-fallback text-center py-5">
                <i class="bi bi-diagram-3 text-muted" style="font-size: 4rem;"></i>
                <h5 class="mt-3 text-muted">Database Schema Diagram</h5>
                <p class="text-muted">
                    Interactive diagram showing the complete e-commerce database structure
                    with entities, relationships, and constraints.
                </p>
                <div class="row mt-4">
                    <div class="col-md-6">
                        <h6 class="text-primary">Core Entities</h6>
                        <ul class="list-unstyled text-start">
                            <li>• Users & User Profiles</li>
                            <li>• Products & Categories</li>
                            <li>• Orders & Order Items</li>
                            <li>• Shopping Carts</li>
                            <li>• Product Images & Tags</li>
                        </ul>
                    </div>
                    <div class="col-md-6">
                        <h6 class="text-primary">Key Features</h6>
                        <ul class="list-unstyled text-start">
                            <li>• One-to-One: User → Profile</li>
                            <li>• One-to-Many: User → Orders</li>
                            <li>• Many-to-Many: Products ↔ Tags</li>
                            <li>• Self-referencing: Categories</li>
                            <li>• Proper Foreign Keys</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }
}

// Debug and testing functions - can be called from browser console
window.debugSchemaFunctions = function() {
    console.log('=== Schema Debug Information ===');
    console.log('Fullscreen button:', document.getElementById('fullscreenBtn'));
    console.log('Reset zoom button:', document.getElementById('resetZoomBtn'));
    console.log('Schema container:', document.getElementById('schemaContainer'));
    console.log('Database diagram:', document.getElementById('databaseDiagram'));
    console.log('SVG element:', document.querySelector('#databaseDiagram svg'));
    console.log('Current fullscreen state:', document.getElementById('schemaContainer')?.classList.contains('fullscreen'));
    console.log('=== End Debug Information ===');
};

window.testFullscreen = function() {
    console.log('Testing fullscreen functionality...');
    const schemaContainer = document.getElementById('schemaContainer');
    if (schemaContainer) {
        console.log('Schema container found, toggling fullscreen');
        toggleFullscreen();
    } else {
        console.error('Schema container not found');
    }
};

window.testResetZoom = function() {
    console.log('Testing reset zoom functionality...');
    resetSchemaZoom();
};

// Global functions to make them accessible
window.toggleFullscreen = toggleFullscreen;
window.resetSchemaZoom = resetSchemaZoom;

console.log('Schema debugging functions loaded. Available functions:');
console.log('- debugSchemaFunctions() - Shows debug information');
console.log('- testFullscreen() - Tests fullscreen toggle');
console.log('- testResetZoom() - Tests zoom reset');
console.log('- toggleFullscreen() - Direct fullscreen toggle');
console.log('- resetSchemaZoom() - Direct zoom reset');