import express from 'express';
import { exec } from 'child_process';
import path from 'path';

const app = express();
app.use(express.json());

console.log('🌐 Starting HTTP server...');

// Endpoint do uruchamiania akcji Playwright
app.post('/run-script', (req, res) => {
    console.log('📨 Otrzymano POST request:', req.body);
    
    // Pobierz nazwę akcji z body
    const { action } = req.body;
    
    if (!action) {
        console.log('❌ Brak nazwy akcji w request');
        return res.status(400).json({
            success: false,
            error: 'Wymagana nazwa akcji w body: {"action": "nazwa_akcji"}',
            example: '{"action": "wp"} lub {"action": "linkedin"}'
        });
    }
    
    // Skonstruuj komendę dla smart-launcher
    const command = `node cdp/smart-launcher.js --${action}`;
    console.log(`🎯 Uruchamiam akcję: ${action}`);
    console.log(`📜 Komenda: ${command}`);
    
    // Uruchom smart-launcher z akcją
    exec(command, {
        cwd: process.cwd(),
        timeout: 120000 // 2 minuty timeout
    }, (error, stdout, stderr) => {
        
        if (error) {
            console.log('❌ Błąd wykonania:', error.message);
            return res.status(500).json({
                success: false,
                action: action,
                error: error.message,
                stderr: stderr,
                stdout: stdout
            });
        }
        
        console.log(`✅ Akcja "${action}" wykonana pomyślnie`);
        console.log('Output:', stdout);
        
        res.json({
            success: true,
            action: action,
            message: `Akcja "${action}" wykonana pomyślnie`,
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

// Endpoint do listowania dostępnych akcji
app.get('/actions', (req, res) => {
    exec('node cdp/smart-launcher.js', {
        cwd: process.cwd(),
        timeout: 10000
    }, (error, stdout, stderr) => {
        // Wyciągnij listę akcji z output
        const lines = stdout.split('\n');
        const actions = [];
        
        let foundActions = false;
        for (const line of lines) {
            if (line.includes('📋 Dostępne akcje:')) {
                foundActions = true;
                continue;
            }
            if (foundActions && line.trim().startsWith('--')) {
                const action = line.trim().substring(2);
                actions.push(action);
            }
            if (foundActions && line.trim() === '') {
                break;
            }
        }
        
        res.json({
            success: true,
            actions: actions,
            message: 'Lista dostępnych akcji',
            timestamp: new Date().toISOString()
        });
    });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Endpointy:`);
    console.log(`   POST /run-script - uruchom akcję`);
    console.log(`   GET  /actions    - lista akcji`); 
    console.log(`   GET  /health     - status serwera`);
    console.log(`🔗 SSH Tunnel command:`);
    console.log(`   ssh -R 40069:localhost:3000 -p 10165 root@konrad165.mikrus.xyz -N`);
    console.log(`🌍 n8n endpoint: http://konrad165.mikrus.xyz:40069/run-script`);
    console.log(`📝 Przykład POST: {"action": "wp"} lub {"action": "linkedin"}`);
}); 