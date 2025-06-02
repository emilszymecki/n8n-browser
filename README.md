# N8N Browser Automation

System automatyzacji przeglądarki dla n8n przez SSH tunnel. Pozwala na zdalne sterowanie Chrome z lokalnej maszyny za NAT-em.

> 💡 **Autor hostuje na mikr.us**, ale system działa z każdym VPS z SSH.

## 🚀 Quick Start

### 1. Uruchom SSH Tunnel
```bash
ssh -R [REMOTE_PORT]:localhost:3000 -p [SSH_PORT] [USER]@[VPS_HOST] -N
```

### 2. Uruchom Serwer
```bash
npm run start_server
# lub bezpośrednio:
node common/server.js
```

### 3. Gotowe! 
Serwer dostępny na VPS: `http://[VPS_IP]:[REMOTE_PORT]/run-script`

## ⚙️ Konfiguracja SSH

W `/etc/ssh/sshd_config` na VPS ustaw:
```
GatewayPorts yes
```

Następnie zrestartuj SSH:
```bash
service ssh restart
```

## 📁 Struktura Akcji

Akcje znajdują się w folderze `actions/`:
- `wp.js` - przechodzi na wp.pl
- `linkedin.js` - publikuje post na LinkedIn

### Uruchamianie akcji lokalnie:
```bash
node cdp/smart-launcher.js --linkedin
node cdp/smart-launcher.js --wp
```

## 🌐 Użycie z n8n

### HTTP Request Node:
- **Method**: POST
- **URL**: `http://[VPS_IP]:[REMOTE_PORT]/run-script`
- **Headers**: `Content-Type: application/json`

### Przykłady Body:

**Podstawowa akcja:**
```json
{"action": "wp"}
```

**Akcja z payload:**
```json
{
  "action": "linkedin",
  "payload": {
    "text": "Mój tekst na LinkedIn! 🚀"
  }
}
```

### Workflow n8n:
Zaimportuj plik `n8n-script/workflow.json` do n8n i dostosuj URL.

## 📊 API Endpoints

- `GET /health` - status serwera
- `GET /actions` - lista dostępnych akcji  
- `GET /queue` - status kolejki zadań
- `POST /run-script` - wykonaj akcję

## 💡 Tworzenie Nowych Akcji

1. Stwórz plik `actions/nazwa_akcji.js`
2. Użyj Puppeteer syntax z `page` i `payload`
3. Uruchom: `node cdp/smart-launcher.js --nazwa_akcji`

### Przykład akcji:
```javascript
// Idź na stronę
await page.goto('https://example.com');

// Użyj payload
const text = payload.text || 'Default text';
await page.type('input[name="message"]', text);

console.log('✅ Akcja zakończona');
```

## 🔧 Architektura

```
n8n (VPS) → SSH Tunnel → Local Server → Chrome CDP → Actions
```

1. **n8n** wysyła HTTP request przez SSH tunnel
2. **Local Server** odbiera request i dodaje do kolejki
3. **Smart Launcher** uruchamia Chrome i wykonuje akcję
4. **Chrome CDP** kontroluje przeglądarkę
5. **Action** wykonuje konkretne zadanie

## 📝 Logi

System pokazuje szczegółowe logi:
- 📨 Otrzymane requesty
- 📦 Payload processing  
- 🎬 Wykonanie akcji
- ✅ Wyniki

---

**Gotowe!** System działa automatycznie z kolejką zadań i limitem współbieżności. 