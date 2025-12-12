// Main Application Module

class App {
    constructor() {
        this.dataForm = document.getElementById('data-form');
        this.dataList = document.getElementById('data-list');
        this.refreshBtn = document.getElementById('refresh-btn');
        this.formMessage = document.getElementById('form-message');
        
        this.init();
    }
    
    init() {
        // Attach event listeners
        this.dataForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.refreshBtn.addEventListener('click', () => this.loadData());
        
        // Load data when app initializes
        this.loadData();
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value,
            timestamp: new Date().toLocaleString()
        };
        
        this.submitData(formData);
    }
    
    async submitData(data) {
        try {
            this.showMessage('Submitting...', 'info');
            
            const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'appendData',
                    data: data
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showMessage('Data submitted successfully!', 'success');
                this.dataForm.reset();
                // Reload data after submission
                setTimeout(() => this.loadData(), 1000);
            } else {
                this.showMessage('Error: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Error submitting data:', error);
            this.showMessage('Error submitting data. Please try again.', 'error');
        }
    }
    
    async loadData() {
        try {
            this.dataList.innerHTML = '<p class="loading">Loading data...</p>';
            
            const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'getData'
                })
            });
            
            const result = await response.json();
            
            if (result.success && result.data && result.data.length > 0) {
                this.displayData(result.data);
            } else {
                this.dataList.innerHTML = '<p class="loading">No data found</p>';
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.dataList.innerHTML = '<p class="loading">Error loading data. Please check your Google Apps Script URL.</p>';
        }
    }
    
    displayData(data) {
        this.dataList.innerHTML = '';
        
        data.forEach((item, index) => {
            const dataItem = document.createElement('div');
            dataItem.className = 'data-item';
            dataItem.innerHTML = `
                <div class="data-item-name">${this.escapeHtml(item.name)}</div>
                <div class="data-item-email">${this.escapeHtml(item.email)}</div>
                <div class="data-item-message">${this.escapeHtml(item.message)}</div>
                ${item.timestamp ? `<div class="data-item-timestamp" style="color: #999; font-size: 12px; margin-top: 8px;">${item.timestamp}</div>` : ''}
            `;
            this.dataList.appendChild(dataItem);
        });
    }
    
    showMessage(text, type) {
        this.formMessage.textContent = text;
        this.formMessage.className = 'message ' + type;
        
        if (type === 'success') {
            setTimeout(() => {
                this.formMessage.textContent = '';
                this.formMessage.className = 'message';
            }, 3000);
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize App when authenticated
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit to ensure auth is initialized first
    setTimeout(() => {
        if (window.auth && window.auth.isAuthenticated) {
            window.app = new App();
        } else {
            // Watch for authentication
            const checkAuth = setInterval(() => {
                if (window.auth && window.auth.isAuthenticated && !window.app) {
                    window.app = new App();
                    clearInterval(checkAuth);
                }
            }, 100);
            
            // Stop checking after 5 seconds
            setTimeout(() => clearInterval(checkAuth), 5000);
        }
    }, 100);
});
