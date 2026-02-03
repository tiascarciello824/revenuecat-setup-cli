# Analisi Automazione Skill RevenueCat

## 🎯 Obiettivo
Rendere la skill completamente automatica senza richiedere input dall'utente.

---

## ✅ Cosa SI PUÒ Automatizzare

### 1. **Bundle ID iOS & Package Name Android**

**Metodo**: Leggere automaticamente da `app.json` o `package.json`

```typescript
// Da app.json (Expo)
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.conserva.app"  // ✅ Auto-rilevabile
    },
    "android": {
      "package": "com.conserva.app"           // ✅ Auto-rilevabile
    }
  }
}
```

**PRO:**
- ✅ Zero input utente richiesto
- ✅ Sempre accurato (usa i dati del progetto reale)
- ✅ Nessun rischio di errori di digitazione
- ✅ Funziona per Expo e React Native CLI

**CONTRO:**
- ⚠️ Richiede che il comando sia eseguito nella directory del progetto
- ⚠️ Se i file di configurazione non esistono, fallisce
- ⚠️ Per React Native CLI, potrebbe dover cercare in `android/app/build.gradle` e `ios/[AppName].xcodeproj`

**RACCOMANDAZIONE**: ✅ **AUTOMATIZZARE**

---

### 2. **Nome Progetto/App**

**Metodo**: Leggere da `app.json` o `package.json`

```typescript
// Da app.json
{
  "expo": {
    "name": "Conserva"  // ✅ Auto-rilevabile
  }
}

// Da package.json
{
  "name": "conserva"  // ✅ Auto-rilevabile
}
```

**PRO:**
- ✅ Sempre disponibile nei progetti Expo/React Native
- ✅ Accurato
- ✅ Zero input necessario

**CONTRO:**
- ⚠️ Minimo (il nome potrebbe non essere "user-friendly", es. "myapp" vs "My App")

**RACCOMANDAZIONE**: ✅ **AUTOMATIZZARE** (con opzione di override)

---

### 3. **Tipo di Platform (Expo vs React Native CLI)**

**Metodo**: Rilevare automaticamente analizzando la struttura del progetto

```typescript
// Presenza di questi file indica:
- app.json con "expo" → Expo
- ios/Podfile e android/build.gradle → React Native CLI
- package.json con "expo" in dependencies → Expo
```

**PRO:**
- ✅ Facilmente rilevabile
- ✅ Accurato al 99%
- ✅ Zero input utente

**CONTRO:**
- ⚠️ Progetti ibridi potrebbero confondere il rilevamento

**RACCOMANDAZIONE**: ✅ **AUTOMATIZZARE**

---

### 4. **Backend Type (Supabase/Firebase/None)**

**Metodo**: Analizzare le dipendenze in `package.json`

```typescript
// Cerca in package.json dependencies:
- "@supabase/supabase-js" → Backend: Supabase
- "firebase" → Backend: Firebase
- Nessuno → Backend: None
```

**PRO:**
- ✅ Rilevamento automatico accurato
- ✅ Basato su dipendenze reali
- ✅ Zero configurazione

**CONTRO:**
- ⚠️ Se l'utente vuole usare Supabase ma non l'ha ancora installato, viene rilevato come "None"
- ⚠️ Se usa sia Supabase che Firebase, quale scegliere?

**RACCOMANDAZIONE**: ⚠️ **AUTOMATIZZARE con conferma intelligente**
- Rileva automaticamente
- Se ambiguo, chiedi conferma
- Se non trovato, proponi scelta rapida

---

### 5. **Configurazione Prodotti Standard**

**Metodo**: Usare preset intelligente basato su best practices

```typescript
// Default preset: Monthly + Annual (più comune)
const defaultProducts = [
  {
    id: "{app_prefix}_pro_monthly",
    displayName: "Pro Monthly",
    type: "subscription",
    duration: "monthly",
    trialPeriodDays: 7
  },
  {
    id: "{app_prefix}_pro_annual",
    displayName: "Pro Annual",
    type: "subscription",
    duration: "annual",
    trialPeriodDays: 7
  }
];
```

**PRO:**
- ✅ Copre il 90% dei casi d'uso
- ✅ Best practice pre-configurate
- ✅ Trial period di 7 giorni (standard Apple/Google)
- ✅ Zero configurazione per l'utente

**CONTRO:**
- ⚠️ Non personalizzabile senza modificare dopo
- ⚠️ Se l'utente vuole durate diverse (es. 3 mesi), non va bene

**RACCOMANDAZIONE**: ✅ **AUTOMATIZZARE** (con modalità avanzata opzionale)

---

### 6. **Entitlement ID**

**Metodo**: Usare convenzione standard "pro"

```typescript
const defaultEntitlement = {
  id: "pro",  // Standard de-facto
  displayName: "Pro Access",
  productIds: [/* tutti i prodotti */]
};
```

**PRO:**
- ✅ "pro" è lo standard de-facto nell'industria
- ✅ Funziona per 99% dei casi
- ✅ Semplice e chiaro

**CONTRO:**
- ⚠️ Se l'app ha più tier (basic, pro, premium), serve input

**RACCOMANDAZIONE**: ✅ **AUTOMATIZZARE** (single tier = "pro")

---

## ❌ Cosa NON SI PUÒ Automatizzare

### 1. **RevenueCat Secret API Key** ⛔

**Perché NON automatizzare:**
- 🔒 Credenziale sensibile
- 🔒 Unica per account
- 🔒 Non memorizzabile in modo sicuro
- 🔒 Non rilevabile dal progetto

**DEVE essere fornito dall'utente**

**Possibili approcci:**
1. **Prompt una sola volta** → salva in variabile di ambiente
2. **Leggi da .env se esiste** → richiedi solo se mancante
3. **Usa credential manager** → KeyChain (macOS), Windows Credential Store

**RACCOMANDAZIONE**: ⚠️ **Richiedi SEMPRE** (per sicurezza)

---

### 2. **RevenueCat Project ID** ⚠️

**Perché difficile automatizzare:**
- Non memorizzato nel progetto React Native
- Specifico di RevenueCat Dashboard
- Potrebbe non esistere ancora (nuovo progetto)

**Opzioni:**
1. **Chiedi all'utente** (semplice ma richiede input)
2. **Usa RevenueCat API per listare progetti** → l'utente sceglie
3. **Crea automaticamente un nuovo progetto** (se permessi API lo consentono)

**RACCOMANDAZIONE**: ⚠️ **Semi-automatico**
- Prova a recuperare lista progetti via API
- Se uno solo → usa automaticamente
- Se multipli → chiedi selezione rapida
- Se nessuno → guida creazione manuale

---

### 3. **Prezzi dei Prodotti** 💰

**Perché NON automatizzare:**
- Decisione di business
- Varia per mercato, strategia, competitor
- Non rilevabile dal codice

**RACCOMANDAZIONE**: ❌ **NON automatizzare**
- I prezzi si configurano in App Store Connect / Google Play Console
- Non gestibili via RevenueCat API
- Richiede decisione manuale dell'utente

---

## 🎯 Strategia di Automazione Ottimale

### Approccio a 3 Livelli

#### **Livello 1: Zero-Config Mode** (Completamente Automatico)

```typescript
// Esegui dalla directory del progetto:
/revenuecatsetup

// La skill:
1. ✅ Rileva automaticamente Bundle ID da app.json
2. ✅ Rileva automaticamente Package Name da app.json
3. ✅ Rileva automaticamente nome app
4. ✅ Rileva automaticamente platform (Expo/RN)
5. ✅ Rileva automaticamente backend (Supabase/Firebase)
6. ✅ Usa preset Standard (Monthly + Annual)
7. ✅ Crea entitlement "pro"
8. ⚠️ Chiede SOLO RevenueCat API Key (obbligatorio)
9. ⚠️ Chiede SOLO Project ID (se non rilevabile)
```

**Output:**
```bash
🚀 RevenueCat Setup - Zero Config Mode
📱 Progetto rilevato: Conserva
📦 Bundle ID: com.conserva.app
🤖 Package Name: com.conserva.app
⚡ Platform: Expo
🗄️ Backend: Supabase

✅ Configurazione automatica completata!
   - 2 prodotti creati (monthly, annual)
   - 1 entitlement (pro)
   - 1 offering (default)
   - Codice generato in: ./revenuecat-output-2026-02-01/
```

**PRO:**
- ⭐ Zero click per l'utente (eccetto API key)
- ⭐ Velocissimo (< 1 minuto)
- ⭐ Best practices automatiche
- ⭐ Perfetto per 90% dei casi

**CONTRO:**
- ⚠️ Meno flessibile
- ⚠️ Prodotti standard (non personalizzati)

---

#### **Livello 2: Smart Mode** (Semi-Automatico Intelligente)

```typescript
// Stessa automazione del Livello 1, MA:
// - Mostra preview della configurazione rilevata
// - Permette override rapido con "Y/N" prompt
```

**Output:**
```bash
🚀 RevenueCat Setup - Smart Mode
📱 Configurazione rilevata:

   App Name: Conserva
   Bundle ID: com.conserva.app
   Package Name: com.conserva.app
   Platform: Expo
   Backend: Supabase
   Products: Monthly + Annual (Standard)

✓ Confermi? (Y/n):
```

**PRO:**
- ⭐ Trasparente (utente vede cosa succede)
- ⭐ Veloce con opzione di modifica
- ⭐ Sicurezza di revisione

**CONTRO:**
- ⚠️ Richiede UN input (conferma)

---

#### **Livello 3: Interactive Mode** (Modalità Attuale)

```typescript
// Guida passo-passo con tutte le opzioni
// 10 step interattivi
```

**PRO:**
- ⭐ Massima flessibilità
- ⭐ Personalizzazione totale
- ⭐ Educativo per nuovi utenti

**CONTRO:**
- ⚠️ Richiede 5-10 minuti
- ⚠️ Molti input richiesti

---

## 💡 Implementazione Consigliata

### Modalità con Flag

```bash
# Zero-Config (completamente automatico)
/revenuecatsetup --auto

# Smart Mode (automatico con conferma)
/revenuecatsetup --smart

# Interactive Mode (default, attuale)
/revenuecatsetup
```

### Rilevamento Automatico Progetto

```typescript
// Auto-detect project configuration
function detectProjectConfig(): ProjectConfig {
  const cwd = process.cwd();

  // 1. Leggi app.json
  const appJson = JSON.parse(fs.readFileSync('app.json'));

  return {
    appName: appJson.expo?.name || appJson.name,
    bundleId: appJson.expo?.ios?.bundleIdentifier,
    packageName: appJson.expo?.android?.package,
    platform: appJson.expo ? 'expo' : 'react-native',
    backend: detectBackend(packageJson), // Analizza dependencies
  };
}

// Auto-detect backend
function detectBackend(packageJson: any): BackendType {
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

  if (deps['@supabase/supabase-js']) return 'supabase';
  if (deps['firebase']) return 'firebase';
  return 'none';
}
```

---

## 📊 Confronto Modalità

| Feature | Zero-Config | Smart | Interactive |
|---------|-------------|-------|-------------|
| **Velocità** | ⚡⚡⚡ < 1min | ⚡⚡ 1-2min | ⚡ 5-10min |
| **Input utente** | Solo API key | API key + 1 conferma | 10+ input |
| **Flessibilità** | ⭐ Bassa | ⭐⭐ Media | ⭐⭐⭐ Alta |
| **Errori possibili** | ⚠️ Se config non standard | ⚠️ Minimo | ✅ Zero |
| **Best per** | 90% casi | Utenti esperti | Prima volta |

---

## ✅ Raccomandazione Finale

### Implementa TUTTE E TRE le modalità:

1. **Default: Smart Mode** (`/revenuecatsetup`)
   - Rileva tutto automaticamente
   - Mostra preview
   - Chiede conferma con Y/n
   - Best balance tra velocità e sicurezza

2. **Flag: Zero-Config** (`/revenuecatsetup --auto`)
   - Per utenti che sanno cosa fanno
   - Massima velocità
   - Zero click (eccetto API key)

3. **Flag: Interactive** (`/revenuecatsetup --interactive`)
   - Per massima personalizzazione
   - Prima configurazione
   - Setup complessi

### Priorità di Input (dall'obbligatorio all'opzionale):

1. ⛔ **RevenueCat API Key** → SEMPRE richiesto (sicurezza)
2. ⚠️ **Project ID** → Auto se uno solo, chiedi se multipli
3. ✅ **Tutto il resto** → Auto-rilevato da file progetto

---

## 🎯 Vantaggi Approccio Multi-Modale

**PRO:**
- ✅ Soddisfa tutti gli utenti (principianti ed esperti)
- ✅ Velocità massima per casi standard
- ✅ Flessibilità per casi complessi
- ✅ Riduce errori (auto-detection)
- ✅ Migliore UX complessiva

**CONTRO:**
- ⚠️ Più codice da mantenere (3 modalità)
- ⚠️ Più testing richiesto

---

## 🚀 Prossimi Passi

1. **Implementa auto-detection** dei config file
2. **Aggiungi flag** `--auto` e `--smart`
3. **Testa** su progetti Expo e React Native CLI
4. **Documenta** le tre modalità
5. **Release** nuova versione con automazione

---

**Conclusione:**

✅ **SÌ, si può automatizzare il 90% del processo**

La chiave è:
- **Auto-rilevamento** intelligente da file di progetto
- **Preset** sensati per prodotti
- **Richiedi SOLO** ciò che è impossibile rilevare (API key, Project ID)

L'utente può passare da **10 input** a **1-2 input** mantenendo la stessa qualità di output.
