# 🖥️ Metoda Browser Server - Playwright Server

## 🥷 ALTERNATYWNE ROZWIĄZANIE

**Browser Server** - bardziej stealth, wyższa jakość połączenia.

## 🚀 Jak używać:

### 1. Uruchom Browser Server:
```bash
npm run launch-server
```

### 2. Połącz się z serwerem:
```bash
npm run connect        # Tryb automatyczny  
npm run connect-manual # Tryb ręczny (logowanie)
```

## 📁 Pliki:

- `launch-server.js` - uruchamia `chromium.launchServer()`
- `connect-server.js` - łączy się przez `chromium.connect(wsEndpoint)`
- `ws-endpoint.txt` - przechowuje WebSocket endpoint

## 🎯 Zalety:

- 🥷 **Stealth** - brak widocznego portu 9222
- 🔒 **Bezpieczeństwo** - dynamiczny WebSocket endpoint
- 🎭 **Niewykrywalność** - mniej oczywiste niż raw CDP
- ⚡ **Jakość** - wyższa jakość połączenia przez Playwright

## 🔄 Workflow:

1. `npm run launch-server` (uruchomi server + zapisze endpoint)
2. `npm run connect` (łączy się z zapisanym endpoint)
3. Server działa w tle, skrypty łączą się przez WebSocket

## ⚠️ Uwagi:

- Wymaga 2 kroków (launch → connect)
- Endpoint zapisywany w `ws-endpoint.txt`
- Bardziej zaawansowane niż raw CDP

## 📊 Status: 🔧 DO TESTÓW 