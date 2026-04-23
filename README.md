# Samaa — سماء 🌤️

A beautiful real-time weather app built with React. Search any city in the world and get live weather data with full Arabic and English language support.

---

## Preview

> Glassmorphism card UI · Bilingual (EN / AR) · RTL support · City autocomplete · 12-hour time format

---


## 🚀 Live Demo  
[![Live Demo](https://img.shields.io/badge/View%20Live-Vercel-blue?style=for-the-badge&logo=vercel)](https://samaa-app-ten.vercel.app/)

---


## Features

- **Real-time weather** — live data from the OpenWeatherMap API
- **City autocomplete** — suggestions dropdown as you type, powered by the Geocoding API
- **Bilingual** — full English and Arabic (عربي) support with one click
- **RTL layout** — the entire UI flips direction when Arabic is selected
- **Language persistence** — your language choice is saved in `localStorage`
- **Detailed stats** — temperature, feels like, min/max, humidity, wind speed & direction, pressure, visibility, cloud cover, sea level, sunrise & sunset
- **12-hour time format** — sunrise/sunset shown as `6:24 AM` / `7:11 PM`
- **Smooth UX** — card stays visible while fetching (no layout flash), error toast auto-dismisses after 3 seconds, keyboard navigation in suggestions (↑ ↓ Enter Esc)
- **Custom favicon & title** — SVG favicon with the Samaa brand, no default CRA assets

---

## Tech Stack

| | |
|---|---|
| Framework | React 18 |
| HTTP | Axios |
| Icons | react-icons (Bootstrap Icons, Ionicons, Tabler) |
| API | [OpenWeatherMap](https://openweathermap.org/api) — Current Weather + Geocoding |
| Styling | Plain CSS with glassmorphism, CSS animations, RTL |
| Deployment | Vercel |

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/samaa-weather.git
cd samaa-weather
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your API key

Open `src/component/Weather.jsx` and replace the key at the top:

```js
const APIKey = "your_openweathermap_api_key";
```

Get a free key at [openweathermap.org/api](https://openweathermap.org/api).

### 4. Run locally

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Build for Production

```bash
npm run build
```

Output goes to the `/build` folder, ready to deploy.

---

## Deploy to Vercel

The project includes a `vercel.json` config — just connect your GitHub repo on [vercel.com](https://vercel.com) and it deploys automatically on every push.

---

## Project Structure

```
src/
├── component/
│   ├── Weather.jsx      # Main weather component
│   └── weather.css      # All styles (glassmorphism, RTL, animations)
├── App.js
└── index.js
public/
├── favicon.svg          # Custom SVG favicon
├── index.html           # Updated title & meta
└── manifest.json        # PWA manifest with Samaa branding
```

---

## API Usage

This app uses two OpenWeatherMap endpoints:

- **Current Weather** — `api.openweathermap.org/data/2.5/weather`
- **Geocoding** (city suggestions) — `api.openweathermap.org/geo/1.0/direct`

The free tier is sufficient for personal use (60 calls/min).

---

## License

MIT

---

© 2026 Ahmed Mohamed. All rights reserved.
