# Guida al Deploy di Astralis

## Opzione 1: Netlify (Consigliata - 30 secondi)

### Metodo A: Drag & Drop
1. Esegui `build.bat` o `npm run build`
2. Apri https://app.netlify.com/drop
3. Trascina la cartella `dist/` sulla pagina
4. Fatto! Il sito e online

### Metodo B: Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

---

## Opzione 2: GitHub Pages (CI/CD automatico)

### 1. Crea repository su GitHub
- Vai su https://github.com/new
- Nome: `astralis` (o quello che preferisci)
- Visibilita: Public
- NON inizializzare con README

### 2. Collega il progetto locale
```bash
cd c:\Progetti\Solar-System
git remote add origin https://github.com/TUO-USERNAME/astralis.git
git branch -M main
git push -u origin main
```

### 3. Attiva GitHub Pages
- Vai su https://github.com/TUO-USERNAME/astralis/settings/pages
- Source: GitHub Actions
- Salva

### 4. Crea il workflow file
```bash
mkdir .github\workflows
copy CI_WORKFLOW.yml .github\workflows\ci.yml
git add .github
git commit -m "Add GitHub Actions workflow"
git push
```

### 5. Attendi 2-3 minuti
- Vai su https://github.com/TUO-USERNAME/astralis/actions
- Vedrai il workflow in esecuzione
- Quando e verde, il sito e online!

URL finale: `https://TUO-USERNAME.github.io/astralis/`

---

## Opzione 3: Vercel

```bash
npm install -g vercel
cd c:\Progetti\Solar-System
vercel login
vercel --prod
```

Vercel riconosce Vite automaticamente.

URL finale: `https://astralis.vercel.app`

---

## Opzione 4: Cloudflare Pages

1. Pusha il codice su GitHub (vedi opzione 2, step 1-2)
2. Vai su https://pages.cloudflare.com
3. Click "Create a project" -> "Connect to Git"
4. Seleziona il repository
5. Build settings:
   - Build command: `npm run build`
   - Build output: `dist`
6. Click "Save and Deploy"

---

## Dominio Personalizzato

Tutte le piattaforme supportano domini custom gratuiti:

### Esempio: `astralis-explorer.com` (10-15 euro/anno)

1. **Compra il dominio** su:
   - Namecheap (consigliato, ~10 euro/anno)
   - Google Domains
   - Cloudflare Registrar

2. **Configura DNS**:
   - Per Netlify: aggiungi CNAME `www` -> `tuosito.netlify.app`
   - Per Vercel: aggiungi CNAME `www` -> `cname.vercel-dns.com`
   - Per GitHub Pages: aggiungi CNAME `www` -> `TUO-USERNAME.github.io`

3. **Abilita HTTPS** (automatico con Let's Encrypt)

---

## Script Automatico

Ho creato `deploy.ps1` per automatizzare il processo:

```powershell
# Netlify drag & drop
.\deploy.ps1 -Platform netlify

# Vercel CLI
.\deploy.ps1 -Platform vercel

# GitHub Pages setup
.\deploy.ps1 -Platform github
```

---

## Test Pre-Deploy

Prima di deployare, verifica:

```bash
# 1. Build pulito
npm run build

# 2. Test locale della build
npm run preview

# 3. Audit sicurezza
npm audit

# 4. Lint
npm run lint
```

---

## Checklist Finale

- [x] `npm audit` -> 0 vulnerabilita
- [x] `npm run build` -> successo in <1s
- [x] `dist/index.html` generato
- [x] `dist/manifest.json` presente
- [x] `dist/sw.js` presente
- [x] Tutti i chunk JS generati
- [ ] Dominio configurato (opzionale)
- [ ] HTTPS abilitato (automatico)

---

## Troubleshooting

### Sito mostra pagina bianca
- Apri DevTools -> Console
- Verifica errori 404 sui file
- Controlla che `base` in `vite.config.js` sia `./` (gia configurato)

### Service Worker non funziona
- Apri DevTools -> Application -> Service Workers
- Verifica che `sw.js` sia servito
- Ricarica con Ctrl+Shift+R (hard refresh)

### Texture non caricano
- Verifica che `assets/textures/` sia in `dist/`
- Controlla la cache del browser
- Apri DevTools -> Network e cerca 404

---

## Link Utili

- **Netlify**: https://app.netlify.com
- **Vercel**: https://vercel.com
- **Cloudflare Pages**: https://pages.cloudflare.com
- **GitHub Pages**: https://pages.github.com
- **Namecheap** (domini): https://namecheap.com
