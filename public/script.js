// Ultra-Pro AI Debugger - Enterprise Grade JavaScript
class UltraProDebugger {
    constructor() {
        this.SERVER_URL = 'http://localhost:3000';
        this.isAnalyzing = false;
        this.currentAnalysisId = null;
        
        this.initializeApp();
        this.bindEvents();
        this.checkServerStatus();
    }

    initializeApp() {
        this.loadExampleCode();
        this.updateEditorStats();
        console.log('🚀 Ultra-Pro AI Debugger Initialized');
    }

    bindEvents() {
        // Core functionality
        document.getElementById('analyzeBtn').addEventListener('click', () => this.analyzeCode());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearEditor());
        document.getElementById('formatBtn').addEventListener('click', () => this.formatCode());
        document.getElementById('loadExampleBtn').addEventListener('click', () => this.loadExampleCode());
        document.getElementById('replaceCodeBtn').addEventListener('click', () => this.replaceWithFixedCode());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportReport());
        document.getElementById('copyReportBtn').addEventListener('click', () => this.copyReport());

        // Editor events
        document.getElementById('codeInput').addEventListener('input', () => this.updateEditorStats());
        
        // Quick actions
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.loadQuickExample(e.target.closest('.action-btn').dataset.example));
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

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
            const response = await fetch(`${this.SERVER_URL}/api/debug`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: code,
                    language: language,
                    analysisDepth: analysisDepth
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Analysis failed');
            }

            this.displayResults(data);
            this.showNotification('Deep analysis completed successfully', 'success');

        } catch (error) {
            console.error('Analysis error:', error);
            this.showNotification(error.message, 'error');
        } finally {
            this.setAnalysisState(false);
        }
    }

    validateCode(code) {
        if (!code || code.trim().length === 0) {
            this.showNotification('Please enter code to analyze', 'warning');
            return false;
        }

        if (code.length < 10) {
            this.showNotification('Code is too short for meaningful analysis', 'warning');
            return false;
        }

        if (code.length > 15000) {
            this.showNotification('Code exceeds maximum analysis size (15,000 characters)', 'error');
            return false;
        }

        return true;
    }

    setAnalysisState(analyzing) {
        this.isAnalyzing = analyzing;
        const loadingOverlay = document.getElementById('loadingOverlay');
        const analyzeBtn = document.getElementById('analyzeBtn');
        const analysisStatus = document.getElementById('analysisStatus');

        if (analyzing) {
            loadingOverlay.style.display = 'flex';
            analyzeBtn.disabled = true;
            analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
            analysisStatus.querySelector('span:last-child').textContent = 'ANALYZING';
            analysisStatus.classList.add('active');
            
            // Animate loading steps
            this.animateLoadingSteps();
        } else {
            loadingOverlay.style.display = 'none';
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = '<i class="fas fa-rocket"></i> Deep Analysis';
            analysisStatus.querySelector('span:last-child').textContent = 'READY';
            analysisStatus.classList.remove('active');
        }
    }

    animateLoadingSteps() {
        const steps = document.querySelectorAll('.loading-steps .step');
        steps.forEach((step, index) => {
            setTimeout(() => {
                step.classList.add('active');
            }, index * 800);
        });
    }

    displayResults(data) {
        // Update executive summary
        document.getElementById('executiveSummary').textContent = 
            `Analysis completed at ${new Date().toLocaleTimeString()}. ${data.explanation?.split('.')[0] || 'Issues identified and resolved.'}`;

        // Update severity
        const severityBadge = document.getElementById('overallSeverity');
        severityBadge.textContent = data.severity || 'unknown';
        severityBadge.className = `severity-badge ${data.severity || 'low'}`;

        // Update detailed analysis
        document.getElementById('explanation').textContent = data.explanation || 'No issues found.';
        document.getElementById('fixExplanation').textContent = data.fixExplanation || 'No fixes required.';

        // Update fixed code
        const fixedCodeElement = document.getElementById('fixedCode');
        fixedCodeElement.textContent = data.fixedCode || '// No changes needed';

        // Update performance metrics
        if (data.complexity) {
            document.getElementById('timeComplexity').textContent = data.complexity.time;
            document.getElementById('spaceComplexity').textContent = data.complexity.space;
            document.getElementById('performanceGain').textContent = data.complexity.improvement;
        }

        // Update best practices
        const tipsList = document.getElementById('tipsList');
        if (data.tips && data.tips.length > 0) {
            tipsList.innerHTML = data.tips.map(tip => 
                `<li>${tip}</li>`
            ).join('');
        }

        // Update security analysis
        const securityAnalysis = document.getElementById('securityAnalysis');
        securityAnalysis.innerHTML = `
            <div class="security-indicator ${data.security?.includes('vulnerabilities') ? 'critical' : 'safe'}">
                <i class="fas fa-${data.security?.includes('vulnerabilities') ? 'exclamation-triangle' : 'check-circle'}"></i>
                <span>${data.security || 'Security assessment completed'}</span>
            </div>
        `;

        // Show results section
        document.getElementById('resultsSection').style.display = 'block';

        // Update analysis time
        const analysisTime = document.getElementById('analysisTime');
        analysisTime.textContent = `Last analysis: ${new Date().toLocaleTimeString()}`;
        analysisTime.style.color = 'var(--success)';

        // Add metadata if available
        if (data.metadata) {
            console.log('Analysis metadata:', data.metadata);
        }
    }

    clearEditor() {
        if (confirm('Clear the code editor? This action cannot be undone.')) {
            document.getElementById('codeInput').value = '';
            this.updateEditorStats();
            this.showNotification('Editor cleared', 'success');
        }
    }

    formatCode() {
        const codeInput = document.getElementById('codeInput');
        const code = codeInput.value;
        
        try {
            // Basic formatting for common languages
            const language = document.getElementById('languageSelect').value;
            let formatted = code;
            
            // Add basic indentation logic here
            formatted = this.autoIndentCode(formatted, language);
            
            codeInput.value = formatted;
            this.showNotification('Code formatted', 'success');
        } catch (error) {
            this.showNotification('Formatting failed', 'error');
        }
    }

    autoIndentCode(code, language) {
        // Basic auto-indentation logic
        return code.split('\n').map(line => {
            // Remove existing leading whitespace and add proper indentation
            const trimmed = line.trim();
            if (trimmed.length === 0) return '';
            
            // Simple indentation based on braces (can be enhanced)
            return '    ' + trimmed;
        }).join('\n');
    }

    loadExampleCode() {
        const examples = {
            javascript: `// Array Processing Bug - Off-by-one error
function processUserScores(scores) {
    let total = 0;
    let highest = scores[0];
    
    for (let i = 0; i <= scores.length; i++) {
        total += scores[i];
        if (scores[i] > highest) {
            highest = scores[i];
        }
    }
    
    const average = total / scores.length;
    return { total, average, highest };
}

// This will crash with undefined values
const userScores = [85, 92, 78, 96, 88];
console.log(processUserScores(userScores));`,

            python: `# Division by zero and type safety issues
def calculate_statistics(data):
    total = sum(data)
    average = total / len(data)
    maximum = max(data)
    minimum = min(data)
    
    return {
        'total': total,
        'average': average,
        'maximum': maximum,
        'minimum': minimum
    }

# This will fail with empty lists and mixed types
test_data = [10, 20, 30, 40, 50]
empty_data = []
mixed_data = [1, 2, '3', 4]

print(calculate_statistics(test_data))
print(calculate_statistics(empty_data))`
        };

        const language = document.getElementById('languageSelect').value;
        document.getElementById('codeInput').value = examples[language] || examples.javascript;
        this.updateEditorStats();
        this.showNotification('Example code loaded', 'success');
    }

    loadQuickExample(exampleType) {
        const examples = {
            'array-bug': `function findDuplicates(arr) {
    let duplicates = [];
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length; j++) {
            if (arr[i] === arr[j] && i !== j) {
                duplicates.push(arr[i]);
            }
        }
    }
    return duplicates;
}`,

            'async-bug': `async function fetchUserData(userId) {
    const response = fetch('/api/users/' + userId);
    const data = response.json();
    return data;
}

async function processUsers() {
    const users = [1, 2, 3];
    users.forEach(userId => {
        const data = fetchUserData(userId);
        console.log(data);
    });
}`,

            'security-bug': `function processUserInput(input) {
    const query = "SELECT * FROM users WHERE name = '" + input + "'";
    return database.query(query);
}`,

            'performance-bug': `function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}`
        };

        document.getElementById('codeInput').value = examples[exampleType] || examples['array-bug'];
        document.getElementById('languageSelect').value = 'javascript';
        this.updateEditorStats();
        this.showNotification(`Loaded ${exampleType.replace('-', ' ')} example`, 'success');
    }

    updateEditorStats() {
        const codeInput = document.getElementById('codeInput');
        const code = codeInput.value;
        
        const lineCount = code.split('\n').length;
        const charCount = code.length;
        
        document.getElementById('lineCount').textContent = `${lineCount} lines`;
        document.getElementById('charCount').textContent = `${charCount.toLocaleString()} chars`;
        
        // Update character count color based on limits
        const charCountElement = document.getElementById('charCount');
        if (charCount > 15000) {
            charCountElement.style.color = 'var(--danger)';
        } else if (charCount > 10000) {
            charCountElement.style.color = 'var(--warning)';
        } else {
            charCountElement.style.color = '';
        }
    }

    replaceWithFixedCode() {
        const fixedCode = document.getElementById('fixedCode').textContent;
        if (fixedCode && !fixedCode.includes('// No changes needed')) {
            document.getElementById('codeInput').value = fixedCode;
            this.updateEditorStats();
            this.showNotification('Original code replaced with optimized solution', 'success');
        } else {
            this.showNotification('No optimized solution available to replace', 'warning');
        }
    }

    async exportReport() {
        const report = this.generateReport();
        const blob = new Blob([report], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code-analysis-${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Report exported successfully', 'success');
    }

    generateReport() {
        const analysisTime = new Date().toLocaleString();
        const code = document.getElementById('codeInput').value;
        const language = document.getElementById('languageSelect').value;
        
        return `# Code Analysis Report
Generated: ${analysisTime}
Language: ${language}
Analysis ID: ${this.currentAnalysisId || 'N/A'}

## Original Code
\`\`\`${language}
${code}
\`\`\`

## Analysis Results
${document.getElementById('explanation').textContent}

## Optimized Solution
\`\`\`${language}
${document.getElementById('fixedCode').textContent}
\`\`\`

## Performance Metrics
- Time Complexity: ${document.getElementById('timeComplexity').textContent}
- Space Complexity: ${document.getElementById('spaceComplexity').textContent}
- Performance Improvement: ${document.getElementById('performanceGain').textContent}

---
*Generated by Ultra-Pro AI Debugger v2.0.0*`;
    }

    copyCode() {
        const fixedCode = document.getElementById('fixedCode').textContent;
        navigator.clipboard.writeText(fixedCode).then(() => {
            this.showNotification('Optimized code copied to clipboard', 'success');
        });
    }

    copyReport() {
        const report = this.generateReport();
        navigator.clipboard.writeText(report).then(() => {
            this.showNotification('Analysis report copied to clipboard', 'success');
        });
    }

    handleKeyboardShortcuts(e) {
        if ((e.ctrlKey || e.metaKey)) {
            switch(e.key) {
                case 'Enter':
                    e.preventDefault();
                    this.analyzeCode();
                    break;
                case 'k':
                    e.preventDefault();
                    this.clearEditor();
                    break;
                case 'l':
                    e.preventDefault();
                    this.loadExampleCode();
                    break;
                case 'f':
                    e.preventDefault();
                    this.formatCode();
                    break;
            }
        }
    }

    async checkServerStatus() {
        try {
            const response = await fetch(`${this.SERVER_URL}/api/health`);
            if (response.ok) {
                const data = await response.json();
                console.log('Server status:', data);
                this.showNotification('Server connection established', 'success');
            } else {
                throw new Error('Server not responding properly');
            }
        } catch (error) {
            console.error('Server status check failed:', error);
            this.showNotification('Server connection failed - make sure to run: npm start', 'error');
        }
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        const id = 'notification-' + Date.now();
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.id = id;
        notification.innerHTML = `
            <i class="${icons[type] || icons.info}"></i>
            <div class="notification-content">
                <div class="notification-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" onclick="document.getElementById('${id}').remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (document.getElementById(id)) {
                document.getElementById(id).remove();
            }
        }, 5000);
    }

    generateAnalysisId() {
        return `ANALYSIS_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
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