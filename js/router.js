export class Router {
    constructor(routes, rootElementId) {
        this.routes = routes;
        this.rootElement = document.getElementById(rootElementId);
        this.init();
    }

    init() {
        window.addEventListener('popstate', () => this.handleRoute());
        
        // Handle initial load
        this.handleRoute();

        // Global link listener
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.getAttribute('href')?.startsWith('/')) {
                e.preventDefault();
                this.navigate(link.getAttribute('href'));
            }
        });
    }

    async navigate(path) {
        window.history.pushState({}, '', path);
        await this.handleRoute();
    }

    async handleRoute() {
        const path = window.location.pathname;
        const route = this.routes[path] || this.routes['/404'] || this.routes['/'];
        
        // Update Active Link
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('href') === path) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Show loader
        this.rootElement.innerHTML = `
            <div class="loader-container">
                <div class="loader"></div>
            </div>
        `;

        try {
            const html = await route();
            this.rootElement.innerHTML = html;
            // Scroll to top
            window.scrollTo(0, 0);
        } catch (error) {
            console.error('Routing error:', error);
            this.rootElement.innerHTML = `
                <div class="error-container" style="text-align: center; padding: 4rem;">
                    <h2>Something went wrong</h2>
                    <p>${error.message}</p>
                    <button class="btn btn-primary" onclick="window.location.reload()">Retry</button>
                </div>
            `;
        }
    }
}
