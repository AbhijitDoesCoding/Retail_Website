import { Router } from './router.js';
import { Home } from './pages/home.js';
import { Products } from './pages/products.js';
import { ProductDetail } from './pages/details.js';

// State Management
export const state = {
    cart: JSON.parse(localStorage.getItem('rsms_cart') || '[]'),
    currentUser: JSON.parse(localStorage.getItem('rsms_user') || 'null'),
    searchQuery: '',
    selectedBrandId: null,
    selectedCategory: null,
    addToCart(product) {
        console.log("Adding product to cart:", product.product_id);
        const existing = this.cart.find(item => item.product_id === product.product_id);
        if (existing) {
            existing.quantity += 1;
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }
        this.saveCart();
        this.updateCartUI();
    },

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.product_id !== productId);
        this.saveCart();
        this.updateCartUI();
    },

    saveCart() {
        localStorage.setItem('rsms_cart', JSON.stringify(this.cart));
    },

    updateCartUI() {
        const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('cart-count').textContent = count;
        this.renderCartItems();
    },

    renderCartItems() {
        const list = document.getElementById('cart-items-list');
        const totalAmount = document.getElementById('cart-total-amount');
        
        if (!list) return;

        if (this.cart.length === 0) {
            list.innerHTML = '<p class="empty-msg">Your selection is empty.</p>';
            totalAmount.textContent = '$0.00';
            return;
        }

        let total = 0;
        list.innerHTML = this.cart.map(item => {
            total += item.price * item.quantity;
            return `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>${item.quantity} x $${item.price.toFixed(2)}</p>
                    </div>
                    <button class="remove-item" data-id="${item.product_id}">&times;</button>
                </div>
            `;
        }).join('');

        totalAmount.textContent = `$${total.toFixed(2)}`;

        // Add remove listeners
        list.querySelectorAll('.remove-item').forEach(btn => {
            btn.onclick = () => this.removeFromCart(btn.dataset.id);
        });
    }
};

// Initialize Router
const routes = {
    '/': Home,
    '/products': Products,
    '/product': ProductDetail, // Handle /product?id=xxx
};

const router = new Router(routes, 'app-root');

// Handle Product Detail specific routing
// Since it's a simple router, we'll check path manually for /product/id or similar
// For simplicity, we'll use query params /product?id=...

// Sidebar Toggle
const cartBtn = document.getElementById('cart-btn');
const closeCart = document.getElementById('close-cart');
const sidebar = document.getElementById('cart-sidebar');
const overlay = document.getElementById('overlay');

function toggleCart() {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    if (sidebar.classList.contains('active')) {
        state.renderCartItems();
    }
}

cartBtn.addEventListener('click', toggleCart);
closeCart.addEventListener('click', toggleCart);
overlay.addEventListener('click', toggleCart);

// Checkout Flow
const checkoutBtn = document.getElementById('checkout-btn');
const modalContainer = document.getElementById('modal-container');

checkoutBtn.onclick = () => {
    if (state.cart.length === 0) {
        alert('Your selection is empty.');
        return;
    }
    
    // Close cart sidebar
    toggleCart();
    
    // Open checkout modal
    showCheckoutModal();
};

function showCheckoutModal() {
    const total = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    modalContainer.innerHTML = `
        <div class="modal-overlay active" id="checkout-modal">
            <div class="modal-content">
                <button class="modal-close" id="close-modal">&times;</button>
                <h3 style="margin-bottom: 2rem; text-align: center; font-size: 2rem;">Secure Checkout</h3>
                
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="order-name" placeholder="John Doe">
                </div>
                <div class="form-group">
                    <label>Phone Number</label>
                    <input type="tel" id="order-phone" placeholder="+1 (555) 000-0000">
                </div>
                <div class="form-group">
                    <label>Shipping Address</label>
                    <input type="text" id="order-address" placeholder="123 Luxury Lane, NY">
                </div>
                
                <div style="margin: 2rem 0; border-top: 1px solid var(--surface); padding-top: 1rem;">
                    <div style="display: flex; justify-content: space-between; font-family: var(--font-title); font-size: 1.2rem;">
                        <span>Total Amount</span>
                        <span>$${total.toFixed(2)}</span>
                    </div>
                </div>
                
                <button class="btn btn-primary btn-block" id="place-order-btn">Place Order</button>
            </div>
        </div>
    `;

    document.getElementById('close-modal').onclick = () => {
        document.getElementById('checkout-modal').remove();
    };

    document.getElementById('place-order-btn').onclick = async () => {
        const orderData = {
            customer_id: state.currentUser ? state.currentUser.customer_id : null,
            user_name: document.getElementById('order-name').value,
            items: state.cart,
            total_amount: total,
            status: 'pending'
        };

        if (!orderData.user_name || !document.getElementById('order-phone').value || !document.getElementById('order-address').value) {
            alert('Please fill in all fields.');
            return;
        }

        try {
            const btn = document.getElementById('place-order-btn');
            btn.textContent = 'Processing...';
            btn.disabled = true;

            const { api } = await import('./api.js');
            await api.createOrder(orderData);
            
            // Success
            state.cart = [];
            state.saveCart();
            state.updateCartUI();
            
            modalContainer.innerHTML = `
                <div class="modal-overlay active">
                    <div class="modal-content" style="text-align: center;">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" style="margin-bottom: 2rem;">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        <h2 style="font-size: 2.5rem; margin-bottom: 1rem;">Order Placed</h2>
                        <p style="color: var(--text-secondary); margin-bottom: 2rem;">Thank you for your purchase. We will contact you shortly.</p>
                        <button class="btn btn-primary" onclick="window.location.href='/'">Continue Shopping</button>
                    </div>
                </div>
            `;
        } catch (err) {
            alert('Order failed: ' + err.message);
            document.getElementById('place-order-btn').disabled = false;
            document.getElementById('place-order-btn').textContent = 'Place Order';
        }
    };
}

// Auth Logic
function updateAuthUI() {
    const authBtnText = document.getElementById('auth-btn-text');
    if (state.currentUser) {
        authBtnText.textContent = state.currentUser.name.split(' ')[0];
    } else {
        authBtnText.textContent = 'Login';
    }
}

document.getElementById('auth-btn').onclick = async () => {
    if (state.currentUser) {
        if (confirm('Do you want to logout?')) {
            try {
                const { api } = await import('./api.js');
                await api.logoutCustomer();
                state.currentUser = null;
                localStorage.removeItem('rsms_user');
                updateAuthUI();
            } catch (err) {
                alert('Logout failed: ' + err.message);
            }
        }
        return;
    }
    showAuthModal();
};

function showAuthModal(isLogin = true) {
    modalContainer.innerHTML = `
        <div class="modal-overlay active" id="auth-modal">
            <div class="modal-content">
                <button class="modal-close" id="close-auth-modal">&times;</button>
                <h3 style="margin-bottom: 2rem; text-align: center; font-size: 2rem;">${isLogin ? 'Welcome Back' : 'Create Account'}</h3>
                
                ${!isLogin ? `
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="auth-name" placeholder="John Doe">
                </div>
                <div class="form-group">
                    <label>Phone</label>
                    <input type="tel" id="auth-phone" placeholder="+1 555 000 0000">
                </div>
                ` : ''}
                
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" id="auth-email" placeholder="you@example.com">
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="auth-password" placeholder="••••••••">
                </div>
                
                <button class="btn btn-primary btn-block" id="submit-auth-btn" style="margin-top: 1rem;">${isLogin ? 'Login' : 'Sign Up'}</button>
                
                <p style="text-align: center; margin-top: 1.5rem; font-size: 0.9rem; color: var(--text-secondary);">
                    ${isLogin ? 'New to RSMS? <a href="#" id="toggle-auth" style="color: var(--primary); font-weight: 600;">Create an account</a>' 
                             : 'Already have an account? <a href="#" id="toggle-auth" style="color: var(--primary); font-weight: 600;">Log in</a>'}
                </p>
            </div>
        </div>
    `;

    document.getElementById('close-auth-modal').onclick = () => {
        document.getElementById('auth-modal').remove();
    };

    document.getElementById('toggle-auth').onclick = (e) => {
        e.preventDefault();
        showAuthModal(!isLogin);
    };

    document.getElementById('submit-auth-btn').onclick = async () => {
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;

        if (!email || !password) {
            alert('Please fill in all required fields.');
            return;
        }

        try {
            const btn = document.getElementById('submit-auth-btn');
            btn.textContent = 'Processing...';
            btn.disabled = true;

            const { api } = await import('./api.js');
            
            if (isLogin) {
                const user = await api.loginCustomer(email, password);
                state.currentUser = user;
            } else {
                const name = document.getElementById('auth-name').value;
                const phone = document.getElementById('auth-phone').value;
                if (!name) throw new Error("Name is required");
                const user = await api.signupCustomer({ name, email, phone, password });
                state.currentUser = user;
            }

            localStorage.setItem('rsms_user', JSON.stringify(state.currentUser));
            updateAuthUI();
            document.getElementById('auth-modal').remove();
            
        } catch (err) {
            alert(err.message);
            document.getElementById('submit-auth-btn').disabled = false;
            document.getElementById('submit-auth-btn').textContent = isLogin ? 'Login' : 'Sign Up';
        }
    };
}

// Search Logic
let searchTimeout;
const searchInput = document.getElementById('navbar-search');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        state.searchQuery = e.target.value;
        
        searchTimeout = setTimeout(() => {
            if (window.location.pathname !== '/products') {
                router.navigate('/products');
            } else {
                // If already on products, trigger re-render
                // It will read from state.searchQuery
                router.handleRoute();
            }
        }, 300);
    });
}

// Initial UI Update
state.updateCartUI();
updateAuthUI();

export { router };

