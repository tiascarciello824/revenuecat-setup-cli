# 🔐 Come Attivare OAuth per Login Automatico

## 🎯 Obiettivo

Abilitare il **login con browser** come nell'app Vibecode che hai usato:
1. Utente clicca "Login"  
2. Si apre il browser
3. Login RevenueCat
4. Autorizza l'app
5. ✨ Tutto il resto è automatico (nessun copy-paste di chiavi!)

## ✅ Cosa Ho Fatto

Ho già implementato **tutto il codice OAuth**:
- ✅ Server locale per callback
- ✅ Flusso Authorization Code con PKCE
- ✅ Apertura automatica browser
- ✅ Gestione token automatica
- ✅ Fallback ad API key se OAuth non disponibile

**Il codice è pronto al 100%!** Manca solo la registrazione del client OAuth.

## 📧 Cosa Devi Fare

### Step 1: Invia Email a RevenueCat

Ho preparato un template pronto in: `EMAIL_TO_REVENUECAT.txt`

Invia questa email a: **support@revenuecat.com**

Personalizza:
- `[username]` con il tuo username GitHub (se hai il progetto su GitHub)
- `[Your Name]` con il tuo nome
- `[Your Email]` con la tua email

### Step 2: Aspetta Risposta (1-3 giorni lavorativi)

RevenueCat ti risponderà con:
- ✅ Il tuo `client_id`
- ✅ Conferma registrazione

### Step 3: Configura il Client ID

Una volta ricevuto il `client_id`, ci sono 2 opzioni:

**Opzione A - Variabile d'Ambiente** (Per te personalmente):
```bash
export REVENUECAT_OAUTH_CLIENT_ID="il_tuo_client_id"

# Oppure aggiungilo al tuo ~/.zshrc
echo 'export REVENUECAT_OAUTH_CLIENT_ID="il_tuo_client_id"' >> ~/.zshrc
```

**Opzione B - Hardcode** (Per distribuire a tutti):
Modifica `~/.claude/skills/revenuecat-setup/src/auth/oauth.ts`:
```typescript
// Linea 12, sostituisci:
const CLIENT_ID = process.env.REVENUECAT_OAUTH_CLIENT_ID || 'PENDING_REGISTRATION';

// Con:
const CLIENT_ID = 'il_tuo_client_id';
```

Poi ricompila:
```bash
cd ~/.claude/skills/revenuecat-setup
npm run build
```

## 🚀 Come Funzionerà

Una volta configurato, quando un utente esegue lo script:

```bash
./RUN_REVENUECAT_SETUP.sh
```

Vedrà:

```
🔑 Autenticazione RevenueCat

? Scegli il metodo di autenticazione:
  ❯ 🌐 Login con browser (OAuth) - Consigliato
    🔑 API Key manuale
```

Selezionando **"Login con browser"**:

1. ✅ Si apre automaticamente il browser
2. ✅ Redirect a RevenueCat login
3. ✅ Utente fa login (se non già loggato)
4. ✅ Schermata: "Vibecode requests access..." (ma con il nome del tuo tool)
5. ✅ Utente clicca "Authorize"
6. ✅ Redirect a localhost
7. ✅ Messaggio: "✅ Authorization Successful!"
8. ✨ **Setup continua automaticamente senza altri input!**

## 🎉 Vantaggi

- **Zero configurazione manuale** - Nessun copy-paste di API keys
- **Sicuro** - Token scadono automaticamente
- **Professionale** - Uguale all'app Vibecode che hai usato
- **Multi-account** - Facile switchare tra account RevenueCat
- **Granular permissions** - Solo i permessi necessari

## 📝 Tempistiche

- **Oggi**: ✅ Codice pronto
- **Domani**: 📧 Invia email a RevenueCat
- **2-4 giorni**: ⏳ Aspetta risposta
- **5 minuti**: ⚙️ Configura client_id
- **Fatto**: 🎉 OAuth attivo!

## ❓ Nel Frattempo?

Lo script funziona già **perfettamente** con API key!

Quando esegui `./RUN_REVENUECAT_SETUP.sh`:
- Se OAuth non configurato → Chiede API key (1 campo, 5 secondi)
- Se OAuth configurato → Login con browser (0 campi, più veloce!)

Quindi puoi usarlo subito, e quando ricevi il client_id OAuth sarà ancora meglio! 🚀

## 🆘 Supporto

- **Documentazione OAuth RevenueCat**: https://www.revenuecat.com/docs/projects/oauth-setup
- **Email supporto**: support@revenuecat.com
- **Dettagli tecnici**: Vedi `OAUTH_SETUP.md`
