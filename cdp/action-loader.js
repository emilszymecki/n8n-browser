import path from 'path';
import fs from 'fs';

export async function loadAndExecuteAction(page, actionFilePath, payload = {}) {
    try {
        console.log(`📂 Ładuję akcję z: ${actionFilePath}`);
        console.log(`📦 Payload:`, JSON.stringify(payload, null, 2));
        
        if (!fs.existsSync(actionFilePath)) {
            throw new Error(`Plik akcji nie istnieje: ${actionFilePath}`);
        }
        
        // Przeczytaj plik akcji
        const actionCode = fs.readFileSync(actionFilePath, 'utf8');
        console.log(`📜 Załadowano kod akcji`);
        
        // Utwórz async funkcję z kodu akcji i wykonaj ją z payload
        const actionFunction = new Function('page', 'payload', `return (async function() { ${actionCode} })();`);
        await actionFunction(page, payload);
        
        console.log(`✅ Akcja zakończona pomyślnie`);
        
    } catch (error) {
        console.error(`❌ Błąd wykonania akcji:`, error.message);
        throw error;
    }
}

export function listAvailableActions() {
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

export async function executeActionByName(page, actionName, payload = {}) {
    const actionFilePath = path.join(process.cwd(), 'actions', `${actionName}.js`);
    await loadAndExecuteAction(page, actionFilePath, payload);
}

export function getActionFilePath(actionName) {
    return path.join(process.cwd(), 'actions', `${actionName}.js`);
}

export function actionExists(actionName) {
    const actionFilePath = getActionFilePath(actionName);
    return fs.existsSync(actionFilePath);
} 