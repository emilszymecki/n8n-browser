# 🚀 Playwright Browser Connection

## 📁 Struktura Projektu

```
├── cdp/           # ✅ Metoda CDP (OPTYMALNA)
├── server/        # 🥷 Metoda Browser Server  
├── common/        # 📦 Wspólne komponenty
└── browser-data/  # 🍪 Dane przeglądarki
```

## 🎯 Dwie Metody Połączenia

### 1. 🔗 **CDP - Chrome DevTools Protocol** *(OPTYMALNE)*

**Prostota i niezawodność** - uruchom Chrome z debug portem.

```bash
npm run launch-chrome  # Uruchom Chrome z --remote-debugging-port=9222
npm run auto           # Połącz się przez CDP
```

📖 **Więcej:** [cdp/README.md](./cdp/README.md)

### 2. 🖥️ **Browser Server** *(STEALTH)*

**Wyższa jakość i niewykrywalność** - Playwright Server.

```bash
npm run launch-server  # Uruchom Browser Server  
npm run connect        # Połącz się z serwerem
```

📖 **Więcej:** [server/README.md](./server/README.md)

## 🚀 Quick Start

**Metoda CDP (zalecana):**
```bash
npm install
npm run launch-chrome  # Uruchom Chrome
npm run auto           # Testuj połączenie
```

## 🎮 Dostępne Skrypty

### CDP Scripts:
- `npm run launch-chrome` - uruchom Chrome z debug
- `npm run auto` - połącz się automatycznie  
- `npm run manual` - połącz się ręcznie (do logowania)

### Server Scripts:
- `npm run launch-server` - uruchom Browser Server
- `npm run connect` - połącz się z serwerem
- `npm run connect-manual` - połącz się ręcznie

### Common Scripts:
- `npm run server` - HTTP server dla n8n

## 🍪 Persystencja Danych

Oba podejścia używają `browser-data/` do przechowywania:
- Cookies i sesje
- Ustawienia przeglądarki  
- Profile użytkownika

## 📊 Porównanie Metod

| **CDP** | **Browser Server** |
|---|---|
| ✅ Prostsze | 🥷 Bardziej stealth |
| 🔗 Port 9222 | 🔒 Dynamiczny WebSocket |
| 🚀 Szybkie uruchomienie | ⚡ Wyższa jakość |
| 🛠️ Łatwe debugowanie | 🎭 Mniej wykrywalne |

## 🎯 Zalecenia

- **Używaj CDP** - dla prostoty i niezawodności
- **Używaj Server** - gdy potrzebujesz stealth mode
- **Manual mode** - do logowania na platformy
- **Auto mode** - do automatyzacji

---

**Status:** ✅ CDP działa idealnie | �� Server do testów 