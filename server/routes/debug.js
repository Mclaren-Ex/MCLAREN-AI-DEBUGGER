import express from 'express';
import { debugCode } from '../utils/ai.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { code, language = 'javascript' } = req.body;

        if (!code || code.trim().length === 0) {
            return res.status(400).json({ 
                success: false,
                error: 'Please provide code to analyze' 
            });
        }

        console.log(`🔧 Debugging ${language} code (${code.length} chars)...`);
        const result = await debugCode(code, language);
        
        res.json({
            success: true,
            ...result,
            note: 'AI-powered analysis completed successfully'
        });

    } catch (error) {
        console.error('🚨 Debug route error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Analysis service temporarily unavailable',
            details: 'Using enhanced mock analysis'
        });
    }
});

export default router;
