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

        console.log(`🔧 Debugging ${language} code...`);
        const result = await debugCode(code, language);
        
        res.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error('Debug error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Analysis failed',
            details: error.message 
        });
    }
});

export default router;
