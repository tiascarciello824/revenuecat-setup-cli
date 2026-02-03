# Guida Modalità Smart - RevenueCat Setup CLI

## 🚀 Cos'è la Modalità Smart?

La **Modalità Smart** è il modo più veloce per configurare RevenueCat nel tuo progetto React Native/Expo.

**Auto-rileva automaticamente:**
- ✅ Nome dell'app
- ✅ iOS Bundle ID
- ✅ Android Package Name
- ✅ Platform (Expo/React Native CLI)
- ✅ Backend (Supabase/Firebase/None)

**Richiede solo:**
- 🔑 RevenueCat API Key (obbligatorio)
- ✓ Conferma configurazione (1 click)

**Risultato:**
- ⚡ Setup completo in **< 1 minuto**
- 📦 Codice di integrazione pronto per produzione
- 📝 Documentazione completa generata automaticamente

---

## 📊 Confronto Modalità

| Feature | Smart Mode | Interactive Mode |
|---------|-----------|------------------|
| **Tempo** | < 1 minuto | 5-10 minuti |
| **Input richiesti** | 2 (API key + conferma) | 10+ prompt |
| **Auto-detection** | ✅ Sì | ❌ No |
| **Preset prodotti** | ✅ Standard (Monthly + Annual) | 🎛️ Personalizzabile |
| **Best per** | 90% dei casi | Setup complessi |

---

## 🎯 Come Usare la Modalità Smart

### Opzione 1: Via Slash Command (Claude Code)

```bash
/revenuecatsetup
```

La modalità smart è quella **di default**!

### Opzione 2: Via Command Line

```bash
cd /path/to/your/react-native-project
npx revenuecat-setup-cli --smart
```

### Opzione 3: Se Installato Globalmente

```bash
cd /path/to/your/react-native-project
revenuecat-setup --smart
```

---

## 📋 Workflow Step-by-Step

### Step 1: Auto-Detection
```
🚀 RevenueCat Setup - Smart Mode
ℹ Rilevamento automatico della configurazione...

📱 Configurazione Rilevata
ℹ Nome App: Conserva
ℹ Bundle ID iOS: com.conserva.app
  Fonte: app.json (expo.ios.bundleIdentifier)
ℹ Package Name Android: com.conserva.app
  Fonte: app.json (expo.android.package)
ℹ Platform: expo
ℹ Backend: supabase
```

### Step 2: API Key
```
🔑 Autenticazione RevenueCat
? Inserisci RevenueCat Secret API Key: ••••••••••••••
✓ API key validata
```

### Step 3: Preview & Conferma
```
📋 Configurazione Proposta

App:
  Nome: Conserva
  Bundle ID: com.conserva.app
  Package Name: com.conserva.app
  Platform: expo
  Backend: supabase

Prodotti (preset Standard):
  • conserva_pro_monthly - Pro Monthly (7 giorni trial)
  • conserva_pro_annual - Pro Annual (7 giorni trial)

Entitlement:
  • pro - Pro Access

Offering:
  • default (current) - Monthly + Annual packages

File che saranno generati:
  • lib/services/revenuecat.ts
  • store/subscriptionStore.ts
  • types/subscription.ts
  • .env.template
  • supabase/functions/handle-revenuecat-webhook/index.ts
  • lib/supabase/subscriptions.sql
  • REVENUECAT_SETUP_GUIDE.md

? Confermi questa configurazione? (Y/n)
```

### Step 4: Project ID (Auto o Manuale)
```
🏗️  RevenueCat Project
✓ Progetto rilevato automaticamente: Conserva App

oppure (se multipli):

? Seleziona il progetto RevenueCat:
  > Conserva App (project_abc123)
    My Other App (project_xyz789)
```

### Step 5: Creazione Automatica
```
⚙️  Creazione in RevenueCat
✓ Creati 2 prodotti
✓ Creati 1 entitlement(s)
✓ Creati 1 offering(s)
```

### Step 6: Generazione Codice
```
📝 Generazione Codice
✓ Generati 7 file(s)
```

### Step 7: Completamento
```
✅ Setup Completato!
Directory output: ./revenuecat-output-2026-02-01

📄 File Generati:
  ✓ lib/services/revenuecat.ts
  ✓ store/subscriptionStore.ts
  ✓ types/subscription.ts
  ✓ .env.template
  ✓ supabase/functions/handle-revenuecat-webhook/index.ts
  ✓ lib/supabase/subscriptions.sql
  ✓ REVENUECAT_SETUP_GUIDE.md

📋 Prossimi Passi:
1. Copia i file generati nel tuo progetto
2. Configura App Store Connect (iOS)
3. Configura Google Play Console (Android)
4. Collega gli store a RevenueCat Dashboard
5. Esegui la migrazione SQL in Supabase
6. Deploya la funzione webhook
7. Testa gli acquisti in sandbox
```

---

## 🔍 Cosa Viene Auto-Rilevato?

### 1. Da `app.json` (Progetti Expo)

```json
{
  "expo": {
    "name": "Conserva",                          // → App Name
    "ios": {
      "bundleIdentifier": "com.conserva.app"     // → iOS Bundle ID
    },
    "android": {
      "package": "com.conserva.app"              // → Android Package
    }
  }
}
```

### 2. Da `package.json`

```json
{
  "name": "conserva",                            // → App Name (fallback)
  "dependencies": {
    "expo": "^50.0.0",                          // → Platform: Expo
    "@supabase/supabase-js": "^2.0.0"          // → Backend: Supabase
  }
}
```

### 3. Da File Nativi (React Native CLI)

**Android** (`android/app/build.gradle`):
```gradle
applicationId "com.conserva.app"               // → Android Package
```

**iOS** (`ios/[AppName].xcodeproj/project.pbxproj`):
```
PRODUCT_BUNDLE_IDENTIFIER = com.conserva.app;  // → iOS Bundle ID
```

---

## ⚙️ Configurazione Standard Generata

### Prodotti Creati

La modalità smart crea automaticamente 2 prodotti:

1. **Monthly Subscription**
   - ID: `{app_prefix}_pro_monthly`
   - Tipo: subscription
   - Durata: monthly
   - Trial: 7 giorni

2. **Annual Subscription**
   - ID: `{app_prefix}_pro_annual`
   - Tipo: subscription
   - Durata: annual
   - Trial: 7 giorni

**Esempio** (per app "Conserva"):
- `conserva_pro_monthly`
- `conserva_pro_annual`

### Entitlement

- **ID**: `pro`
- **Nome**: Pro Access
- **Prodotti**: Entrambi monthly e annual

### Offering

- **ID**: `default`
- **Current**: Sì
- **Packages**:
  - Monthly package → `conserva_pro_monthly`
  - Annual package → `conserva_pro_annual`

---

## 🛠️ Personalizzazione

### Quando Usare la Modalità Interactive

Usa `--interactive` se hai bisogno di:

- ❌ Più di 2 prodotti
- ❌ Prodotti lifetime/consumable
- ❌ Trial period diverso da 7 giorni
- ❌ Entitlement multipli (basic, pro, premium)
- ❌ Custom package configuration

```bash
npx revenuecat-setup-cli --interactive
```

### Come Modificare Dopo

Se hai usato Smart Mode ma vuoi modificare:

1. **Re-esegui in modalità interactive**:
   ```bash
   npx revenuecat-setup-cli --interactive
   ```
   I prodotti esistenti verranno saltati (409 conflict)

2. **Modifica manualmente** nel RevenueCat Dashboard

3. **Modifica i file generati** direttamente

---

## 📦 Requisiti

### Struttura Progetto Richiesta

La modalità smart funziona meglio se eseguita dalla **root del progetto** React Native/Expo.

**Expo:**
```
/your-project/
├── app.json          ✅ Richiesto
├── package.json      ✅ Richiesto
├── app/
└── ...
```

**React Native CLI:**
```
/your-project/
├── package.json      ✅ Richiesto
├── android/
│   └── app/
│       └── build.gradle  ✅ Per auto-detect Android
├── ios/
│   └── [AppName].xcodeproj/  ✅ Per auto-detect iOS
└── ...
```

---

## ❗ Troubleshooting

### "Rilevamento automatico incompleto"

**Causa**: File di configurazione mancanti o malformati

**Soluzione**: La skill chiederà le informazioni mancanti manualmente

### "API key non valida"

**Causa**: API key errata o scaduta

**Soluzione**: Verifica di usare il **Secret API Key** (non Public Key)
- Dashboard → Project Settings → API Keys

### "Impossibile recuperare progetti"

**Causa**: Problemi di rete o permessi API

**Soluzione**: Inserisci Project ID manualmente quando richiesto

### "Product already exists (409)"

**Causa**: Prodotti già creati in una esecuzione precedente

**Soluzione**: Normale! La skill li salta automaticamente

---

## 🎯 Best Practices

### 1. Esegui dalla Directory del Progetto

```bash
cd /path/to/your/react-native-project  # ✅ Corretto
npx revenuecat-setup-cli --smart

# ❌ Evita di eseguire da altre directory
```

### 2. Verifica app.json Prima

```bash
cat app.json  # Controlla che bundleIdentifier e package siano corretti
```

### 3. Prepara l'API Key

Apri https://app.revenuecat.com in un altro tab prima di iniziare

### 4. Crea Prima il Progetto RevenueCat

Se non hai ancora un progetto:
1. Vai su https://app.revenuecat.com
2. Crea nuovo progetto
3. Poi esegui la skill

---

## 📊 Statistiche Velocità

| Operazione | Tempo |
|-----------|-------|
| Auto-detection | ~1 secondo |
| API key validation | ~1-2 secondi |
| Preview & conferma | 5-10 secondi |
| Project ID retrieval | ~1-2 secondi |
| API automation (create) | ~5-10 secondi |
| Code generation | ~1-2 secondi |
| **TOTALE** | **< 1 minuto** |

vs Interactive Mode: **5-10 minuti**

**Risparmio**: **80-90% del tempo** ⚡

---

## ✅ Quando Usare Smart Mode

✅ **USA Smart Mode SE:**
- Hai un progetto Expo o React Native standard
- Vuoi setup Monthly + Annual subscriptions
- Vuoi 7 giorni di trial
- Non hai requisiti speciali
- Vuoi il setup più veloce possibile
- È la prima volta che configuri RevenueCat

❌ **USA Interactive Mode SE:**
- Hai bisogno di prodotti custom (lifetime, consumable)
- Vuoi trial period diverso
- Hai entitlement multipli
- Hai requisiti di business specifici
- Vuoi controllo totale su ogni opzione

---

## 🆘 Supporto

Se riscontri problemi:

1. **Verifica** che i file di configurazione siano corretti
2. **Leggi** i messaggi di errore (sono descrittivi)
3. **Usa** `--interactive` come fallback
4. **Controlla** la documentazione generata in `REVENUECAT_SETUP_GUIDE.md`

---

## 📝 Changelog Smart Mode

### v1.0.0 (2026-02-01)
- ✨ Prima release della modalità smart
- ✅ Auto-detection da app.json e package.json
- ✅ Auto-detection da file nativi Android/iOS
- ✅ Preset standard (Monthly + Annual)
- ✅ Preview configurazione prima di eseguire
- ✅ Auto-recupero Project ID se singolo
- ✅ Gestione errori intelligente con fallback

---

**Smart Mode = Setup RevenueCat in < 1 minuto! ⚡**
