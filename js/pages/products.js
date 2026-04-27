import { api } from '../api.js';
import { state } from '../app.js';

export async function Products() {
    const brands = await api.getBrands();
    const products = await api.getProducts(state.selectedBrandId, state.selectedCategory, state.searchQuery);
    
    let categoryProducts = await api.getProducts(state.selectedBrandId, null, '');
    let categories = [...new Set(categoryProducts.map(p => p.category))].filter(Boolean);

    setTimeout(() => {
        // Setup Brand Filter Handlers
        document.querySelectorAll('.brand-item').forEach(btn => {
            btn.onclick = async () => {
                const brandId = btn.dataset.id;
                state.selectedBrandId = brandId === 'all' ? null : brandId;
                state.selectedCategory = null; // Reset category when brand changes
                
                // Highlight active brand
                document.querySelectorAll('.brand-item').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                await updateCategoriesView();
                updateProductsView();
            };
        });

        setupCategoryHandlers();
    }, 0);

    function setupCategoryHandlers() {
        document.querySelectorAll('.category-item').forEach(btn => {
            btn.onclick = () => {
                const category = btn.dataset.category;
                state.selectedCategory = category === 'All' ? null : category;
                
                // Highlight active category
                document.querySelectorAll('.category-item').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                updateProductsView();
            };
        });
    }

    async function updateCategoriesView() {
        const catProducts = await api.getProducts(state.selectedBrandId, null, '');
        categories = [...new Set(catProducts.map(p => p.category))].filter(Boolean);
        
        const container = document.getElementById('categoryContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="category-item ${!state.selectedCategory ? 'active' : ''}" data-category="All">
                All
            </div>
            ${categories.map(cat => `
                <div class="category-item ${state.selectedCategory === cat ? 'active' : ''}" data-category="${cat}">
                    ${cat}
                </div>
            `).join('')}
        `;
        setupCategoryHandlers();
    }

    async function updateProductsView() {
        const listContainer = document.getElementById('products-list');
        listContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 4rem;"><div class="loader"></div></div>';
        
        try {
            const newProducts = await api.getProducts(state.selectedBrandId, state.selectedCategory, state.searchQuery);
            listContainer.innerHTML = renderProductList(newProducts);
        } catch (err) {
            listContainer.innerHTML = '<p style="color: red; grid-column: 1/-1;">Error loading products.</p>';
        }
    }

    return `
        <div class="browse-layout collection-layout">
            <aside class="sidebar">
                <h3 class="sidebar-title">Brands</h3>
                <div class="brand-list">
                    <button class="brand-item ${!state.selectedBrandId ? 'active' : ''}" data-id="all">
                        All Brands
                    </button>
                    ${brands.map(brand => `
                        <button class="brand-item ${state.selectedBrandId === brand.brand_id ? 'active' : ''}" data-id="${brand.brand_id}">
                            ${brand.name}
                        </button>
                    `).join('')}
                </div>
            </aside>
            
            <div class="main-content collection-content">
                <div class="section-header collection-header">
                    <div class="collection-heading">
                        <h2 class="collection-title">Collection</h2>
                        <p class="collection-subtitle">${state.searchQuery ? `Results for "${state.searchQuery}"` : ''}</p>
                    </div>
                </div>

                <div class="category-container category-filters" id="categoryContainer">
                    <div class="category-item ${!state.selectedCategory ? 'active' : ''}" data-category="All">
                        All
                    </div>
                    ${categories.map(cat => `
                        <div class="category-item ${state.selectedCategory === cat ? 'active' : ''}" data-category="${cat}">
                            ${cat}
                        </div>
                    `).join('')}
                </div>
                
                <div class="product-grid products-grid" id="products-list">
                    ${renderProductList(products)}
                </div>
            </div>
        </div>
    `;
}

function renderProductList(products) {
    if (products.length === 0) return `<p style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--muted); font-size: 1.1rem;">No products found.</p>`;
    
    return products.map(product => `
        <a href="/product?id=${product.product_id}" class="product-card">
            <div class="product-image">
                <img src="${product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1000'}" alt="${product.name}">
            </div>
            <div class="product-info">
                <span class="product-category">${product.category || 'Luxury'}</span>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
            </div>
        </a>
    `).join('');
}
