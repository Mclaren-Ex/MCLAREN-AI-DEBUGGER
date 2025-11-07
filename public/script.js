class McLarenAIDebugger {
    constructor() {
        this.API_URL = window.location.origin;
        this.isAnalyzing = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadExample();
        this.updateCharCount();
    }

    bindEvents() {
        const codeInput = document.getElementById('codeInput');
        codeInput.addEventListener('input', () => this.updateCharCount());
    }

    updateCharCount() {
        const code = document.getElementById('codeInput').value;
        document.getElementById('charCount').textContent = code.length;
    }

    async analyzeCode() {
        if (this.isAnalyzing) return;

        const code = document.getElementById('codeInput').value.trim();
        const language = document.getElementById('languageSelect').value;

        if (!code || code.length < 5) {
            alert('Please enter at least 5 characters of code');
            return;
        }

        this.setLoading(true);

        try {
            const response = await fetch(`${this.API_URL}/api/debug`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: code,
                    language: language
                })
            });

            const data = await response.json();

            if (data.success) {
                this.displayResults(data);
            } else {
                throw new Error(data.error || 'Analysis failed');
            }

        } catch (error) {
            console.error('Analysis error:', error);
            alert('Analysis failed: ' + error.message);
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(loading) {
        this.isAnalyzing = loading;
        const overlay = document.getElementById('loadingOverlay');
        const button = document.getElementById('analyzeBtn');
        
        if (loading) {
            overlay.style.display = 'flex';
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        } else {
            overlay.style.display = 'none';
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-rocket"></i> Analyze Code';
        }
    }

    displayResults(data) {
        // Update severity
        const severityBadge = document.getElementById('severityBadge');
        severityBadge.textContent = data.severity || 'unknown';
        severityBadge.className = `severity-badge ${data.severity || 'low'}`;
        
        document.getElementById('severityText').textContent = `Issues detected: ${data.severity || 'low'} severity`;

        // Update content
        document.getElementById('explanation').textContent = data.explanation || 'No issues found.';
        document.getElementById('fixedCode').textContent = data.fixedCode || '// No changes needed';
        document.getElementById('fixExplanation').textContent = data.fixExplanation || 'No fixes applied.';

        // Update tips
        const tipsList = document.getElementById('tipsList');
        if (data.tips && data.tips.length > 0) {
            tipsList.innerHTML = data.tips.map(tip => `<li>${tip}</li>`).join('');
        }

        // Show results
        document.getElementById('resultsSection').style.display = 'block';
    }

    loadExample() {
        const exampleCode = `function calculateSum(numbers) {
    let total = 0;
    for (let i = 0; i <= numbers.length; i++) {
        total += numbers[i];
    }
    return total;
}

const scores = [85, 92, 78, 96, 88];
console.log(calculateSum(scores));`;

        document.getElementById('codeInput').value = exampleCode;
        this.updateCharCount();
    }
}

// Global functions
function analyzeCode() {
    window.debuggerApp.analyzeCode();
}

function loadExample() {
    window.debuggerApp.loadExample();
}

function copyFixedCode() {
    const fixedCode = document.getElementById('fixedCode').textContent;
    navigator.clipboard.writeText(fixedCode);
    alert('Fixed code copied to clipboard!');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.debuggerApp = new McLarenAIDebugger();
});
