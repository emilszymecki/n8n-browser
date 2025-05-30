import { chromium } from 'playwright';

// Pobierz tryb z argumentów: manual lub auto
const mode = process.argv[2] || 'auto';

console.log(`🚀 Łączę się z Chrome przez CDP w trybie: ${mode}`);

try {
    // Łączymy się z już uruchomionym Chrome przez port 9222
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    
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
    
    const page = await context.newPage();
    console.log('📄 Utworzono nową stronę');

    if (mode === 'manual') {
        console.log('👆 TRYB MANUAL - Zaloguj się ręcznie na strony!');
        console.log('🔗 Możesz iść na LinkedIn, Facebook, itp. i się zalogować');
        console.log('🍪 Cookies będą zachowane w Chrome');
        console.log('⏰ Przeglądarka zostanie otwarta na zawsze...');
        console.log('🛑 Naciśnij Ctrl+C żeby zakończyć');
        
        // Idź na pustą stronę
        await page.goto('https://google.com');
        
        // Nieskończone oczekiwanie
        await new Promise(() => {}); // Nigdy się nie kończy
        
    } else {
        console.log('🤖 TRYB AUTO - Automatyczna praca z cookies');
        
        // Idź na wp.pl
        await page.goto('https://wp.pl');
        console.log('🌐 Załadowano wp.pl');
        
        const title = await page.title();
        console.log(`📖 Tytuł: ${title}`);
        
        await page.waitForTimeout(5000);
        
        await page.close();
        console.log('✅ Gotowe');
    }
    
} catch (error) {
    console.error('❌ Błąd:', error.message);
    console.error('💡 Sprawdź czy Chrome jest uruchomiony z flagą --remote-debugging-port=9222');
} 