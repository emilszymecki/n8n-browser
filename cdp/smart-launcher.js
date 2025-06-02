import { chromium } from 'playwright';
import path from 'path';
import { ensureChromeRunning } from './chrome-manager.js';
import { loadAndExecuteAction, getActionFilePath } from './action-loader.js';
import dotenv from 'dotenv';

// Ładuj zmienne z .env jeśli istnieje
dotenv.config();

// Konfiguracja
const CDP_PORT = process.env.CDP_PORT || '9222';

// Parsuj argumenty: --nazwa_akcji oraz payload ze środowiska
let actionFile = null;
let actionName = null;
let payload = {};

// Sprawdź zmienną środowiskową dla payload
if (process.env.N8N_PAYLOAD) {
    console.log(`🔍 Raw payload from env: "${process.env.N8N_PAYLOAD}"`);
    try {
        payload = JSON.parse(process.env.N8N_PAYLOAD);
        console.log(`📦 Parsed payload from env:`, JSON.stringify(payload, null, 2));
    } catch (e) {
        console.log(`❌ Błędny JSON w zmiennej środowiskowej N8N_PAYLOAD: "${process.env.N8N_PAYLOAD}"`);
        console.log(`🔍 Error details:`, e.message);
        console.log(`💡 Używam pustego payload`);
        payload = {};
    }
}

// Sprawdź argumenty
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
        // To jest akcja (np. --wp)
        actionName = arg.substring(2);
        actionFile = getActionFilePath(actionName);
        console.log(`🎯 Wykryto akcję: ${actionName}`);
        break;
    }
}

if (!actionFile) {
    console.log('❌ Brak akcji do wykonania!');
    console.log('💡 Użycie: node cdp/smart-launcher.js --nazwa_akcji');
    console.log('📋 Przykłady: --wp, --linkedin');
    process.exit(1);
}

console.log(`🚀 Smart Launcher - akcja: ${actionName}`);

async function executeAction() {
    try {
        console.log('🔗 Łączę się z Chrome przez CDP...');
        const browser = await chromium.connectOverCDP(`http://localhost:${CDP_PORT}`);
        
        console.log('✅ Połączono z Chrome przez CDP');
        console.log(`📊 Dostępne konteksty: ${browser.contexts().length}`);
        
        // Stwórz nowy kontekst lub użyj istniejący
        let context;
        if (browser.contexts().length > 0) {
            context = browser.contexts()[0];
            console.log('📝 Używam istniejący kontekst');
        } else {
            context = await browser.newContext();
            console.log('📄 Utworzono nowy kontekst');
        }
        
        context.setDefaultTimeout(120000); // 2 minuty timeout

        console.log(`🎬 Wykonuję akcję: ${actionName}`);
        
        const page = await context.newPage();
        console.log('📄 Utworzono nową stronę');
        
        try {
            // Wykonaj akcję z pliku
            await loadAndExecuteAction(page, actionFile, payload);
            console.log('✅ Akcja zakończona pomyślnie');
        } finally {
            // Zamknij tylko stronę, nie browser
            await page.close();
            console.log('📄 Zamknięto stronę z akcją');
        }
        
        console.log('🔄 Browser pozostaje uruchomiony dla kolejnych zadań');
        
    } catch (error) {
        console.error('❌ Błąd wykonania akcji:', error.message);
        throw error;
    }
}

// GŁÓWNA LOGIKA
async function main() {
    try {
        // Upewnij się że Chrome działa
        await ensureChromeRunning();
        
        // Wykonaj akcję
        await executeAction();
        
        console.log('🎯 Smart-launcher zakończony pomyślnie');
        process.exit(0); // ✅ Zakończ z sukcesem
        
    } catch (error) {
        console.error('❌ Krytyczny błąd:', error.message);
        process.exit(1);
    }
}

// Uruchom główną funkcję
main(); 