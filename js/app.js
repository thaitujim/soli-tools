// Main Application Module

class App {
    constructor() {
        this.dataForm = document.getElementById('data-form');
        this.formMessage = document.getElementById('form-message');
        this.dataModal = document.getElementById('data-modal');
        this.addDataBtn = document.getElementById('add-data-btn');
        this.closeModalBtn = document.getElementById('close-modal-btn');
        this.cancelBtn = document.getElementById('cancel-btn');
        this.ingredientFilter = document.getElementById('ingredient-filter');
        this.chartsContainer = document.getElementById('charts-container');
        this.charts = {};
        this.chartData = [];
        this.groupedData = {};
        
        this.init();
    }
    
    init() {
        // Attach event listeners
        if (this.dataForm) this.dataForm.addEventListener('submit', (e) => this.handleSubmit(e));
        if (this.addDataBtn) this.addDataBtn.addEventListener('click', () => this.openModal());
        if (this.closeModalBtn) this.closeModalBtn.addEventListener('click', () => this.closeModal());
        if (this.cancelBtn) this.cancelBtn.addEventListener('click', () => this.closeModal());
        if (this.ingredientFilter) this.ingredientFilter.addEventListener('change', (e) => this.filterCharts(e.target.value));
        
        // Load data when app initializes
        this.loadData();
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            value: document.getElementById('value').value
        };
        
        this.submitData(formData);
    }
    
    async submitData(data) {
        try {
            this.showMessage('Submitting...', 'info');
            
            const url = new URL(CONFIG.APPS_SCRIPT_URL);
            url.searchParams.append('action', 'appendData');
            url.searchParams.append('data', JSON.stringify(data));
            
            const response = await fetch(url.toString(), {
                method: 'GET'
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
            const url = new URL(CONFIG.APPS_SCRIPT_URL);
            url.searchParams.append('action', 'getData');
            
            const response = await fetch(url.toString(), {
                method: 'GET'
            });
            
            const result = await response.json();
            
            if (result.success && result.data && result.data.length > 0) {
                this.chartData = result.data;
                this.groupDataByType();
                this.populateFilter();
                this.renderCharts('all');
            } else {
                this.renderEmptyState();
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.renderEmptyState();
        }
    }
    
    groupDataByType() {
        this.groupedData = {};
        this.chartData.forEach(item => {
            const type = item.IngredientType || 'Unknown';
            if (!this.groupedData[type]) {
                this.groupedData[type] = [];
            }
            this.groupedData[type].push(item);
        });
    }
    
    populateFilter() {
        if (!this.ingredientFilter) return;
        
        // Clear existing options except "Show All"
        this.ingredientFilter.innerHTML = '<option value="all">Show All</option>';
        
        // Add option for each ingredient type
        Object.keys(this.groupedData).sort().forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            this.ingredientFilter.appendChild(option);
        });
    }
    
    filterCharts(selectedType) {
        this.renderCharts(selectedType);
    }
    
    renderCharts(filterType = 'all') {
        if (!this.chartsContainer) return;
        
        // Destroy existing charts
        Object.values(this.charts).forEach(chart => chart.destroy());
        this.charts = {};
        
        // Clear container
        this.chartsContainer.innerHTML = '';
        
        // Determine which types to display
        const typesToDisplay = filterType === 'all' 
            ? Object.keys(this.groupedData) 
            : [filterType];
        
        // Create a chart for each type
        typesToDisplay.forEach(type => {
            if (!this.groupedData[type]) return;
            
            const chartItem = document.createElement('div');
            chartItem.className = 'chart-item';
            chartItem.innerHTML = `
                <h3>${this.escapeHtml(type)}</h3>
                <canvas id="chart-${this.sanitizeId(type)}"></canvas>
            `;
            this.chartsContainer.appendChild(chartItem);
            
            // Create chart
            const canvas = document.getElementById(`chart-${this.sanitizeId(type)}`);
            if (canvas) {
                this.createChart(canvas, type, this.groupedData[type]);
            }
        });
    }
    
    createChart(canvas, type, data) {
        const ctx = canvas.getContext('2d');
        
        const labels = data.map(item => item.IngredientDetails || '');
        const values = data.map(item => parseFloat(item.IngredientQuantity) || 0);
        
        this.charts[type] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Quantity',
                    data: values,
                    backgroundColor: '#667eea',
                    borderColor: '#5568d3',
                    borderWidth: 1,
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { 
                    legend: { display: true, position: 'top' },
                    datalabels: {
                        anchor: 'end',
                        align: 'top',
                        color: '#333',
                        font: {
                            weight: 'bold',
                            size: 12
                        },
                        formatter: (value) => value
                    }
                },
                scales: { 
                    y: { beginAtZero: true }
                }
            },
            plugins: [ChartDataLabels]
        });
    }
    
    renderEmptyState() {
        if (!this.chartsContainer) return;
        this.chartsContainer.innerHTML = '<p class="loading">No data available</p>';
    }
    
    sanitizeId(str) {
        return str.replace(/[^a-zA-Z0-9]/g, '_');
    }

    openModal() {
        if (this.dataModal) this.dataModal.style.display = 'flex';
    }
    
    closeModal() {
        if (this.dataModal) this.dataModal.style.display = 'none';
            this.formMessage.className = 'message';
        }
        if (this.dataForm) this.dataForm.reset();
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
