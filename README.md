<div align="center">

<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png" width="120" alt="Venusaur" />

# Pokédex — Field Guide

**A cinematic, editorial-style Pokédex built with vanilla HTML, CSS & JS**

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-mikedmart.github.io-4caf50?style=for-the-badge)](https://mikedmart.github.io/PokeData/)
[![PokéAPI](https://img.shields.io/badge/Data-PokéAPI-ef5350?style=for-the-badge)](https://pokeapi.co)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

</div>

## ✨ Features

| Feature | Details |
|---|---|
| 🎭 **Cinematic Pokéball Transition** | Custom CSS/JS animation — Pokémon shrinks into the ball, ball shakes 2× with particles, new Pokémon bursts out |
| 🌗 **Dark / Light Mode** | Persists across sessions via localStorage |
| 🎨 **Dynamic Type Theming** | Background, accent color, and stat bars all adapt to the Pokémon's primary type |
| ✦ **Shiny Toggle** | Switch between normal and shiny official artwork |
| 🕹️ **Animated Gen-V Sprites** | Pixel-art GIF badge showing the Pokémon in motion |
| 🔊 **Pokémon Cries** | Plays the official cry from the API on each load |
| 🎵 **8-bit Chiptune** | Ambient music generated with the Web Audio API (no files needed) |
| 🔇 **Mute Toggle** | Silences all audio, persists across sessions |
| 🔀 **Random** | Loads any of the 1,025 Pokémon instantly |
| 🕐 **Recent History** | Last 10 Pokémon remembered across sessions |
| 📐 **Viewport-Fit Layout** | No page scroll — content fits the screen at any size |

---

## 🖼️ Preview

> Search any Pokémon by name or National Pokédex number.
> The page adapts its color palette, plays the cry, and transitions via a custom pokéball animation.

```
Pikachu → Electric yellow theme
Gengar  → Ghost purple theme  
Charizard → Fire red theme
```

---

## 🛠️ Tech Stack

**Zero dependencies. No frameworks. No build step.**

- **HTML5** — semantic markup, single-page structure
- **CSS3** — CSS custom properties, Grid, viewport units, keyframe animations
- **Vanilla JS** — async/await, Fetch API, Canvas API for particles
- **Web Audio API** — Pokémon cries decoded from audio buffers + procedural chiptune
- **PokéAPI** — REST API for all Pokémon data, sprites, cries and species info
- **GitHub Pages** — deployed via CI/CD on every push to `main`

---

## 🚀 Run Locally

```bash
# Clone
git clone https://github.com/MikeDMart/PokeData.git
cd PokeData

# Serve (any static server works)
npx serve .
# → open http://localhost:3000
```

Or open in GitHub Codespaces — zero setup required.

---

## 📁 Structure

```
PokeData/
├── index.html   # Single-page app shell
├── style.css    # All styles — layout, animations, themes
└── app.js       # All logic — API, animations, audio, state
```

---

## 🎮 Keyboard Shortcuts

| Key | Action |
|---|---|
| `/` | Focus search |
| `Escape` | Blur search |

---

## 📡 API Used

All data comes from **[PokéAPI](https://pokeapi.co)** — a free, open REST API with no authentication required.

Endpoints used:
- `GET /api/v2/pokemon/{name}` — stats, sprites, types, abilities, moves, cries
- `GET /api/v2/pokemon-species/{name}` — flavor text, genus

---

<div align="center">

Made with ♥ by [MikeDMart](https://github.com/MikeDMart)

Data from [PokéAPI](https://pokeapi.co) · Artwork © The Pokémon Company

</div>
