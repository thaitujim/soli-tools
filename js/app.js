// Main Application Module

class App {
    constructor() {
        this.ingredientFilter = document.getElementById('ingredient-filter');
        this.chartFilter = document.querySelector('.chart-filter');
        this.chartsContainer = document.getElementById('charts-container');
        this.charts = {};
        this.chartData = [];
        this.groupedData = {};
        
        // Input modal elements
        this.inputModal = document.getElementById('input-modal');
        this.closeInputModalBtn = document.getElementById('close-input-modal');
        this.cancelInputBtn = document.getElementById('cancel-input-btn');
        this.saveInputBtn = document.getElementById('save-input-btn');
        this.displayType = document.getElementById('display-type');
        this.ingredientsList = document.getElementById('ingredients-list');
        this.currentEditingType = null;
        
        this.init();
    }
    
    init() {
        // Attach event listeners
        if (this.ingredientFilter) this.ingredientFilter.addEventListener('change', (e) => this.filterCharts(e.target.value));
        
        // Modal event listeners
        if (this.closeInputModalBtn) this.closeInputModalBtn.addEventListener('click', () => this.handleCloseModal());
        if (this.cancelInputBtn) this.cancelInputBtn.addEventListener('click', () => this.handleCancelChanges());
        if (this.saveInputBtn) this.saveInputBtn.addEventListener('click', () => this.handleSaveChanges());
        if (this.inputModal) {
            this.inputModal.addEventListener('click', (e) => {
                if (e.target === this.inputModal) this.handleCloseModal();
            });
        }
        
        // Event delegation for dynamically created buttons
        if (this.chartsContainer) {
            this.chartsContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('btn-input-data')) {
                    const type = e.target.getAttribute('data-type');
                    if (type) this.openInputModal(type);
                }
            });
        }
        
        // Load data when app initializes
        this.loadData();
    }
    
    async loadData() {
        try {
            this.showLoading();
            
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
        } finally {
            this.hideLoading();
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
        
        // Show chart filter after data is loaded
        if (this.chartFilter) {
            this.chartFilter.style.display = 'flex';
        }
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
                <div class="chart-item-header">
                    <h3>${this.escapeHtml(type)}</h3>
                    <button class="btn-input-data" data-type="${this.escapeHtml(type)}">Nhập dữ liệu</button>
                </div>
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
                    x: {
                        ticks: {
                            maxRotation: 90,
                            minRotation: 90,
                            autoSkip: false
                        }
                    },
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
    
    showLoading() {
        if (!this.chartsContainer) return;
        this.chartsContainer.innerHTML = `
            <div class="loading-container">
                <div class="spinner"></div>
                <p>Loading data...</p>
            </div>
        `;
    }
    
    hideLoading() {
        // Loading will be cleared when charts are rendered
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    openInputModal(type) {
        this.currentEditingType = type;
        const data = this.groupedData[type];
        
        if (!data || !this.inputModal) return;
        
        // Set the type display
        if (this.displayType) {
            this.displayType.textContent = type;
        }
        
        // Populate ingredients list
        if (this.ingredientsList) {
            this.ingredientsList.innerHTML = '';
            
            data.forEach((item, index) => {
                const ingredientItem = document.createElement('div');
                ingredientItem.className = 'ingredient-item';
                ingredientItem.innerHTML = `
                    <label>${this.escapeHtml(item.IngredientDetails || '')}</label>
                    <div class="quantity-controls">
                        <button type="button" class="btn-quantity btn-decrement">−</button>
                        <input type="number" 
                               class="quantity-input" 
                               data-index="${index}"
                               data-detail="${this.escapeHtml(item.IngredientDetails || '')}"
                               value="${item.IngredientQuantity || 0}"
                               min="0"
                               step="1">
                        <button type="button" class="btn-quantity btn-increment">+</button>
                    </div>
                `;
                this.ingredientsList.appendChild(ingredientItem);
            });
            
            // Add event listeners for increment/decrement buttons
            this.ingredientsList.querySelectorAll('.btn-increment').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const input = e.target.previousElementSibling;
                    const step = parseFloat(input.step) || 1;
                    input.value = (parseFloat(input.value) || 0) + step;
                });
            });
            
            this.ingredientsList.querySelectorAll('.btn-decrement').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const input = e.target.nextElementSibling;
                    const step = parseFloat(input.step) || 1;
                    const min = parseFloat(input.min) || 0;
                    const newValue = (parseFloat(input.value) || 0) - step;
                    input.value = Math.max(min, newValue);
                });
            });
        }
        
        // Show modal
        this.inputModal.style.display = 'block';
    }
    
    closeInputModal() {
        if (this.inputModal) {
            this.inputModal.style.display = 'none';
        }
        this.currentEditingType = null;
    }
    
    handleCloseModal() {
        // Close modal action
        this.closeInputModal();
    }
    
    handleCancelChanges() {
        // Cancel changes action
        this.closeInputModal();
    }
    
    handleSaveChanges() {
        // Save changes action - for now just close modal
        // TODO: Add save logic here later
        this.closeInputModal();
    }
    
    async saveInputChanges() {
        if (!this.currentEditingType || !this.ingredientsList) return;
        
        try {
            // Collect all updated quantities
            const inputs = this.ingredientsList.querySelectorAll('.quantity-input');
            const updates = [];
            
            inputs.forEach(input => {
                const detail = input.getAttribute('data-detail');
                const quantity = parseFloat(input.value) || 0;
                updates.push({
                    IngredientType: this.currentEditingType,
                    IngredientDetails: detail,
                    IngredientQuantity: quantity
                });
            });
            
            // Send updates to backend
            const url = new URL(CONFIG.APPS_SCRIPT_URL);
            url.searchParams.append('action', 'updateData');
            url.searchParams.append('data', JSON.stringify(updates));
            
            const response = await fetch(url.toString(), {
                method: 'GET'
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Close modal
                this.closeInputModal();
                
                // Reload data to refresh charts
                await this.loadData();
                
                alert('Dữ liệu đã được cập nhật thành công!');
            } else {
                alert('Lỗi: ' + result.message);
            }
        } catch (error) {
            console.error('Error saving changes:', error);
            alert('Có lỗi xảy ra khi lưu dữ liệu');
        }
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
