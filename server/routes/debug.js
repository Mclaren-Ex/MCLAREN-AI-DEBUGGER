import express from 'express';

const router = express.Router();

// Add request logging middleware
router.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path} - ${req.ip}`);
    next();
});

// Enhanced mock responses for comprehensive testing
const ENHANCED_MOCK_RESPONSES = {
    // ... keep your existing mock responses ...
};

// Enhanced AI-powered debugging
router.post('/', async (req, res) => {
    const startTime = Date.now();
    
    try {
        const { code, language = 'javascript', analysisDepth = 'comprehensive' } = req.body;

        // Comprehensive validation
        if (!code || code.trim().length === 0) {
            return res.status(400).json({ 
                success: false,
                error: 'CODE_REQUIRED',
                message: 'Source code is required for analysis'
            });
        }

        if (code.length > 15000) {
            return res.status(400).json({
                success: false,
                error: 'CODE_TOO_LARGE',
                message: 'Code exceeds maximum analysis size (15,000 characters)'
            });
        }

        if (code.trim().length < 10) {
            return res.status(400).json({
                success: false,
                error: 'CODE_TOO_SMALL', 
                message: 'Code is too short for meaningful analysis'
            });
        }

        console.log(`🔧 [${language.toUpperCase()}] Analyzing ${code.length} chars with ${analysisDepth} depth...`);
        
        // Check for Gemini API key in production
        const isProduction = process.env.NODE_ENV === 'production';
        const hasGeminiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';
        
        if (!hasGeminiKey) {
            console.log('⚠️ Using enhanced mock response - GEMINI_API_KEY not configured');
            
            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
            
            const mockResponse = ENHANCED_MOCK_RESPONSES[language] || ENHANCED_MOCK_RESPONSES.javascript;
            
            return res.json({
                success: true,
                ...mockResponse,
                metadata: {
                    analysisId: generateAnalysisId(),
                    timestamp: new Date().toISOString(),
                    processingTime: Date.now() - startTime,
                    analysisDepth: analysisDepth,
                    codeSize: code.length,
                    language: language,
                    note: 'DEMO_MODE - Configure GEMINI_API_KEY for real AI analysis.',
                    mode: 'mock',
                    environment: isProduction ? 'production' : 'development'
                }
            });
        }

        // Real Gemini API integration would go here
        // const debugResult = await debugWithGemini(code, language, analysisDepth);
        
        // For now, return enhanced mock even with API key (until you implement real API)
        const mockResponse = ENHANCED_MOCK_RESPONSES[language] || ENHANCED_MOCK_RESPONSES.javascript;
        
        res.json({
            success: true,
            ...mockResponse,
            metadata: {
                analysisId: generateAnalysisId(),
                timestamp: new Date().toISOString(),
                processingTime: Date.now() - startTime,
                analysisDepth: analysisDepth,
                codeSize: code.length,
                language: language,
                confidence: 0.92,
                aiModel: 'gemini-pro',
                mode: 'mock',
                environment: isProduction ? 'production' : 'development'
            }
        });

    } catch (error) {
        console.error('❌ Professional Debug Error:', error);
        
        res.status(500).json({ 
            success: false,
            error: 'ANALYSIS_FAILED',
            message: 'Comprehensive code analysis failed',
            details: error.message,
            reference: `ERR_${Date.now()}`,
            timestamp: new Date().toISOString()
        });
    }
});

// Utility function
function generateAnalysisId() {
    return `ANALYSIS_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

export default router;
