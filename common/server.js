import express from 'express';
import { exec } from 'child_process';
import path from 'path';

const app = express();
app.use(express.json());

console.log('🌐 Starting HTTP server...');

// Endpoint do uruchamiania skryptu Playwright
app.post('/run-script', (req, res) => {
    console.log('📨 Otrzymano POST request - uruchamiam Playwright...');
    
    // Uruchom npm start w katalogu projektu
    exec('npm start', {
        cwd: process.cwd(), // aktualny katalog
        timeout: 60000 // 60 sekund timeout
    }, (error, stdout, stderr) => {
        
        if (error) {
            console.log('❌ Błąd wykonania:', error.message);
            return res.status(500).json({
                success: false,
                error: error.message,
                stderr: stderr
            });
        }
        
        console.log('✅ Skrypt wykonany pomyślnie');
        console.log('Output:', stdout);
        
        res.json({
            success: true,
            message: 'Playwright script executed successfully',
            output: stdout,
            timestamp: new Date().toISOString()
        });
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Ready to receive POST requests at /run-script`);
    console.log(`🔗 SSH Tunnel command:`);
    console.log(`   ssh -R 40069:localhost:3000 -p 10165 root@konrad165.mikrus.xyz -N`);
    console.log(`🌍 n8n endpoint: http://konrad165.mikrus.xyz:40069/run-script`);
}); 