// Idź na LinkedIn
console.log('🔍 LinkedIn Action - Debug Info:');
console.log('   📦 Received payload:', JSON.stringify(payload, null, 2));
console.log('   📝 Payload type:', typeof payload);
console.log('   📝 Payload.text:', payload?.text);

await page.goto('https://linkedin.com');
console.log('🔗 Załadowano LinkedIn');

const title = await page.title();
console.log(`📖 Tytuł: ${title}`);

// Sprawdź czy jesteśmy zalogowani
try {
    await page.waitForSelector('[data-test-global-alert-action="dismiss"]', { timeout: 3000 });
    console.log('🍪 Jesteś zalogowany na LinkedIn!');
} catch (e) {
    console.log('🔑 Nie jesteś zalogowany - możesz się zalogować ręcznie');
}

// Poczekaj za przycisk publikacji i kliknij
try {
    console.log('🔍 Szukam przycisku "Zacznij publikację"...');
    await page.waitForSelector('button:has-text("Zacznij publikację")', { timeout: 5000 });
    console.log('✅ Znaleziono przycisk publikacji');
    
    await page.click('button:has-text("Zacznij publikację")');
    console.log('🖱️ Kliknięto przycisk publikacji');
    
    // Poczekaj za edytor tekstu
    console.log('🔍 Czekam na edytor tekstu...');
    await page.waitForSelector('[aria-label="Edytor tekstu do tworzenia treści"]', { timeout: 5000 });
    console.log('✅ Edytor gotowy');
    
    // Napisz tekst z payload lub domyślny
    const textToWrite = payload.text || 'World';
    await page.type('[aria-label="Edytor tekstu do tworzenia treści"]', textToWrite);
    console.log(`✍️ Napisano: ${textToWrite}`);

    await page.waitForTimeout(1000);
    await page.waitForSelector('button:has-text("Publikacja")', { timeout: 5000 });
    console.log('✅ Znaleziono przycisk wysyłania publikacji');

    
} catch (error) {
    console.log('❌ Błąd podczas publikacji:', error.message);
    console.log('💡 Sprawdź czy jesteś zalogowany i czy interfejs się nie zmienił');
}

await page.waitForTimeout(5000);

console.log('✅ Akcja LinkedIn zakończona'); 