# HANSZ

Linktree statis bertema brutalist terminal. Tanpa framework, tanpa build step,
tanpa dependency. HTML + CSS + JS murni.

## Isi

```
index.html   Struktur halaman + modal konfirm
style.css    Token, komponen, responsive
script.js    Dropdown, modal, rain canvas, shortcut keyboard
assets/      Foto profil & favicon
```

## Cara jalanin lokal

Buka `index.html` langsung di browser, atau pakai server statis:

```bash
npx serve .
```

## Shortcut keyboard

Tekan `1` sampai `4` untuk membuka link sesuai nomornya.

## Deploy

Repo ini statis, jadi bisa langsung di-host di mana saja.

**Vercel**

```bash
npm i -g vercel
vercel
vercel --prod
```

**GitHub Pages**

```bash
git branch gh-pages
git push origin gh-pages
```

## Originally by

HANSZ
