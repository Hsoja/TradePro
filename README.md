# TradePro

**A modern landing page for a trading platform, with live market charts and a 3D animated background.**

TradePro is a front-end project for a fictional trading platform. It shows live market data with TradingView widgets, an animated 3D background built with Three.js, and a full set of pages: home, sign up, log in and terms.

## Features

- 📈 **Live market charts** for stocks, ETFs, crypto and forex (TradingView widgets)
- ✨ **3D animated background** built with Three.js
- 🧩 **Bento-style feature grid**, animated counters and scroll-in effects
- ❓ **FAQ section** and responsive layout for mobile and desktop
- 🔐 **Sign up, log in and terms pages** with shared layouts

## Tech stack

Astro · Three.js · JavaScript · HTML · CSS · TradingView widgets

## Project structure

```
src/
  layouts/   Base and Auth page layouts
  pages/     index, login, registro (sign up), terminos (terms)
  scripts/   bg.js (3D background) and tv.js (TradingView charts)
```

## Run it locally

Requires Node 22.12+.

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # production build in ./dist
```

## Note

This is a design and front-end project. It does not execute real trades or handle real money.

## Author

**Katherine Mauricio Gonzalez** — Software Engineering student at Conestoga College, Waterloo, ON.
