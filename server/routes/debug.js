import express from 'express';
import { debugCode } from '../utils/ai.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { code, language = 'javascript' } = req.body;

        if (!code || code.trim().length === 0) {
            return res.json({ 
                success: false,
                error: '❌ Please provide code to analyze' 
            });
        }

        if (code.length < 5) {
            return res.json({
                success: false, 
                error: '❌ Code too short - provide at least 5 characters'
            });
        }

        console.log(`🎯 Analyzing ${language} code (${code.length} chars)...`);
        const result = await debugCode(code, language);
        
        res.json({
            success: true,
            ...result,
            timestamp: new Date().toISOString(),
            analysisId: `analysis_${Date.now()}`,
            note: '✅ Intelligent analysis completed successfully'
        });

    } catch (error) {
        console.error('🚨 Route error:', error);
        res.json({ 
            success: false,
            error: 'Service temporarily unavailable',
            details: 'Please try again in a moment'
        });
    }
});

export default router;
