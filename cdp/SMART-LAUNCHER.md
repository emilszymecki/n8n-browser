# 🧠 Smart Launcher - Inteligentny Launcher CDP z Dynamicznymi Akcjami

## ✨ NOWA FUNKCJONALNOŚĆ V2.0

**Jeden skrypt do wszystkiego** - sprawdza czy Chrome działa, jeśli nie to go uruchamia, a potem wykonuje zadanie lub akcję.

## 🚀 Jak używać:

### 🎯 Dynamiczne Akcje (NOWOŚĆ):
```bash
npm run launch-chrome          # manual mode (domyślnie)
npm run launch-chrome -- --wp  # akcja wp.js
npm run launch-chrome -- --linkedin # akcja linkedin.js
node cdp/smart-launcher.js --wp     # bezpośrednio
```

### 🔧 Standardowe tryby:
```bash
npm run auto                   # tryb automatyczny  
npm run manual                 # tryb ręczny
npm start                      # manual mode (domyślnie)
```

## 📂 System Akcji:

### Struktura:
```
actions/
├── wp.js        # npm run launch-chrome -- --wp
├── linkedin.js  # npm run launch-chrome -- --linkedin
└── nazwa.js     # npm run launch-chrome -- --nazwa
```

### Format pliku akcji:
```javascript
// actions/moja-akcja.js
await page.goto('https://example.com');
console.log('🌐 Załadowano stronę');

const title = await page.title();
console.log(`📖 Tytuł: ${title}`);

await page.waitForTimeout(5000);
await page.close();
console.log('✅ Akcja zakończona');
```

## 🧠 Inteligentna logika:

1. **Parsuje argumenty**
   - `--nazwa` → ładuje `actions/nazwa.js`
   - `manual/auto` → standardowe tryby
   - brak argumentów → `manual` (domyślnie)

2. **Sprawdza Chrome** na porcie 9222
   - Sprawdza http://localhost:9222/json/version
   
3. **Uruchamia Chrome** jeśli nie działa
   - Używa tych samych argumentów co launch-chrome.js
   - Czeka 3 sekundy na uruchomienie
   - Próbuje 5 razy sprawdzić czy się uruchomił
   
4. **Wykonuje zadanie**
   - Tryb manual: otwiera google.com + pokazuje listę akcji
   - Tryb auto: idzie na wp.pl i sprawdza tytuł
   - Tryb action: ładuje i wykonuje plik z actions/

## ✅ Zalety V2.0:

- **Dynamiczne akcje** - dodaj plik, masz nową komendę
- **Jeden skrypt** zamiast wielu komend
- **Inteligentne sprawdzanie** Chrome
- **Automatyczne uruchamianie** Chrome
- **Retry logic** - próbuje kilka razy
- **Lista dostępnych akcji** w trybie manual
- **Backward compatibility** - stare komendy dalej działają

## 🔄 Przykłady użycia:

### Nowy elastyczny sposób:
```bash
# Manual mode - pokaż dostępne akcje
npm run launch-chrome

# Wykonaj konkretną akcję
npm run launch-chrome -- --wp
npm run launch-chrome -- --linkedin

# Lub bezpośrednio
node cdp/smart-launcher.js --wp
node cdp/smart-launcher.js --linkedin manual  # można łączyć
```

### Stary sposób (nadal działa):
```bash
npm run old-launch-chrome  # Uruchom Chrome
npm run old-auto          # Połącz się
```

## 📋 Dostępne Akcje:

Smart Launcher automatycznie wykrywa pliki w folderze `actions/` i pokazuje je w trybie manual:

```
📋 Dostępne akcje:
   --wp
   --linkedin
```

## 📊 Status: ✅ GOTOWY DO UŻYCIA V2.0

**Maksymalna elastyczność** - dodaj plik akcji, masz nową komendę! 