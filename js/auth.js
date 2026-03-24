import { storage } from './storage.js';

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function getUsers() {
    return storage.get('users') || [];
}

export function getCurrentUser() {
    return storage.get('session');
}

export function isAuthenticated() {
    return getCurrentUser() !== null;
}

export async function register(username, email, password) {
    const users = getUsers();

    if (users.find(u => u.email === email)) {
        throw new Error('Cet email est déjà utilisé.');
    }
    if (users.find(u => u.username === username)) {
        throw new Error('Ce nom d\'utilisateur est déjà pris.');
    }
    if (password.length < 4) {
        throw new Error('Le mot de passe doit contenir au moins 4 caractères.');
    }

    const user = {
        id: generateId(),
        username,
        email,
        passwordHash: await hashPassword(password),
        createdAt: new Date().toISOString()
    };

    users.push(user);
    storage.set('users', users);

    storage.set('session', { userId: user.id, username: user.username });
    return user;
}

export async function login(email, password) {
    const users = getUsers();
    const hash = await hashPassword(password);
    const user = users.find(u => u.email === email && u.passwordHash === hash);

    if (!user) {
        throw new Error('Email ou mot de passe incorrect.');
    }

    storage.set('session', { userId: user.id, username: user.username });
    return user;
}

export function logout() {
    storage.remove('session');
}
