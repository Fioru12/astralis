# ASTRALIS — Sicurezza e qualità

Documento aggiornato ad agosto 2026.

## Misure presenti

- Sanitizzazione dei valori inseriti in HTML tramite `escapeHtml()`.
- Validazione delle chiavi dei corpi lette dagli URL.
- Timeout e validazione di base per le risposte NASA.
- Link esterni aperti con `rel="noopener noreferrer"`.
- Service worker limitato alle richieste GET e alle risorse gestite dall'app.
- Nessuna credenziale privata inclusa nel repository.
- CI con lint, test e build.
- Audit delle dipendenze eseguito in CI e prima dei rilasci.
- Gestione del context loss WebGL e fallback delle texture.

## Superfici da trattare come non attendibili

- Parametri della query string.
- Risposte delle API NASA.
- Testi provenienti dai cataloghi JSON.
- Nomi personalizzati dei bookmark.
- URL e contenuti mostrati dai pannelli caricati dinamicamente.

I componenti che utilizzano `innerHTML` devono sanificare ogni valore dinamico. I template statici controllati dal progetto non richiedono escaping aggiuntivo.

## Limitazioni note

- Non è configurata una Content Security Policy. Non va dichiarata come presente finché non viene aggiunta tramite header del server di produzione o meta tag verificato.
- Gli header `X-Content-Type-Options`, `Referrer-Policy` e `Permissions-Policy` dipendono dal servizio di hosting e non sono garantiti dal repository.
- La chiave NASA dimostrativa è soggetta a rate limit; non è un segreto.
- Il service worker migliora la disponibilità offline ma non sostituisce versioning e header corretti del server.
- Il progetto non dispone ancora di monitoraggio remoto degli errori.

## Verifica prima del deploy

```bash
npm ci
npm run lint
npm test -- --run
npm run build
npm audit
```

Al 25 settembre 2026 `npm audit` (anche `--omit=dev`) riporta zero vulnerabilità con Vite 8, Vitest 4, ESLint 9, Sharp 0.35 e lint-staged 16. Il dato va sempre riconfermato con il comando precedente, perché il database degli advisory cambia nel tempo.

Sul servizio di hosting verificare inoltre:

- HTTPS e redirect da HTTP;
- CSP compatibile con Vite e con gli shader/template inline effettivamente usati;
- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy: strict-origin-when-cross-origin`;
- una `Permissions-Policy` coerente con l'eventuale uso di WebXR;
- cache immutabile per asset con hash e nessuna cache prolungata per `index.html`.

## Regola di manutenzione

Questo documento deve descrivere solo controlli verificabili nel repository o nell'ambiente di deploy. Risultati di `npm audit`, dimensioni della build e versioni “latest” non vanno fissati nel testo senza data e comando di verifica riproducibile.
