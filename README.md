# Solar Storms to Auroras

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://exo-visionaries.vercel.app/)
[![NASA Space Apps 2025](https://img.shields.io/badge/NASA%20Space%20Apps-2025%20Global%20Finalist-blue)](https://www.spaceappschallenge.org/2025/find-a-team/exovisionaries/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **NASA Space Apps Challenge 2025 — Global Finalist (Top 45 Worldwide)**

An interactive space weather education platform that teaches children about solar storms, auroras, and heliophysics through storytelling, real-time NASA/NOAA data, 3D simulations, and gamified learning.

## Live Demo

**[https://exo-visionaries.vercel.app/](https://exo-visionaries.vercel.app/)**

> **Note:** This experience is optimized for **laptop and desktop** browsers. Mobile and tablet users will see a desktop-only notice.

## Problem Statement

Space weather affects satellites, power grids, astronauts, and everyday technology — yet it remains abstract and difficult for young learners to understand. We built a platform that turns complex heliophysics into an engaging, story-driven journey powered by real scientific data.

## Key Features

| Module | Route | Description |
|--------|-------|-------------|
| **Home** | `/` | Cinematic intro with Astronaut Stelly |
| **Story Journey** | `/start`, `/story2–4` | Progressive solar storm narrative with NASA imagery |
| **Aurora Lab** | `/aurora` | 3D Earth simulation with controllable aurora curtains & NASA DONKI data |
| **Aurora Forecast** | `/forecast` | Live aurora predictions with heatmaps & 24-hour animations |
| **K-Index Dashboard** | `/kindex` | Kid-friendly geomagnetic activity monitoring ("Space Mood") |
| **Electron Forecast** | `/electrons` | Radiation storm predictions & satellite safety data |
| **Quiz** | `/quiz` | Playful assessment with lifelines and educational feedback |
| **StormSafe** | `/stormsafe` | Find-the-shelter time-based challenge |
| **Space Defense** | `/space-defense` | Defend Earth from space threats |
| **AI Q&A** | `/ai-qa` | Space weather assistant *(temporarily offline — API quota expired)* |
| **Data Hub** | `/data` | NASA policy documents, research papers & resources |
| **Finale** | `/finale` | Achievement celebration & completion certificate |

## Screenshots

### Home & Story

| Home Page | Story Journey |
|:---:|:---:|
| ![Home Page](./public/Preview%20Images/home%20page.png) | *Story module preview coming soon* |

### Aurora Lab & Forecast

| Aurora Lab | Aurora Lab — Ground View |
|:---:|:---:|
| ![Aurora Lab](./public/Preview%20Images/Aurora%20Lab.png) | ![Aurora Lab Ground View](./public/Preview%20Images/aurora%20lab%20ground%20view%20from%20north%20pole.png) |

| Aurora Forecast |
|:---:|
| ![Aurora Forecast](./public/Preview%20Images/Aurora%20Forecast.png) |

### Live NOAA Dashboards

| K-Index — Space Mood | Electron Fluence Forecast |
|:---:|:---:|
| ![K-Index Dashboard](./public/Preview%20Images/Mood%20Meter%20of%20Sun-%20NOAA%20Space%20Weather%20Prediction%20Center.png) | ![Electron Forecast](./public/Preview%20Images/Live%20electron%20strom%20-%20NOAA%20Space%20Weather%20Prediction%20Center.png) |

### Quiz & Games

| Quiz | Space Defense |
|:---:|:---:|
| ![Quiz](./public/Preview%20Images/Quizes.png) | ![Space Defense](./public/Preview%20Images/Space%20defense%20game.png) |

| StormSafe & Mini-Games |
|:---:|
| ![Game 1](./public/Preview%20Images/game1.png) ![Game 2](./public/Preview%20Images/game2.png) ![Game 3](./public/Preview%20Images/game3.png) |
| ![Game 4](./public/Preview%20Images/game4.png) ![Game 5](./public/Preview%20Images/game5.png) ![Game 6](./public/Preview%20Images/game6.png) |

## Architecture

```mermaid
flowchart TB
    User([User Browser]) --> React[React + Vite App]
    React --> Router[React Router Pages]
    Router --> Story[Story and Quiz Modules]
    Router --> Games[Mini-Games]
    Router --> Dashboards[Live Data Dashboards]
    Router --> AuroraLab[Aurora Lab 3D]

    Dashboards --> NOAA[NOAA SWPC APIs]
    AuroraLab --> ThreeJS[Three.js / R3F]
    AuroraLab --> DONKI[NASA DONKI API]
    Router --> AI[AI Assistant]
    AI -.->|quota expired| Groq[Groq API]

    React --> Vercel[Vercel Deployment]
```

## Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Vite, React Router |
| **Styling** | Tailwind CSS 4 |
| **3D Graphics** | Three.js, React Three Fiber, @react-three/drei |
| **UI** | Radix UI, Lucide Icons, Lottie |
| **State** | Zustand |
| **Data** | NOAA SWPC JSON APIs, NASA DONKI |
| **AI** | Groq API (Llama models) — *currently disabled* |
| **Deployment** | Vercel |

## NASA and NOAA Data Sources

- **Aurora Forecast:** [NOAA Ovation Aurora Latest](https://services.swpc.noaa.gov/json/ovation_aurora_latest.json)
- **Aurora Animations:** [NOAA 24h Animations](https://services.swpc.noaa.gov/products/animations/)
- **K-Index:** [NOAA Boulder K-Index](https://services.swpc.noaa.gov/json/boulder_k_index_1m.json)
- **Electron Fluence:** [NOAA Electron Forecast](https://services.swpc.noaa.gov/json/electron_fluence_forecast.json)
- **NASA Images:** [nasa.gov/images](https://www.nasa.gov/images/)
- **NASA Science:** [science.nasa.gov](https://science.nasa.gov/)
- **Heliophysics Data:** [NASA Heliophysics Portal](https://science.nasa.gov/heliophysics/data/)

## Team — ExoVisionaries

**Institution:** Chittagong University of Engineering and Technology (CUET)  
**Organization:** Andromeda Space and Robotics Research Organisation (ASRRO)

| Member | Role |
|--------|------|
| **Jannatul Naeem Esmi** | Team Leader — Petroleum and Mining Engineering |
| **Shaoli Bose** | Team Member |
| **Priya Dev** | Team Member |
| **Md Habibullah Galib** | Team Member |
| **Asif Hasan** | Team Member — Computer Science and Engineering |

### Recognition and Press

- **[NASA Space Apps 2025 — Global Finalist (Top 45)](https://www.spaceappschallenge.org/2025/find-a-team/exovisionaries/)**
- [Kaler Kantho — CUET team reaches NASA global final](https://www.kalerkantho.com/online/campus-online/2025/11/27/1612014)

> From 1,290 global-stage teams, 45 teams worldwide advanced to the final round — including ExoVisionaries from Bangladesh.

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/asifhasan973/ExoVisionaries.git
cd ExoVisionaries
npm install
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

### Environment Variables (Optional)

Create a `.env` file in the project root:

```env
# Re-enable AI assistant when quota is available
VITE_AI_ENABLED=true
VITE_GROQ_API_KEY=gsk_your_key_here
```

## Project Structure

```
ExoVisionaries/
├── src/
│   ├── components/       # Reusable UI and 3D components
│   ├── pages/            # Route-level page components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API services (AI, etc.)
│   └── data/             # Static quiz and vocabulary data
├── public/
│   ├── aurora-lab/       # Standalone 3D Aurora Lab (Three.js)
│   ├── images/           # Story and game assets
│   └── videos/           # Background videos
├── LICENSE               # MIT License
└── vercel.json           # Deployment config
```

## Known Limitations

- **Desktop only:** 3D modules require laptop/desktop screen sizes
- **AI Assistant offline:** Groq API quota expired; static sample answers provided instead
- **Browser:** Best experienced on Chrome, Firefox, or Edge

## Future Improvements

- [ ] Re-enable AI assistant with renewed API quota
- [ ] Performance optimizations for Aurora Lab
- [ ] Accessibility improvements (keyboard nav, ARIA labels)

## License

This project is licensed under the [MIT License](LICENSE).

---

**Made with love by ExoVisionaries for space education**
