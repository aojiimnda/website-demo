// DOM Elements
const cartIcon = document.querySelector('.cart-icon');
const cartCount = document.querySelector('.cart-count');
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const productCards = document.querySelectorAll('.product-card');

// Initialize cart from localStorage or create empty cart
let cart = JSON.parse(localStorage.getItem('dcreativecraftsCart')) || [];
updateCartCount();

// Cart popup elements
let cartPopup;
let cartItemsContainer;
let cartTotal;

// Cart functionality
function createCartPopup() {
    // Create cart popup if it doesn't exist
    if (!document.querySelector('.cart-popup')) {
        cartPopup = document.createElement('div');
        cartPopup.className = 'cart-popup';
        cartPopup.innerHTML = `
            <div class="cart-header">
                <h3>Your Shopping Cart</h3>
                <button class="close-cart"><i class="fas fa-times"></i></button>
            </div>
            <div class="cart-items-container"></div>
            <div class="cart-footer">
                <div class="cart-total">Total: ₱0.00</div>
                <div class="cart-actions">
                    <button class="clear-cart">Clear Cart</button>
                    <button class="checkout-button">Checkout</button>
                </div>
            </div>
        `;
        document.body.appendChild(cartPopup);
        
        // Add event listeners to cart popup elements
        cartPopup.querySelector('.close-cart').addEventListener('click', toggleCart);
        cartPopup.querySelector('.clear-cart').addEventListener('click', clearCart);
        cartPopup.querySelector('.checkout-button').addEventListener('click', checkout);
        
        // Store references to frequently accessed elements
        cartItemsContainer = cartPopup.querySelector('.cart-items-container');
        cartTotal = cartPopup.querySelector('.cart-total');

        // Add cart popup styles
        const cartStyles = document.createElement('style');
        cartStyles.textContent = `
            .cart-popup {
                position: fixed;
                top: 80px;
                right: -400px;
                width: 350px;
                max-height: 80vh;
                background-color: var(--white);
                box-shadow: -5px 0 15px rgba(0,0,0,0.1);
                z-index: 99;
                transition: right 0.3s ease;
                display: flex;
                flex-direction: column;
                border-radius: 8px 0 0 8px;
                overflow: hidden;
            }
            .cart-popup.active {
                right: 0;
            }
            .cart-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                background-color: var(--darker-pink);
                color: var(--white);
            }
            .cart-header h3 {
                margin: 0;
                font-size: 20px;
            }
            .close-cart {
                background: none;
                border: none;
                color: var(--white);
                cursor: pointer;
                font-size: 18px;
            }
            .cart-items-container {
                flex: 1;
                overflow-y: auto;
                padding: 15px;
                max-height: 60vh;
            }
            .cart-item {
                display: flex;
                margin-bottom: 15px;
                padding-bottom: 15px;
                border-bottom: 1px solid var(--light-pink);
            }
            .cart-item-image {
                width: 60px;
                height: 60px;
                object-fit: cover;
                border-radius: 4px;
                margin-right: 15px;
            }
            .cart-item-details {
                flex: 1;
            }
            .cart-item-title {
                font-size: 16px;
                margin: 0 0 5px 0;
                color: var(--text-color);
            }
            .cart-item-price {
                font-size: 14px;
                color: var(--darker-pink);
                font-weight: 600;
            }
            .cart-item-actions {
                display: flex;
                align-items: center;
                margin-top: 5px;
            }
            .quantity-control {
                display: flex;
                align-items: center;
            }
            .quantity-btn {
                background: none;
                border: 1px solid var(--light-pink);
                width: 25px;
                height: 25px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--text-color);
                border-radius: 4px;
            }
            .item-quantity {
                margin: 0 8px;
                font-size: 14px;
            }
            .remove-item {
                background: none;
                border: none;
                color: #ff6b6b;
                cursor: pointer;
                margin-left: 10px;
                font-size: 14px;
            }
            .cart-footer {
                padding: 15px;
                background-color: var(--light-pink);
            }
            .cart-total {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 10px;
                color: var(--text-color);
            }
            .cart-actions {
                display: flex;
                justify-content: space-between;
            }
            .overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.5);
                z-index: 98;
                display: none;
            }
            .overlay.active {
                display: block;
            }
            .empty-cart-message {
                text-align: center;
                padding: 20px;
                color: var(--text-color);
                font-style: italic;
            }
            @media (max-width: 576px) {
                .cart-popup {
                    width: 300px;
                }
            }
        `;
        document.head.appendChild(cartStyles);
    }
}

// Create overlay for cart background
function createOverlay() {
    if (!document.querySelector('.overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        document.body.appendChild(overlay);
        
        overlay.addEventListener('click', toggleCart);
    }
}

// Toggle cart visibility
function toggleCart() {
    createCartPopup();
    createOverlay();
    
    const overlay = document.querySelector('.overlay');
    
    cartPopup.classList.toggle('active');
    overlay.classList.toggle('active');
    
    if (cartPopup.classList.contains('active')) {
        renderCartItems();
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

// Add item to cart
function addToCart(title, price, imageSrc) {
    // Check if item already in cart
    const existingItemIndex = cart.findIndex(item => item.title === title);
    
    if (existingItemIndex > -1) {
        // Increase quantity if item exists
        cart[existingItemIndex].quantity++;
    } else {
        // Add new item to cart
        cart.push({
            title,
            price,
            imageSrc,
            quantity: 1
        });
    }
    
    // Save cart to localStorage
    saveCart();
    
    // Update cart count
    updateCartCount();
    
    // Show notification
    showNotification(`${title} added to cart!`);
}

// Clear cart function
function clearCart() {
    // Clear cart array
    cart = [];
    
    // Save empty cart to localStorage
    saveCart();
    
    // Update cart count
    updateCartCount();
    
    // Render empty cart
    renderCartItems();
    
    // Show notification
    showNotification('Cart has been cleared!');
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('dcreativecraftsCart', JSON.stringify(cart));
}

// Update cart count badge
function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Hide count if zero
    if (totalItems === 0) {
        cartCount.style.display = 'none';
    } else {
        cartCount.style.display = 'flex';
    }
}

// Render cart items
function renderCartItems() {
    if (!cartItemsContainer) return;
    
    // Clear container
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart-message">Your cart is empty</div>';
        cartTotal.textContent = 'Total: ₱0.00';
        return;
    }
    
    // Calculate total
    let total = 0;
    
    // Add each item to cart
    cart.forEach((item, index) => {
        const itemTotal = parseFloat(item.price.replace('₱', '').replace(',', '')) * item.quantity;
        total += itemTotal;
        
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <img src="${item.imageSrc}" alt="${item.title}" class="cart-item-image">
            <div class="cart-item-details">
                <h4 class="cart-item-title">${item.title}</h4>
                <p class="cart-item-price">${item.price} × ${item.quantity}</p>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button class="quantity-btn decrease">-</button>
                        <span class="item-quantity">${item.quantity}</span>
                        <button class="quantity-btn increase">+</button>
                    </div>
                    <button class="remove-item">Remove</button>
                </div>
            </div>
        `;
        
        // Add event listeners for quantity buttons
        cartItemElement.querySelector('.decrease').addEventListener('click', () => updateItemQuantity(index, -1));
        cartItemElement.querySelector('.increase').addEventListener('click', () => updateItemQuantity(index, 1));
        cartItemElement.querySelector('.remove-item').addEventListener('click', () => removeItemFromCart(index));
        
        cartItemsContainer.appendChild(cartItemElement);
    });
    
    // Update total
    cartTotal.textContent = `Total: ₱${total.toFixed(2)}`;
}

// Update item quantity
function updateItemQuantity(index, change) {
    cart[index].quantity += change;
    
    // Remove item if quantity reaches 0
    if (cart[index].quantity <= 0) {
        removeItemFromCart(index);
        return;
    }
    
    // Save and update cart
    saveCart();
    updateCartCount();
    renderCartItems();
}

// Remove item from cart
function removeItemFromCart(index) {
    const removedItem = cart[index];
    cart.splice(index, 1);
    
    // Save and update cart
    saveCart();
    updateCartCount();
    renderCartItems();
    
    // Show notification
    showNotification(`${removedItem.title} removed from cart!`);
}

// Checkout function
function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    // Here you would typically redirect to a checkout page
    // For demo purposes, we'll just show a notification
    showNotification('Proceeding to checkout...');
    
    // Clear cart after checkout
    setTimeout(() => {
        cart = [];
        saveCart();
        updateCartCount();
        toggleCart();
        showNotification('Thank you for your purchase!');
    }, 1500);
}

// Show notification (unified notification system)
function showNotification(message, title = '', icon = '') {
    // For simple notifications (old format)
    if (title === '' && icon === '') {
        // Remove existing notification if any
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        // Add notification styles if not already added
        if (!document.querySelector('style#simple-notification-style')) {
            const notificationStyles = document.createElement('style');
            notificationStyles.id = 'simple-notification-style';
            notificationStyles.textContent = `
                .notification {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background-color: var(--darker-pink);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 4px;
                    z-index: 1000;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                    animation: fadeInOut 3s forwards;
                }
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translate(-50%, 20px); }
                    10% { opacity: 1; transform: translate(-50%, 0); }
                    90% { opacity: 1; transform: translate(-50%, 0); }
                    100% { opacity: 0; transform: translate(-50%, -20px); }
                }
            `;
            document.head.appendChild(notificationStyles);
        }
        
        // Add to body and remove after animation
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000);
    } 
    // For advanced notifications (new format with title and icon)
    else {
        // Use notification container
        let notifContainer = document.querySelector('.notification-container');
        if (!notifContainer) {
            notifContainer = document.createElement('div');
            notifContainer.className = 'notification-container';
            document.body.appendChild(notifContainer);
            
            // Add styles for advanced notifications if not already added
            if (!document.querySelector('style#advanced-notification-style')) {
                const advancedNotifStyles = document.createElement('style');
                advancedNotifStyles.id = 'advanced-notification-style';
                advancedNotifStyles.textContent = `
                    .notification-container {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        z-index: 1000;
                        max-width: 350px;
                    }
                    .notification-container .notification {
                        background-color: white;
                        border-radius: 6px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                        margin-bottom: 10px;
                        display: flex;
                        overflow: hidden;
                        animation: slideIn 0.3s ease forwards;
                    }
                    .notification-icon {
                        width: 50px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background-color: var(--darker-pink);
                        color: white;
                    }
                    .notification-content {
                        flex: 1;
                        padding: 15px;
                    }
                    .notification-title {
                        font-weight: bold;
                        margin-bottom: 5px;
                    }
                    .notification-message {
                        font-size: 14px;
                        color: #666;
                    }
                    .notification-close {
                        background: none;
                        border: none;
                        color: #aaa;
                        cursor: pointer;
                        padding: 8px;
                        align-self: flex-start;
                    }
                    @keyframes slideIn {
                        from {
                            transform: translateX(100%);
                            opacity: 0;
                        }
                        to {
                            transform: translateX(0);
                            opacity: 1;
                        }
                    }
                    @keyframes fadeOut {
                        from {
                            opacity: 1;
                        }
                        to {
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(advancedNotifStyles);
            }
        }
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas ${icon || 'fa-check-circle'}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${title || 'Notification'}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        notifContainer.appendChild(notification);
        
        // Handle close button
        notification.querySelector('.notification-close').addEventListener('click', function() {
            notification.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 4000);
    }
}

// Fix 'About Us' image sizing
function fixAboutImage() {
    const aboutImage = document.querySelector('.about-image img');
    if (aboutImage) {
        aboutImage.style.objectFit = 'cover';
        aboutImage.style.width = '100%';
        aboutImage.style.height = '100%';
    }
}

// Event Listeners
// Toggle cart on cart icon click
cartIcon.addEventListener('click', toggleCart);

// Add to cart buttons - main handler for adding products to cart
addToCartButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
        const card = productCards[index];
        const title = card.querySelector('.product-title').textContent;
        const price = card.querySelector('.product-price').textContent;
        const imageSrc = card.querySelector('.product-image img').src;
        
        addToCart(title, price, imageSrc);
        
        // Add subtle animation to cart icon
        cartIcon.style.animation = 'pulse 0.5s';
        setTimeout(() => {
            cartIcon.style.animation = '';
        }, 500);
    });
});

// Handle form submission
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const name = this.querySelector('input[type="text"]').value;
        const email = this.querySelector('input[type="email"]').value;
        const message = this.querySelector('textarea').value;
        
        // In a real application, you would send this data to a server
        // For demo purposes, we'll just show a notification
        showNotification(`Thank you for your message, ${name}!`);
        
        // Reset form
        this.reset();
    });
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80, // Adjust for fixed header
                behavior: 'smooth'
            });
        }
    });
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Update cart count on page load
    updateCartCount();
    
    // Fix About image
    fixAboutImage();
    
    // Show welcome notification after 2 seconds
    setTimeout(() => {
        showNotification('Explore our handcrafted flower collection!', 'Welcome to D\'Creative Crafts', 'fa-heart');
    }, 2000);
    
    // Product Details Data - single source of truth
    const productDetails = {
        "Cherry Blossom Bouquet": {
            description: "Delicate handcrafted cherry blossoms with soft pink petals that bring the gentle beauty of spring to your home.",
            features: [
                "10-12 handcrafted blossoms",
                "Soft pink paper petals",
                "Green ribbon wrap",
                "Perfect for home decor"
            ],
            materials: "High-quality paper, wire stem",
            care: "Keep away from direct sunlight",
            dimensions: "30cm height, 20cm width",
            includes: "Decorative vase ribbon",
            perfectFor: "Home decor, gifts, special occasions",
            availability: "In stock - Ships within 2-3 days"
        },
        "Blue Berry Blossom Bouquet": {
            description: "Striking blue flowers with delicate petals that create a stunning visual statement for any room.",
            features: [
                "12-15 textured blossoms",
                "Blue gradient colors",
                "Rustic twine wrapping",
                "Lasts for years"
            ],
            materials: "Premium craft paper, flexible wire stems",
            care: "Dust occasionally with soft brush",
            dimensions: "35cm height, 25cm width",
            includes: "Complimentary gift wrapping",
            perfectFor: "Home decor, office spaces, gifts",
            availability: "In stock - Ships within 2-3 days"
        },
        "Blossom Symphony Bouquet": {
            description: "A harmonious arrangement of multicolored paper flowers, creating a symphony of colors and textures.",
            features: [
                "Mixed flower arrangement",
                "Various colors and sizes",
                "Premium presentation box",
                "Statement piece for any room"
            ],
            materials: "Mixed specialty papers, copper wire stems",
            care: "Keep in dry environments",
            dimensions: "40cm height, 30cm width",
            includes: "Decorative pot, care guide",
            perfectFor: "Living rooms, wedding gifts, corporate gifts",
            availability: "In stock - Ships within 3-5 days"
        },
        "Emerald Serenity Bouquet": {
            description: "Calming green-hued flowers that bring a sense of nature and tranquility to any space.",
            features: [
                "Lush green foliage",
                "White accent flowers",
                "Elegant vase included",
                "Modern minimalist style"
            ],
            materials: "Eco-friendly craft paper, recyclable wire",
            care: "No special care needed",
            dimensions: "25cm height, 20cm width",
            includes: "Rustic twine wrapping",
            perfectFor: "Meditation spaces, reading nooks, gifts",
            availability: "In stock - Ships within 2 days"
        },
        "Ethereal Petal Radiance Bouquet": {
            description: "Luminous petals with subtle shimmer that catch and reflect light, creating a magical display.",
            features: [
                "Luminous petal design",
                "Pearl accent details",
                "Gift box packaging",
                "Perfect for special occasions"
            ],
            materials: "Specialty shimmer paper, beaded accents",
            care: "Handle with care, avoid moisture",
            dimensions: "38cm height, 28cm width",
            includes: "Premium gift box, LED fairy lights",
            perfectFor: "Special celebrations, anniversary gifts, event decor",
            availability: "Made to order - Ships within 5-7 days"
        },
        "Eternal Sunshine Bouquet": {
            description: "Bright yellow and orange blooms that capture the essence of sunshine and bring warmth to any room.",
            features: [
                "Bright yellow blossoms",
                "Cheerful arrangement",
                "Complementary vase",
                "Brings warmth to any space"
            ],
            materials: "Sunshine yellow paper, eco-friendly stems",
            care: "Avoid high humidity areas",
            dimensions: "28cm height, 22cm width",
            includes: "Decorative sunshine ribbon",
            perfectFor: "Kitchen spaces, cheerful gifts, mood boosters",
            availability: "In stock - Ships within 2-3 days"
        }
    };

    // Add product details elements to each product card
    const productCardElements = document.querySelectorAll('.product-card');
    
    productCardElements.forEach(card => {
        const productTitle = card.querySelector('.product-title').textContent;
        const details = productDetails[productTitle] || {
            features: ["Handcrafted with care", "Premium materials", "Long-lasting beauty"],
            materials: "High-quality paper",
            care: "Keep away from moisture",
            description: "Beautiful handcrafted paper flowers for your home",
            dimensions: "Approximately 30cm height",
            includes: "Basic display stand",
            perfectFor: "Home decor, gifts",
            availability: "In stock"
        };
        
        // Create details element
        const detailsEl = document.createElement('div');
        detailsEl.className = 'product-details';
        
        // Add content to details
        detailsEl.innerHTML = `
            <h4>${productTitle}</h4>
            <p class="details-description">${details.description}</p>
            <ul class="details-features">
                ${details.features.map(feature => `<li>${feature}</li>`).join('')}
                <li><strong>Materials:</strong> ${details.materials}</li>
                <li><strong>Dimensions:</strong> ${details.dimensions}</li>
                <li><strong>Includes:</strong> ${details.includes}</li>
                <li><strong>Care:</strong> ${details.care}</li>
            </ul>
            <p class="details-availability">${details.availability}</p>
        `;
        
        // Remove any existing product details before adding
        const existingDetails = card.querySelector('.product-details');
        if (existingDetails) {
            existingDetails.remove();
        }
        
        card.appendChild(detailsEl);
    });

    // Add animation to products on scroll
    window.addEventListener('scroll', function() {
        const productsSection = document.querySelector('.products-section');
        if (!productsSection) return;
        
        const visibleProductCards = document.querySelectorAll('.product-card');
        const triggerPosition = window.innerHeight * 0.8;
        
        visibleProductCards.forEach((card, index) => {
            const cardTop = card.getBoundingClientRect().top;
            
            if (cardTop < triggerPosition) {
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    });
    
    // Handle touch devices for product details
    if ('ontouchstart' in window) {
        productCardElements.forEach(card => {
            card.addEventListener('click', function(e) {
                if (!e.target.closest('.add-to-cart')) {
                    // Toggle visibility of product details
                    const details = this.querySelector('.product-details');
                    if (details) {
                        if (details.style.opacity === '1') {
                            details.style.opacity = '0';
                            details.style.visibility = 'hidden';
                        } else {
                            // Hide all other details first
                            document.querySelectorAll('.product-details').forEach(d => {
                                d.style.opacity = '0';
                                d.style.visibility = 'hidden';
                            });
                            details.style.opacity = '1';
                            details.style.visibility = 'visible';
                        }
                    }
                }
            });
        });
        
        // Close details when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.product-card')) {
                document.querySelectorAll('.product-details').forEach(details => {
                    details.style.opacity = '0';
                    details.style.visibility = 'hidden';
                });
            }
        });
    }
});

// Make responsive menu work better
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            navLinks.style.display = 'flex';
        }
    }
});