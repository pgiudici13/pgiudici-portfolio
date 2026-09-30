# Media pubblicati

Metti qui i tuoi file (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.avif`, `.mp4`, `.webm`, `.mov`, `.m4v`).

Non serve modificare `index.html`: il workflow GitHub Pages esegue `scripts/build-media-manifest.py`, aggiorna `manifest.json` e la galleria li mostra automaticamente.

## Modificare nome e descrizione

Apri `catalog.json` e aggiungi un oggetto per ogni file:

```json
[
  {
    "file": "pavia-alba.jpg",
    "title": "Alba sul Ticino",
    "description": "Una mattina silenziosa lungo il fiume a Pavia.",
    "category": "photography"
  }
]
```

`file` deve essere identico al nome del file dentro questa cartella. Dopo il push, titolo, descrizione e categoria saranno aggiornati nella galleria e nella sottopagina.

Usa nomi leggibili, per esempio:

- `pavia-alba.jpg`
- `cavalli-equestri-01.mp4`
- `ritratto-estate.webp`
