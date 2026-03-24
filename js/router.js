import { isAuthenticated } from './auth.js';

let routes = {};
let notFoundHandler = null;

export function addRoute(path, handler, { requiresAuth = false } = {}) {
    routes[path] = { handler, requiresAuth };
}

export function navigate(path) {
    window.location.hash = path;
}

export function initRouter() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
}

function parseRoute(hash) {
    const path = hash.replace('#', '') || '/';
    // Try exact match first
    if (routes[path]) return { route: routes[path], params: {} };

    // Try parameterized routes
    for (const [pattern, route] of Object.entries(routes)) {
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');
        if (patternParts.length !== pathParts.length) continue;

        const params = {};
        let match = true;
        for (let i = 0; i < patternParts.length; i++) {
            if (patternParts[i].startsWith(':')) {
                params[patternParts[i].slice(1)] = pathParts[i];
            } else if (patternParts[i] !== pathParts[i]) {
                match = false;
                break;
            }
        }
        if (match) return { route, params };
    }
    return null;
}

function handleRoute() {
    const hash = window.location.hash || '#/';
    const result = parseRoute(hash);

    if (!result) {
        navigate('/');
        return;
    }

    const { route, params } = result;

    if (route.requiresAuth && !isAuthenticated()) {
        navigate('/connexion');
        return;
    }

    const app = document.getElementById('app');
    app.classList.remove('fade-in');
    route.handler(params);
    setTimeout(() => app.classList.add('fade-in'), 10);
}
