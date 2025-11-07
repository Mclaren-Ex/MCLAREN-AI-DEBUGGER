import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import https from 'https';

// Security & Performance imports
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
        },
    },
    crossOriginEmbedderPolicy: false
}));

app.use(compression());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.'
    }
});
app.use('/api/', limiter);

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.RENDER_EXTERNAL_URL, 'https://*.render.com']
    : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.some(allowed => origin.match(new RegExp(allowed.replace('*', '.*'))))) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// Import routes
const debugRoutes = await import('./routes/debug.js');

// Routes
app.use('/api/debug', debugRoutes.default);

// API endpoints
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OPERATIONAL',
        service: 'Ultra-Pro AI Debugger',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: `The requested endpoint ${req.originalUrl} does not exist.`
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('🚨 Global Error Handler:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred. Our team has been notified.',
        reference: error?.reference || 'NO_REFERENCE'
    });
});

// Keep-alive mechanism for Render
function keepAlive() {
    const url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    setInterval(() => {
        https.get(url, (resp) => {
            if (resp.statusCode === 200) {
                console.log('Server kept alive');
            }
        }).on('error', (err) => {
            console.log('Keep-alive error:', err.message);
        });
    }, 840000); // Ping every 14 minutes (Render's free tier sleeps after 15 minutes)
}

app.listen(PORT, () => {
    console.log(`🚀 Ultra-Pro AI Debugger v2.0.0`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
    console.log(`🛡️  Security: Enabled`);
    console.log(`⚡ Performance: Optimized`);
    
    if (process.env.NODE_ENV === 'production') {
        keepAlive();
        console.log('🔄 Keep-alive mechanism activated');
    }
});
