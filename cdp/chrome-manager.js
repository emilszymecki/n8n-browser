import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';
import dotenv from 'dotenv';

// Ładuj zmienne z .env jeśli istnieje
dotenv.config();

// Konfiguracja
const CDP_PORT = process.env.CDP_PORT || '9222';

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
        console.log(`🔍 Sprawdzam czy Chrome działa na porcie ${CDP_PORT}...`);
        const response = await fetch(`http://localhost:${CDP_PORT}/json/version`);
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Chrome już działa! Wersja: ${data['User-Agent']}`);
            return true;
        }
    } catch (error) {
        console.log(`❌ Chrome nie działa na porcie ${CDP_PORT}`);
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
        `--remote-debugging-port=${CDP_PORT}`,
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
    console.log(`🌐 Debug port: http://localhost:${CDP_PORT}`);
    console.log(`📁 User data: ${userDataDir}`);
    
    // Czekamy chwilę żeby Chrome się uruchomił
    return new Promise(resolve => {
        setTimeout(() => {
            console.log('⏰ Chrome powinien być już gotowy...');
            resolve();
        }, 5000); // 5 sekund na uruchomienie Chrome (zwiększone z 3)
    });
}

export async function ensureChromeRunning() {
    const isRunning = await checkChromeRunning();
    
    if (!isRunning) {
        // Uruchom Chrome jeśli nie działa
        await launchChrome();
        
        // Poczekaj chwilę i sprawdź ponownie
        let retries = 10;
        while (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 2000));
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