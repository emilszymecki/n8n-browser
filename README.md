# 🚀 Playwright Browser Connection

## 📁 Struktura Projektu

```
├── cdp/           # ✅ Metoda CDP (OPTYMALNA)
│   ├── smart-launcher.js  # 🧠 NOWY - Inteligentny launcher
│   ├── launch-chrome.js   # 🔧 Stary launcher Chrome
│   └── connect-only.js    # 🔗 Stary connector CDP
├── server/        # 🥷 Metoda Browser Server  
├── common/        # 📦 Wspólne komponenty
└── browser-data/  # 🍪 Dane przeglądarki
```

## 🎯 Dwie Metody Połączenia

### 1. 🔗 **CDP - Chrome DevTools Protocol** *(OPTYMALNE)*

**Prostota i niezawodność** - uruchom Chrome z debug portem.

#### 🧠 **NOWY - Smart Launcher** (ZALECANE):
```bash
npm run launch-chrome:auto   # Sprawdza Chrome + łączy się automatycznie
npm run launch-chrome:manual # Sprawdza Chrome + tryb ręczny
npm start                    # Alias dla auto mode
```

#### 🔧 **Stary sposób** (nadal działa):
```bash
npm run old-launch-chrome  # Uruchom Chrome z --remote-debugging-port=9222
npm run old-auto           # Połącz się przez CDP
```

📖 **Więcej:** [cdp/SMART-LAUNCHER.md](./cdp/SMART-LAUNCHER.md) | [cdp/README.md](./cdp/README.md)

### 2. 🖥️ **Browser Server** *(STEALTH)*

**Wyższa jakość i niewykrywalność** - Playwright Server.

```bash
npm run launch-server  # Uruchom Browser Server  
npm run connect        # Połącz się z serwerem
```

📖 **Więcej:** [server/README.md](./server/README.md)

## 🚀 Quick Start

**Smart Launcher (najnowszy):**
```bash
npm install
npm run launch-chrome:auto  # Robi wszystko za jednym razem!
```

**Metoda CDP (tradycyjna):**
```bash
npm install
npm run old-launch-chrome  # Uruchom Chrome
npm run old-auto           # Testuj połączenie
```

## 🎮 Dostępne Skrypty

### 🧠 Smart Launcher (NOWE - ZALECANE):
- `npm start` - smart launcher auto mode
- `npm run launch-chrome` - smart launcher auto mode (domyślnie)
- `npm run launch-chrome:auto` - inteligentny launcher + tryb auto  
- `npm run launch-chrome:manual` - inteligentny launcher + tryb ręczny

### 🔧 CDP Scripts (stare):
- `npm run old-launch-chrome` - uruchom Chrome z debug
- `npm run old-auto` - połącz się automatycznie  
- `npm run old-manual` - połącz się ręcznie (do logowania)

### Server Scripts:
- `npm run launch-server` - uruchom Browser Server
- `npm run connect` - połącz się z serwerem
- `npm run connect-manual` - połącz się ręcznie

### Common Scripts:
- `npm run server` - HTTP server dla n8n

## 🧠 Smart Launcher - Co robi?

1. **Sprawdza** czy Chrome już działa na porcie 9222
2. **Uruchamia Chrome** jeśli nie działa (z tymi samymi argumentami)
3. **Łączy się** przez CDP i wykonuje zadanie
4. **Retry logic** - próbuje kilka razy jeśli Chrome się uruchamia

**Zalety:** Jeden skrypt zamiast dwóch kroków, inteligentne sprawdzanie, automatyczne uruchamianie!

## 🍪 Persystencja Danych

Oba podejścia używają `browser-data/` do przechowywania:
- Cookies i sesje
- Ustawienia przeglądarki  
- Profile użytkownika

## 📊 Porównanie Metod

| **Smart Launcher** | **CDP** | **Browser Server** |
|---|---|---|
| 🧠 Najinteligentniejszy | ✅ Prostszy | 🥷 Bardziej stealth |
| 🚀 Jeden krok | 🔗 Port 9222 | 🔒 Dynamiczny WebSocket |
| ✅ Auto-sprawdzanie | 🛠️ Łatwe debugowanie | 🎭 Mniej wykrywalne |
| 🔄 Retry logic | 📊 Transparentny | ⚡ Wyższa jakość |

## 🎯 Zalecenia

- **Używaj Smart Launcher** - dla maksymalnej wygody (`npm run launch-chrome:auto`)
- **Używaj starego CDP** - jeśli potrzebujesz większej kontroli
- **Używaj Server** - gdy potrzebujesz stealth mode
- **Manual mode** - do logowania na platformy
- **Auto mode** - do automatyzacji

---

**Status:** 🧠 Smart Launcher ✅ GOTOWY | ✅ CDP działa idealnie | �� Server do testów 