# Ottimizzazione texture

## Stato attuale

Le 12 texture sorgente in `assets/textures/` occupano circa 7,8 MB. La versione distribuita usa esclusivamente i file WebP in `assets/textures/optimized/`, circa 2,05 MB complessivi: una riduzione del 74% senza cambiare i nomi logici dei corpi.

La build Vite copia soltanto gli asset WebP ottimizzati. Le sorgenti JPG/PNG restano nel repository per poter rigenerare gli asset, ma non vengono incluse in `dist`.

## Rigenerazione

```bash
npm run convert-textures
```

Lo script `convert_textures.js`:

- legge JPG, JPEG e PNG dalla cartella sorgente;
- ridimensiona ogni immagine a un massimo di 2048 px senza ingrandire file piccoli;
- esporta WebP con qualità 82;
- attende il completamento di tutti i file e restituisce un codice di errore se una conversione fallisce.

Dopo la conversione eseguire sempre:

```bash
npm run lint
npm test -- --run
npm run build
```

## Garanzie automatiche

I test verificano che ogni texture dichiarata per pianeti e lune:

- punti a un file `.webp`;
- esista realmente nel repository.

Il plugin di build in `vite.config.js` copia solo la cartella `optimized` e ignora i formati sorgente.

## Sviluppi futuri

WebP riduce il download ma, una volta decodificato, occupa comunque memoria GPU. Il passo successivo utile sui dispositivi meno potenti è una pipeline KTX2/Basis con mipmap e profili di qualità diversi. Va introdotta insieme a misurazioni su dispositivi reali: aggiungerla senza benchmark aumenterebbe complessità e compatibilità da mantenere senza un beneficio dimostrato.

## Stato KTX2/Basis (settembre 2026)

Il transcoder GPU non è incluso nel bundle. `src/utils/textureLoader.js` gestisce già
il percorso di migrazione: le richieste `.ktx2`/`.basis` vengono riscritte sul WebP
equivalente (stessa cache key) e, in mancanza, scatta il fallback procedurale. Quando
la pipeline verrà aggiunta, basterà registrare il `KTX2Loader` nel texture loader
senza cambiare i chiamanti. Test: `src/utils/textureLoader.test.js`.

## Nota `milky_way_topdown` (settembre 2026)

`public/milky_way_topdown.jpg` (823 KB) ora ha un equivalente
`public/milky_way_topdown.webp` (~100 KB, 2048 px, qualità 80). `spiralGalaxy.js` e
`galaxyModal.js` caricano il WebP con fallback automatico al JPG per i browser
datati. Il JPG resta in `public/` solo come fallback.
