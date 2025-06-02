# 🧠 Smart Launcher - Inteligentny Launcher CDP z Payload Support

## ✨ FUNKCJONALNOŚĆ V3.0

**Inteligentny launcher** z obsługą payload z HTTP serwera dla n8n integration.

## 🚀 Jak używać:

### 🎯 Z HTTP Server (n8n integration):
```bash
# Serwer automatycznie wywołuje smart-launcher z payload
node common/server.js
# POST /run-script {"action": "linkedin", "payload": {"text": "Hello!"}}
```

### 🔧 Bezpośrednio z terminala:
```bash
node cdp/smart-launcher.js --wp          # akcja wp.js
node cdp/smart-launcher.js --linkedin    # akcja linkedin.js  
node cdp/smart-launcher.js --nazwa       # akcja nazwa.js
```

### 📦 Z payload (środowisko):
```bash
# Payload przekazywany przez zmienną środowiskową
N8N_PAYLOAD='{"text":"Hello World!"}' node cdp/smart-launcher.js --linkedin
```

## 📂 System Akcji:

### Struktura:
```
actions/
├── wp.js        # node cdp/smart-launcher.js --wp
├── linkedin.js  # node cdp/smart-launcher.js --linkedin
└── nazwa.js     # node cdp/smart-launcher.js --nazwa
```

### Format pliku akcji (z payload):
```javascript
// actions/moja-akcja.js
console.log('📦 Received payload:', JSON.stringify(payload, null, 2));

// Użyj payload
const text = payload.text || 'Default text';
const url = payload.url || 'https://example.com';

await page.goto(url);
console.log('🌐 Załadowano stronę');

await page.type('input[name="message"]', text);
console.log(`✍️ Napisano: ${text}`);

console.log('✅ Akcja zakończona');
```

## 🧠 Inteligentna logika:

1. **Odbiera payload** ze zmiennej środowiskowej `N8N_PAYLOAD`
   - Parsuje JSON payload
   - Udostępnia jako `payload` w akcji

2. **Parsuje argumenty**
   - `--nazwa` → ładuje `actions/nazwa.js`
   - Przekazuje payload do akcji

3. **Sprawdza Chrome** na porcie 9222
   - Sprawdza http://localhost:9222/json/version
   
4. **Uruchamia Chrome** jeśli nie działa
   - Używa argumentów z chrome-manager.js
   - Czeka na uruchomienie z retry logic
   
5. **Wykonuje akcję**
   - Ładuje plik z actions/
   - Przekazuje `page` i `payload` do akcji
   - Zwraca wynik

## ✅ Zalety V3.0:

- **Payload support** - dynamiczne dane z n8n
- **HTTP Server integration** - automatyczne wywołania
- **Environment variables** - bezpieczne przekazywanie danych
- **Szczegółowe logi** - pełna traceability
- **Queue system** - limit współbieżności
- **Error handling** - graceful failures
- **Cross-platform** - Windows/Linux support

## 🔄 Przykłady użycia:

### Z HTTP Server (główne użycie):
```json
POST /run-script
{
  "action": "linkedin",
  "payload": {
    "text": "Post z n8n! 🚀",
    "url": "https://linkedin.com"
  }
}
```

### Bezpośrednio z terminala:
```bash
# Bez payload
node cdp/smart-launcher.js --wp

# Z payload przez env
N8N_PAYLOAD='{"text":"Custom text"}' node cdp/smart-launcher.js --linkedin
```

## 📋 Dostępne Akcje:

Smart Launcher automatycznie wykrywa pliki w folderze `actions/`:

```bash
# Sprawdź dostępne akcje
curl http://localhost:3000/actions
```

## 🌐 Integracja z n8n:

1. **Setup SSH tunnel** do VPS
2. **Start HTTP server** `node common/server.js`
3. **Configure n8n** HTTP Request node
4. **Send requests** z payload do `/run-script`

## 📊 Status: ✅ GOTOWY DO UŻYCIA V3.0

**Pełna integracja z n8n** - HTTP server + payload support + queue system! 