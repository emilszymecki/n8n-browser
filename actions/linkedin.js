// Idź na LinkedIn
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

await page.waitForTimeout(5000);

console.log('✅ Akcja LinkedIn zakończona'); 