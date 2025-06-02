// Idź na wp.pl
await page.goto('https://wp.pl');
console.log('🌐 Załadowano wp.pl');

const title = await page.title();
console.log(`📖 Tytuł: ${title}`);

await page.waitForTimeout(5000);

console.log('✅ Gotowe');