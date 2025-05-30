import { spawn } from 'child_process';
import path from 'path';
import os from 'os';

console.log('🚀 Uruchamiam Chrome z debug portem...');

// Katalog dla danych użytkownika Chrome
const userDataDir = path.join(process.cwd(), 'browser-data');

// Ścieżki do Chrome na różnych systemach
const chromePaths = {
    win32: [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        path.join(os.homedir(), 'AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'),
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
            if (require('fs').existsSync(chromePath)) {
                console.log(`✅ Znaleziono Chrome: ${chromePath}`);
                return chromePath;
            }
        } catch (e) {
            // Kontynuuj sprawdzanie
        }
    }
    
    console.log('❌ Nie znaleziono Chrome w standardowych lokalizacjach');
    console.log('💡 Sprawdź czy Google Chrome jest zainstalowany');
    console.log('📍 Standardowe ścieżki:');
    paths.forEach(p => console.log(`   ${p}`));
    
    // Użyj ścieżki systemowej jako fallback
    const fallback = platform === 'win32' ? 
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : 
        'google-chrome';
    
    console.log(`🔄 Próbuję fallback: ${fallback}`);
    return fallback;
}

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
console.log('🔗 Możesz teraz użyć: npm run auto lub npm run manual'); 