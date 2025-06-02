import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';
import readline from 'readline';

// Parsuj argumenty: --nazwa_akcji lub manual/auto
let mode = 'manual'; // Domyślny tryb to manual
let actionFile = null;

// Sprawdź argumenty
const args = process.argv.slice(2);
for (const arg of args) {
    if (arg.startsWith('--')) {
        // To jest akcja (np. --wp)
        const actionName = arg.substring(2);
        actionFile = path.join(process.cwd(), 'actions', `${actionName}.js`);
        mode = 'action';
        console.log(`🎯 Wykryto akcję: ${actionName}`);
    } else if (['manual', 'auto'].includes(arg)) {
        // To jest standardowy tryb
        mode = arg;
    }
}

console.log(`🚀 Smart Launcher - tryb: ${mode}${actionFile ? ` (akcja: ${path.basename(actionFile)})` : ''}`);

// Katalog dla danych użytkownika Chrome
const userDataDir = path.join(process.cwd(), 'browser-data');

// Ścieżki do Chrome na różnych systemach
const chromePaths = {
    win32: [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        path.join(os.homedir(), 'AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'),
        'C:\\Users\\*\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'
    ],
    darwin: [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    ],
    linux: [
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser',
        '/snap/bin/chromium'
    ]
};

function findChrome() {
    const platform = os.platform();
    const paths = chromePaths[platform] || chromePaths.linux;
    
    for (const chromePath of paths) {
        try {
            if (fs.existsSync(chromePath)) {
                console.log(`✅ Znaleziono Chrome: ${chromePath}`);
                return chromePath;
            }
        } catch (e) {
            // Kontynuuj sprawdzanie
        }
    }
    
    console.log('❌ Nie znaleziono Chrome w standardowych lokalizacjach');
    const fallback = platform === 'win32' ? 
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : 
        'google-chrome';
    
    console.log(`🔄 Próbuję fallback: ${fallback}`);
    return fallback;
}

async function checkChromeRunning() {
    try {
        console.log('🔍 Sprawdzam czy Chrome działa na porcie 9222...');
        const response = await fetch('http://localhost:9222/json/version');
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Chrome już działa! Wersja: ${data['User-Agent']}`);
            return true;
        }
    } catch (error) {
        console.log('❌ Chrome nie działa na porcie 9222');
        return false;
    }
    return false;
}

function launchChrome() {
    console.log('🚀 Uruchamiam Chrome z debug portem...');
    
    const chromePath = findChrome();
    console.log(`🔍 Używam Chrome: ${chromePath}`);

    const args = [
        '--remote-debugging-port=9222',
        `--user-data-dir=${userDataDir}`,
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
    ];

    console.log('🎯 Argumenty Chrome:');
    args.forEach(arg => console.log(`   ${arg}`));

    const chromeProcess = spawn(chromePath, args, {
        detached: true,
        stdio: 'ignore'
    });

    chromeProcess.unref();

    console.log('✅ Chrome uruchomiony!');
    console.log('🌐 Debug port: http://localhost:9222');
    console.log(`📁 User data: ${userDataDir}`);
    
    // Czekamy chwilę żeby Chrome się uruchomił
    return new Promise(resolve => {
        setTimeout(() => {
            console.log('⏰ Chrome powinien być już gotowy...');
            resolve();
        }, 3000); // 3 sekundy na uruchomienie Chrome
    });
}

async function loadAndExecuteAction(page, actionFilePath) {
    try {
        console.log(`📂 Ładuję akcję z: ${actionFilePath}`);
        
        if (!fs.existsSync(actionFilePath)) {
            throw new Error(`Plik akcji nie istnieje: ${actionFilePath}`);
        }
        
        // Przeczytaj plik akcji
        const actionCode = fs.readFileSync(actionFilePath, 'utf8');
        console.log(`📜 Załadowano kod akcji`);
        
        // Utwórz async funkcję z kodu akcji i wykonaj ją
        const actionFunction = new Function('page', `return (async function() { ${actionCode} })();`);
        await actionFunction(page);
        
        console.log(`✅ Akcja zakończona pomyślnie`);
        
    } catch (error) {
        console.error(`❌ Błąd wykonania akcji:`, error.message);
        throw error;
    }
}

function listAvailableActions() {
    const actionsDir = path.join(process.cwd(), 'actions');
    if (!fs.existsSync(actionsDir)) {
        console.log('📁 Brak folderu actions/');
        return [];
    }
    
    const files = fs.readdirSync(actionsDir)
        .filter(file => file.endsWith('.js'))
        .map(file => file.replace('.js', ''));
    
    if (files.length > 0) {
        console.log('📋 Dostępne akcje:');
        files.forEach(action => console.log(`   --${action}`));
    } else {
        console.log('📋 Brak dostępnych akcji w folderze actions/');
    }
    
    return files;
}

async function executeActionByName(page, actionName) {
    const actionFilePath = path.join(process.cwd(), 'actions', `${actionName}.js`);
    await loadAndExecuteAction(page, actionFilePath);
}

async function interactiveMode(context) {
    console.log('\n🎮 TRYB INTERAKTYWNY - Wpisz akcje do wykonania:');
    console.log('💡 Przykłady: wp, linkedin, exit');
    
    listAvailableActions();
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    try {
        while (true) {
            try {
                const input = await new Promise((resolve, reject) => {
                    rl.question('\n🚀 Podaj akcję (lub "exit"): ', (answer) => {
                        resolve(answer);
                    });
                    
                    // Timeout jako safety net
                    setTimeout(() => {
                        reject(new Error('Timeout waiting for input'));
                    }, 300000); // 5 minut timeout
                });

                if (input.trim().toLowerCase() === 'exit') {
                    console.log('👋 Zamykam tryb interaktywny');
                    break;
                }

                if (input.trim() === '') {
                    continue;
                }

                const actionName = input.trim();
                const actionFilePath = path.join(process.cwd(), 'actions', `${actionName}.js`);
                
                if (!fs.existsSync(actionFilePath)) {
                    console.log(`❌ Akcja "${actionName}" nie istnieje`);
                    listAvailableActions();
                    continue;
                }

                console.log(`\n🎬 Wykonuję akcję: ${actionName}`);
                
                // Utwórz nową stronę dla każdej akcji
                const page = await context.newPage();
                
                try {
                    await executeActionByName(page, actionName);
                } catch (error) {
                    console.error(`❌ Błąd akcji "${actionName}":`, error.message);
                }

            } catch (error) {
                if (error.message.includes('Timeout') || error.message.includes('closed')) {
                    console.log('\n⏰ Timeout lub zamknięcie readline - kończę tryb interaktywny');
                    break;
                }
                console.error('❌ Błąd w trybie interaktywnym:', error.message);
                break;
            }
        }
    } catch (error) {
        console.error('❌ Krytyczny błąd w trybie interaktywnym:', error.message);
    } finally {
        try {
            rl.close();
        } catch (e) {
            // Ignore close errors
        }
    }
}

async function connectAndWork() {
    try {
        console.log('🔗 Łączę się z Chrome przez CDP...');
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

        if (mode === 'manual') {
            console.log('👆 TRYB MANUAL - Interaktywne wykonywanie akcji!');
            console.log('🔗 Przeglądarka pozostanie otwarta');
            console.log('🍪 Cookies będą zachowane między akcjami');
            
            // Uruchom tryb interaktywny
            await interactiveMode(context);
            
        } else if (mode === 'auto') {
            console.log('🤖 TRYB AUTO - Automatyczna praca z cookies');
            
            const page = await context.newPage();
            console.log('📄 Utworzono nową stronę');
            
            // Idź na wp.pl
            await page.goto('https://wp.pl');
            console.log('🌐 Załadowano wp.pl');
            
            const title = await page.title();
            console.log(`📖 Tytuł: ${title}`);
            
            await page.waitForTimeout(5000);
            
            await page.close();
            console.log('✅ Gotowe');
            
        } else if (mode === 'action' && actionFile) {
            console.log(`🎬 TRYB AKCJI - Wykonuję akcję i zamykam`);
            
            const page = await context.newPage();
            console.log('📄 Utworzono nową stronę');
            
            // Wykonaj akcję z pliku
            await loadAndExecuteAction(page, actionFile);
            
            // Zamknij wszystko po akcji
            await browser.close();
            console.log('🔐 Zamknięto browser po akcji');
        }
        
    } catch (error) {
        console.error('❌ Błąd połączenia:', error.message);
        throw error;
    }
}

// GŁÓWNA LOGIKA
async function main() {
    try {
        // Sprawdź czy Chrome już działa
        const isRunning = await checkChromeRunning();
        
        if (!isRunning) {
            // Uruchom Chrome jeśli nie działa
            await launchChrome();
            
            // Poczekaj chwilę i sprawdź ponownie
            let retries = 5;
            while (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                if (await checkChromeRunning()) {
                    break;
                }
                retries--;
                console.log(`⏳ Czekam na Chrome... (${retries} prób pozostało)`);
            }
            
            if (retries === 0) {
                throw new Error('Chrome nie uruchomił się w odpowiednim czasie');
            }
        }
        
        // Połącz się i wykonaj zadanie
        await connectAndWork();
        
    } catch (error) {
        console.error('❌ Krytyczny błąd:', error.message);
        process.exit(1);
    }
}

// Uruchom główną funkcję
main(); 