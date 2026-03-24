import { addRoute, initRouter } from './router.js';
import { renderHome, renderLogin, renderRegister, renderCategories, renderQuiz, renderLeaderboard, renderProfile, updateNav } from './ui.js';

// Define routes
addRoute('/', renderHome);
addRoute('/connexion', renderLogin);
addRoute('/inscription', renderRegister);
addRoute('/categories', renderCategories, { requiresAuth: true });
addRoute('/quiz/:sport/:type/:difficulty', renderQuiz, { requiresAuth: true });
addRoute('/classement', renderLeaderboard);
addRoute('/profil', renderProfile, { requiresAuth: true });

// Init
updateNav();
initRouter();
