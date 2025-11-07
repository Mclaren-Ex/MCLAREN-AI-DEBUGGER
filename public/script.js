// Ultra-Pro AI Debugger - Enterprise Grade JavaScript
class UltraProDebugger {
    constructor() {
        // Auto-detect server URL for production
        this.SERVER_URL = window.location.origin;
        this.isAnalyzing = false;
        this.currentAnalysisId = null;
        
        this.initializeApp();
        this.bindEvents();
        this.checkServerStatus();
    }

    // ... rest of your existing code ...

    async checkServerStatus() {
        try {
            const response = await fetch(`${this.SERVER_URL}/api/health`);
            if (response.ok) {
                const data = await response.json();
                console.log('Server status:', data);
                this.showNotification('Server connection established', 'success');
                
                // Update status panel with actual environment
                this.updateStatusPanel(data);
            } else {
                throw new Error('Server not responding properly');
            }
        } catch (error) {
            console.error('Server status check failed:', error);
            this.showNotification('Connecting to server...', 'warning');
            // Retry after 3 seconds
            setTimeout(() => this.checkServerStatus(), 3000);
        }
    }

    updateStatusPanel(healthData) {
        const analysisStatus = document.getElementById('analysisStatus');
        if (healthData && healthData.status === 'OPERATIONAL') {
            analysisStatus.querySelector('span:last-child').textContent = 'READY';
            analysisStatus.classList.add('active');
        }
    }

    // Enhanced analyzeCode method with better error handling
    async analyzeCode() {
        if (this.isAnalyzing) return;

        const code = document.getElementById('codeInput').value.trim();
        const language = document.getElementById('languageSelect').value;
        const analysisDepth = document.getElementById('analysisDepth').value;

        // Validation
        if (!this.validateCode(code)) return;

        this.setAnalysisState(true);
        this.currentAnalysisId = this.generateAnalysisId();

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const response = await fetch(`${this.SERVER_URL}/api/debug`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: code,
                    language: language,
                    analysisDepth: analysisDepth
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Analysis failed');
            }

            this.displayResults(data);
            this.showNotification('Deep analysis completed successfully', 'success');

        } catch (error) {
            console.error('Analysis error:', error);
            
            if (error.name === 'AbortError') {
                this.showNotification('Request timeout - server is taking too long to respond', 'error');
            } else {
                this.showNotification(`Analysis failed: ${error.message}`, 'error');
            }
        } finally {
            this.setAnalysisState(false);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.debuggerApp = new UltraProDebugger();
});

// Global functions for HTML onclick handlers
function copyCode() {
    if (window.debuggerApp) {
        window.debuggerApp.copyCode();
    }
}
