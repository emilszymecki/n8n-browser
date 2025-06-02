import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

console.log('🚀 Uruchamiam Playwright Browser Server...');

// Katalog dla danych przeglądarki
const userDataDir = path.join(process.cwd(), 'browser-data');

try {
    // Uruchom browser server (wyższa jakość niż connectOverCDP)
    const browserServer = await chromium.launchServer({
        headless: false,
        args: [
            '--disable-popup-blocking',
            '--disable-dev-shm-usage', 
            '--disable-setuid-sandbox',
            '--no-sandbox',
            '--ignore-certificate-errors',
            '--ignore-ssl-errors',
            '--ignore-certificate-errors-spki-list',
            '--enable-features=NetworkService',
            '--no-first-run',
            '--no-default-browser-check'
        ]
    });

    const wsEndpoint = browserServer.wsEndpoint();
    
    console.log('✅ Browser Server uruchomiony!');
    console.log(`🔗 WebSocket endpoint: ${wsEndpoint}`);
    console.log(`📁 User data: ${userDataDir}`);
    
    // Zapisz endpoint do pliku
    fs.writeFileSync('server/ws-endpoint.txt', wsEndpoint);
    console.log('💾 Endpoint zapisany do server/ws-endpoint.txt');
    
    console.log('🔗 Użyj teraz: npm run connect');
    console.log('🛑 Naciśnij Ctrl+C żeby zatrzymać server');
    
    // Utrzymuj server żywy
    await new Promise(() => {});
    
} catch (error) {
    console.error('❌ Błąd:', error.message);
} 