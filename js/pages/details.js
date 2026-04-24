import { api } from '../api.js';
import { state } from '../app.js';

export async function ProductDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        return `<div class="section"><h2>Product not found</h2></div>`;
    }

    const product = await api.getProductById(id);
    console.log("Product ID:", product.product_id);

    // Initial render
    setTimeout(() => {
        const addBtn = document.getElementById('add-to-cart-btn');
        if (addBtn) {
            addBtn.onclick = () => {
                state.addToCart(product);
                // Open cart sidebar
                document.getElementById('cart-btn').click();
            };
        }
    }, 0);

    return `
        <div class="detail-container">
            <div class="detail-image">
                <img src="${product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1000'}" alt="${product.name}">
            </div>
            <div class="detail-info">
                <span class="detail-category">${product.category || 'Collection'}</span>
                <h1>${product.name}</h1>
                <p class="detail-price">$${product.price.toFixed(2)}</p>
                <p class="detail-description">
                    ${product.description || 'A masterpiece of design and craftsmanship, this piece embodies the essence of luxury. Hand-selected materials and meticulous attention to detail ensure a timeless addition to your collection.'}
                </p>
                <div class="detail-actions">
                    <button class="btn btn-primary" id="add-to-cart-btn">Add to Selection</button>
                </div>
            </div>
        </div>
    `;
}
