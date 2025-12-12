// Authentication Module

class Auth {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.loginForm = document.getElementById('login-form');
        this.loginContainer = document.getElementById('login-container');
        this.appContainer = document.getElementById('app-container');
        this.logoutBtn = document.getElementById('logout-btn');
        
        this.init();
    }
    
    init() {
        // Check if user is already logged in
        const session = this.getSession();
        if (session && this.isSessionValid(session)) {
            this.setAuthenticated(session.username);
        }
        
        // Attach event listeners
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.logoutBtn.addEventListener('click', () => this.handleLogout());
        
        // Update UI based on auth state
        this.updateUI();
    }
    
    handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('login-error');
        
        if (this.validateCredentials(username, password)) {
            this.setAuthenticated(username);
            this.saveSession(username);
            this.updateUI();
            this.loginForm.reset();
            errorMessage.textContent = '';
        } else {
            errorMessage.textContent = 'Invalid username or password';
        }
    }
    
    handleLogout() {
        this.clearSession();
        this.isAuthenticated = false;
        this.currentUser = null;
        this.updateUI();
    }
    
    validateCredentials(username, password) {
        // Check if username exists and password matches
        if (CONFIG.USERS.hasOwnProperty(username)) {
            return CONFIG.USERS[username] === password;
        }
        return false;
    }
    
    setAuthenticated(username) {
        this.isAuthenticated = true;
        this.currentUser = username;
    }
    
    saveSession(username) {
        const session = {
            username: username,
            timestamp: Date.now()
        };
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(session));
    }
    
    getSession() {
        const session = localStorage.getItem(CONFIG.STORAGE_KEY);
        return session ? JSON.parse(session) : null;
    }
    
    clearSession() {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
    }
    
    isSessionValid(session) {
        const now = Date.now();
        const sessionAge = now - session.timestamp;
        return sessionAge < CONFIG.SESSION_TIMEOUT;
    }
    
    updateUI() {
        if (this.isAuthenticated) {
            this.loginContainer.style.display = 'none';
            this.appContainer.style.display = 'block';
        } else {
            this.loginContainer.style.display = 'flex';
            this.appContainer.style.display = 'none';
        }
    }
}

// Initialize Auth when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.auth = new Auth();
});
