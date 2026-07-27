# Bormio Trip App

Web app statica/PWA per la vacanza a Bormio dal 13 al 22 agosto 2026.

## Avvio locale

I moduli ES6 e il service worker richiedono un server HTTP:

```bash
python3 -m http.server 8080
```

Aprire `http://localhost:8080`.

## Pubblicazione GitHub Pages

1. Creare un repository e caricare tutti i file.
2. Settings → Pages → Deploy from a branch.
3. Scegliere `main` e cartella `/root`.

Nota: GitHub Pages rende il sito pubblico, anche quando il repository è privato. Per vera privacy serve un hosting con autenticazione lato server/edge (ad esempio Cloudflare Access) oppure non pubblicare il sito.

## Funzioni

- SPA con hash routing, robusta sugli hosting statici.
- PWA installabile su iPhone.
- Itinerario e schede dettagliate.
- Mappe Leaflet/OpenStreetMap.
- Apple Maps e Google Maps.
- Ricerca globale.
- Preferiti e checklist in LocalStorage.
- Dark mode automatica.

## Dati e immagini

Le immagini remote sono rappresentative. L’app prova prima i file locali indicati da `localAsset` e usa gli URL remoti come fallback. Per una vera esperienza offline, aggiungere immagini WebP nelle cartelle indicate dai dataset.

Orari, tariffe, parcheggi, accessi estivi e viabilità devono essere verificati sui siti ufficiali prima del viaggio.


## Restyling v2

La versione include una palette blu polvere/terracotta e immagini locali WebP per tutti i luoghi e ristoranti. Le immagini sono illustrazioni originali generate per il progetto e funzionano offline.


## Correzione GitHub Pages

Questa versione usa percorsi relativi (`./assets/...`) per tutte le immagini.
È quindi compatibile con un Project Site pubblicato sotto:

`https://USERNAME.github.io/NOME-REPOSITORY/`

Dopo l'aggiornamento:
1. sostituire tutti i file del repository;
2. fare commit;
3. attendere il completamento del deploy GitHub Pages;
4. su iPhone chiudere Safari o rimuovere e reinstallare la PWA, perché la vecchia versione può essere nella cache.


## Versione 3

- Rimossi i riferimenti ai costi.
- Ristoranti separati dalle singole giornate.
- Sezione Luoghi indipendente dalla proposta di pianificazione.
- Partenze normalmente previste tra le 10:00 e le 11:00.
- 14 agosto: Bormio 2000 al mattino e centro di Bormio verso sera.
- 20–21 agosto: proposta con pernottamento di una notte in Val Venosta.
- Il programma è esplicitamente presentato come modificabile.


## Versione 4 – fotografie reali

- Rimossi completamente Bagni Nuovi e Forte Venini.
- Il giorno delle terme è dedicato soltanto ai Bagni Vecchi.
- Le fotografie dei luoghi provengono da Wikimedia Commons.
- Le schede mostrano fonte e licenza delle fotografie.
- Le vecchie illustrazioni locali restano come fallback in caso di mancato caricamento.


## Versione 5 – guida Food

- Sezione Food riorganizzata con badge e filtri.
- Nessuna categoria colazione e nessun suggerimento associato ai giorni.
- Aggiunti Al Fiume, Al Filò, Osteria La Bajona, Osteria de I Magri ed Enoteca Guanella.
- Aggiunta mappa complessiva dei locali.
- Il badge “Da non perdere” è editoriale e non rappresenta una graduatoria numerica.


## Versione 6 – correzioni Home

- Corretto lo stile dei link usati come card.
- Ridisegnati i box Proposta di pianificazione e Preferiti.
- Migliorata la disposizione responsive delle statistiche iniziali.
- Aggiunti stati hover, focus e tap coerenti.
- Aggiornata la cache PWA.


## Versione 7 – schede guida turistica

- Rimossi tempo di visita e momento consigliato dalle schede dei luoghi.
- Mantenuti soltanto quota, tipologia di esperienza e categoria.
- Ampliate tutte le descrizioni con:
  - contesto e identità del luogo;
  - motivi per visitarlo;
  - elementi da osservare;
  - atmosfera e curiosità;
  - consigli pratici della guida.
