# 🔗 Metoda CDP - Chrome DevTools Protocol

## ✅ OPTYMALNE ROZWIĄZANIE

**Raw CDP** - najprostsza i najbardziej niezawodna metoda.

## 🚀 Jak używać:

### 1. Uruchom Chrome z debug portem:
```bash
npm run launch-chrome
```

### 2. Połącz się przez CDP:
```bash
npm run auto     # Tryb automatyczny
npm run manual   # Tryb ręczny (logowanie)
```

## 📁 Pliki:

- `launch-chrome.js` - uruchamia Chrome z `--remote-debugging-port=9222`
- `connect-only.js` - łączy się przez `chromium.connectOverCDP()`

## 🎯 Zalety:

- ✅ **Prostota** - 2 kroki, działa od razu
- ✅ **Stabilność** - Chrome działa niezależnie  
- ✅ **Kontrola** - Port 9222, łatwe debugowanie
- ✅ **Transparentność** - http://localhost:9222

## 🔄 Workflow:

1. `npm run launch-chrome` (raz)
2. `npm run auto` (wielokrotnie)
3. Chrome działa w tle, skrypty się łączą/rozłączają

## 📊 Status: ✅ DZIAŁA IDEALNIE 