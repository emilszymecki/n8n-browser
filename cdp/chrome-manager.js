import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';

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

export function findChrome() {
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

export async function checkChromeRunning() {
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

export function launchChrome() {
    console.log('🚀 Uruchamiam Chrome z debug portem...');
    
    const chromePath = findChrome();
    console.log(`🔍 Używam Chrome: ${chromePath}`);

    // WAŻNE: Te argumenty są kluczowe dla niewykrywalności!
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

export async function ensureChromeRunning() {
    const isRunning = await checkChromeRunning();
    
    if (!isRunning) {
        // Uruchom Chrome jeśli nie działa
        await launchChrome();
        
        // Poczekaj chwilę i sprawdź ponownie
        let retries = 5;
        while (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (await checkChromeRunning()) {
                return true;
            }
            retries--;
            console.log(`⏳ Czekam na Chrome... (${retries} prób pozostało)`);
        }
        
        if (retries === 0) {
            throw new Error('Chrome nie uruchomił się w odpowiednim czasie');
        }
    }
    
    return true;
} 