import { api } from '../api.js';

export async function Home() {
    return `
        <section class="hero">
            <div class="hero-pattern"></div>
            <div class="hero-content">
                <span class="hero-subtitle">Elegance Redefined</span>
                <h1>Crafting Timeless <br>Sophistication</h1>
                <div class="hero-actions">
                    <a href="/products" class="btn btn-primary">Shop Collection</a>
                </div>
            </div>
        </section>
    `;
}
