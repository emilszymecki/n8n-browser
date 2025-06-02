import express from 'express';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Ładuj zmienne z .env jeśli istnieje
dotenv.config();

const app = express();
app.use(express.json());

console.log('🌐 Starting HTTP server...');

// ============ KONFIGURACJA Z .ENV ============
const config = {
    VPS_HOST: process.env.VPS_HOST || 'your-vps-host.com',
    SSH_PORT: process.env.SSH_PORT || '22',
    SSH_USER: process.env.SSH_USER || 'root', 
    REMOTE_PORT: process.env.REMOTE_PORT || '40069',
    LOCAL_PORT: parseInt(process.env.LOCAL_PORT) || 3000,
    MAX_CONCURRENT_TASKS: parseInt(process.env.MAX_CONCURRENT_TASKS) || 2,
    CDP_PORT: process.env.CDP_PORT || '9222'
};

// ============ SYSTEM KOLEJKI Z LIMITEM WSPÓŁBIEŻNOŚCI ============

const MAX_CONCURRENT_TASKS = config.MAX_CONCURRENT_TASKS;
let runningTasks = 0;
const taskQueue = [];

// Status task queue
const taskStats = {
    total: 0,
    completed: 0,
    failed: 0,
    running: 0,
    queued: 0
};

// Struktura task
class Task {
    constructor(action, res, payload = {}) {
        this.id = Date.now() + Math.random().toString(36).substr(2, 9);
        this.action = action;
        this.res = res;
        this.payload = payload;
        this.startTime = null;
        this.endTime = null;
        this.status = 'queued';
        taskStats.total++;
        taskStats.queued++;
    }
}

// Sprawdź czy akcja istnieje
function actionExists(action) {
    const actionsDir = path.join(process.cwd(), 'actions');
    const actionFile = path.join(actionsDir, `${action}.js`);
    return fs.existsSync(actionFile);
}

// Wykonaj kolejny task z kolejki
async function processNextTask() {
    if (runningTasks >= MAX_CONCURRENT_TASKS || taskQueue.length === 0) {
        return;
    }

    const task = taskQueue.shift();
    runningTasks++;
    taskStats.queued--;
    taskStats.running++;
    
    task.status = 'running';
    task.startTime = Date.now();
    
    console.log(`🎬 Rozpoczynam task ${task.id}: ${task.action} (${runningTasks}/${MAX_CONCURRENT_TASKS})`);
    console.log(`📊 Kolejka: ${taskQueue.length} czeka, ${runningTasks} działa`);

    // Skonstruuj komendę dla smart-launcher z payload
    // Zamiast przekazywać przez command line (problemy z escaping), 
    // przekażemy przez zmienną środowiskową
    const payloadJson = JSON.stringify(task.payload);
    const command = `node cdp/smart-launcher.js --${task.action}`;
    console.log(`📜 Komenda: ${command}`);
    console.log(`📦 Payload JSON: ${payloadJson}`);

    // Uruchom smart-launcher z akcją
    exec(command, {
        cwd: process.cwd(),
        timeout: 300000, // 5 minut timeout (zwiększone z 2 minut)
        env: { 
            ...process.env, 
            N8N_PAYLOAD: payloadJson 
        }
    }, (error, stdout, stderr) => {
        
        task.endTime = Date.now();
        const duration = task.endTime - task.startTime;
        runningTasks--;
        taskStats.running--;
        
        console.log(`📊 Task ${task.id} finished - duration: ${duration}ms`);
        console.log(`📤 stdout: ${stdout ? stdout.substring(0, 200) + '...' : 'brak'}`);
        console.log(`📥 stderr: ${stderr ? stderr.substring(0, 200) + '...' : 'brak'}`);
        
        if (error) {
            task.status = 'failed';
            taskStats.failed++;
            console.log(`❌ Task ${task.id} failed:`, error.message);
            console.log(`🔍 Error code: ${error.code}, signal: ${error.signal}`);
            
            task.res.status(500).json({
                action: task.action,
                payload: task.payload,
                status: 'error',
                taskId: task.id,
                duration: duration,
                error: error.message,
                stderr: stderr,
                stdout: stdout,
                timestamp: new Date().toISOString()
            });
        } else {
            task.status = 'completed';
            taskStats.completed++;
            console.log(`✅ Task ${task.id} completed (${duration}ms)`);
            
            // Parsuj payload z output jeśli możliwe
            let resultPayload = {};
            try {
                // Próbuj wyciągnąć JSON z output
                const jsonMatch = stdout.match(/\{.*\}/);
                if (jsonMatch) {
                    resultPayload = JSON.parse(jsonMatch[0]);
                }
            } catch (e) {
                // Jeśli nie ma JSON, zostaw pusty payload
            }
            
            task.res.json({
                action: task.action,
                payload: { ...task.payload, ...resultPayload },
                status: 'success',
                taskId: task.id,
                duration: duration,
                output: stdout,
                timestamp: new Date().toISOString()
            });
        }
        
        // Spróbuj uruchomić kolejny task
        processNextTask();
    });
}

// ============ ENDPOINTS ============

// Endpoint do uruchamiania akcji z kolejką
app.post('/run-script', (req, res) => {
    console.log('📨 Otrzymano POST request:');
    console.log('   📋 Body:', JSON.stringify(req.body, null, 2));
    console.log('   📋 Headers:', JSON.stringify(req.headers, null, 2));
    
    const { action, payload = {} } = req.body;
    
    console.log('📦 Rozparsowane dane:');
    console.log('   🎬 Action:', action);
    console.log('   📦 Payload:', JSON.stringify(payload, null, 2));
    
    if (!action) {
        console.log('❌ Brak nazwy akcji w request');
        return res.status(400).json({
            action: null,
            payload: {},
            status: 'error',
            error: 'Wymagana nazwa akcji w body: {"action": "nazwa_akcji"}',
            example: '{"action": "wp"} lub {"action": "linkedin"}',
            timestamp: new Date().toISOString()
        });
    }
    
    // Sprawdź czy akcja istnieje
    if (!actionExists(action)) {
        console.log(`❌ Akcja "${action}" nie istnieje`);
        return res.status(404).json({
            action: action,
            payload: payload,
            status: 'error',
            error: `Akcja "${action}" nie istnieje`,
            timestamp: new Date().toISOString()
        });
    }
    
    // Dodaj task do kolejki
    const task = new Task(action, res, payload);
    taskQueue.push(task);
    
    console.log(`📋 Dodano task ${task.id} do kolejki: ${action}`);
    console.log(`📊 Stats: ${taskStats.running} running, ${taskStats.queued} queued`);
    
    // Spróbuj uruchomić task natychmiast jeśli można
    processNextTask();
});

// Health check endpoint z info o kolejce
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running',
        queue: {
            maxConcurrent: MAX_CONCURRENT_TASKS,
            running: taskStats.running,
            queued: taskStats.queued,
            total: taskStats.total,
            completed: taskStats.completed,
            failed: taskStats.failed
        },
        timestamp: new Date().toISOString()
    });
});

// Endpoint do listowania dostępnych akcji
app.get('/actions', (req, res) => {
    const actionsDir = path.join(process.cwd(), 'actions');
    
    if (!fs.existsSync(actionsDir)) {
        return res.json({
            status: 'success',
            actions: [],
            message: 'Brak folderu actions/',
            timestamp: new Date().toISOString()
        });
    }
    
    const files = fs.readdirSync(actionsDir)
        .filter(file => file.endsWith('.js'))
        .map(file => file.replace('.js', ''));
    
    res.json({
        status: 'success',
        actions: files,
        message: 'Lista dostępnych akcji',
        count: files.length,
        timestamp: new Date().toISOString()
    });
});

// Endpoint do statusu kolejki
app.get('/queue', (req, res) => {
    const queueInfo = taskQueue.map(task => ({
        id: task.id,
        action: task.action,
        status: task.status,
        queueTime: Date.now() - task.startTime || 0
    }));
    
    res.json({
        status: 'success',
        queue: queueInfo,
        stats: taskStats,
        maxConcurrent: MAX_CONCURRENT_TASKS,
        timestamp: new Date().toISOString()
    });
});

// Start server
const PORT = config.LOCAL_PORT;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Endpointy:`);
    console.log(`   POST /run-script - uruchom akcję (kolejka max ${MAX_CONCURRENT_TASKS})`);
    console.log(`   GET  /actions    - lista akcji`); 
    console.log(`   GET  /health     - status serwera i kolejki`);
    console.log(`   GET  /queue      - status kolejki tasków`);
    console.log(`🔗 SSH Tunnel command:`);
    console.log(`   ssh -R ${config.REMOTE_PORT}:localhost:${config.LOCAL_PORT} -p ${config.SSH_PORT} ${config.SSH_USER}@${config.VPS_HOST} -N`);
    console.log(`🌍 n8n endpoint: http://${config.VPS_HOST}:${config.REMOTE_PORT}/run-script`);
    console.log(`📝 Przykład POST: {"action": "wp", "payload": {}}`);
    console.log(`⚡ Limit współbieżności: ${MAX_CONCURRENT_TASKS} tasków jednocześnie`);
}); 