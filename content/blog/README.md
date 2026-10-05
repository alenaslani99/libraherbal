# Kako napisati blog objavu

Svaka objava je jedan `.md` fajl u ovom folderu. Ime fajla je adresa objave:
`kopriva-u-svakodnevnoj-ishrani.md` → `libraherbal.rs/blog/kopriva-u-svakodnevnoj-ishrani`
(mala slova, bez kvačica, reči spojene crticom).

Primer sa svim blokovima: `kopriva-u-svakodnevnoj-ishrani.md`.

## Zaglavlje (između `---` linija)

```yaml
---
title: Kopriva u svakodnevnoj ishrani
description: Kratak opis, 1–2 rečenice (prikazuje se ispod naslova i na Google-u).
date: 2026-10-05
author: Libra Herbal tim              # opciono
tags: [Ishrana, Saveti, Med]
image: /blog/kopriva-u-svakodnevnoj-ishrani.jpg
imageAlt: Šta se vidi na slici        # za slepe korisnike i Google
featured: true                        # opciono: velika kartica na vrhu /blog
products: [gvozdje-med, imuno-med]    # opciono: "Preporučeni proizvodi" (slug iz adrese proizvoda)
draft: true                           # opciono: objava je sakrivena dok ne obrišete ovu liniju
---
```

Slike stavite u `public/blog/` i navedite ih kao `/blog/ime-slike.jpg`.

## Tekst

```md
## Naslov sekcije
### Manji naslov

Običan pasus. **Podebljano**, *kurziv*, [link](/proizvodi).

> Citat: kurziv sa žutom linijom levo.

::note{title="Naslov napomene"}
Tekst u tamnozelenoj kutiji.
::

- stavka liste
- još jedna stavka

![Opis slike](/blog/slika.jpg)
```
