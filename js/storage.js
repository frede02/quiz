const PREFIX = 'quiz_';

export const storage = {
    get(key) {
        try {
            const data = localStorage.getItem(PREFIX + key);
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    },
    set(key, value) {
        localStorage.setItem(PREFIX + key, JSON.stringify(value));
    },
    remove(key) {
        localStorage.removeItem(PREFIX + key);
    }
};
