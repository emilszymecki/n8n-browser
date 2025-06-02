import { chromium } from 'playwright';
import fs from 'fs';

// Pobierz tryb z argumentów: manual lub auto
const mode = process.argv[2] || 'auto';

console.log(`🚀 Łączę się z Browser Server w trybie: ${mode}`);

try {
    // Wczytaj WebSocket endpoint
    if (!fs.existsSync('server/ws-endpoint.txt')) {
        throw new Error('Brak pliku server/ws-endpoint.txt - uruchom najpierw: npm run launch-server');
    }
    
    const wsEndpoint = fs.readFileSync('server/ws-endpoint.txt', 'utf8').trim();
    console.log(`🔗 Łączę się z: ${wsEndpoint}`);
    
    // Połącz się z browser server (wysoka jakość połączenia)
    const browser = await chromium.connect(wsEndpoint);
    
    console.log('✅ Połączono z Browser Server');
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
    
    const page = await context.newPage();
    console.log('📄 Utworzono nową stronę');

    if (mode === 'manual') {
        console.log('👆 TRYB MANUAL - Zaloguj się ręcznie na strony!');
        console.log('🔗 Możesz iść na LinkedIn, Facebook, itp. i się zalogować');
        console.log('🍪 Cookies będą zachowane w browser server');
        console.log('⏰ Przeglądarka zostanie otwarta na zawsze...');
        console.log('🛑 Naciśnij Ctrl+C żeby zakończyć');
        
        // Idź na pustą stronę
        await page.goto('https://google.com');
        
        // Nieskończone oczekiwanie
        await new Promise(() => {}); // Nigdy się nie kończy
        
    } else {
        console.log('🤖 TRYB AUTO - Automatyczna praca z cookies');
        
        // Idź na wp.pl
        await page.goto('https://allegro.pl/');
        console.log('🌐 Załadowano allegro.pl');
        
        const title = await page.title();
        console.log(`📖 Tytuł: ${title}`);
        
        await page.waitForTimeout(5000);
        
        await page.close();
        console.log('✅ Gotowe');
    }
    
} catch (error) {
    console.error('❌ Błąd:', error.message);
    console.error('💡 Sprawdź czy Browser Server jest uruchomiony: npm run launch-server');
} 