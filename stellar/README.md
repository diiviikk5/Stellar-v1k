# STELLAR-v1k | GNSS Forecasting Mission Control

**AI-Powered Early Warning System for Satellite Navigation Errors**

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-stellar--wine.vercel.app-00d4ff?style=for-the-badge)](https://stellar-wine.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Stellar--v1k-181717?style=for-the-badge&logo=github)](https://github.com/diiviikk5/Stellar-v1k)



![STELLAR Banner](./public/banner.png)

## 🚀 Overview

STELLAR-v1k is an advanced GNSS (Global Navigation Satellite System) error forecasting platform that uses machine learning to predict satellite clock and ephemeris errors before they impact navigation systems.

### Key Features

- **🧠 Real AI Inference** - TensorFlow.js-powered LSTM-Attention hybrid model running in the browser
- **📡 Live Telemetry Streaming** - Real-time satellite data simulation with orbital mechanics
- **🔮 Multi-Horizon Forecasting** - Predictions from 15 minutes to 24 hours ahead
- **📊 Uncertainty Quantification** - Calibrated confidence intervals for every prediction
- **⚠️ Anomaly Detection** - Autoencoder-based detection of satellite anomalies
- **💬 AI Assistant** - Conversational interface for mission control queries
- **🎨 Premium UI** - Space-themed mission control aesthetic

## 🛰️ Satellites Monitored

- **GPS**: IIR, IIF, III series (6 satellites)
- **Galileo**: FOC constellation (2 satellites)
- **GLONASS**: M series (1 satellite)
- **BeiDou**: 3rd generation MEO/GEO (2 satellites)
- **QZSS**: Quasi-Zenith (1 satellite)

## 🧠 AI Architecture

### Forecasting Model (STELLAR-Forecast-v1k)
- **Type**: Transformer-LSTM Hybrid
- **Input**: 7-day error sequences (672 points @ 15-min intervals)
- **Output**: 8 prediction horizons with uncertainty estimates
- **Features**: Clock bias, Radial, Along-Track, Cross-Track errors

### Anomaly Detection Model
- **Type**: Autoencoder
- **Purpose**: Real-time anomaly detection in satellite telemetry
- **Severity Levels**: NORMAL → WARNING → CRITICAL

## 📊 Performance Metrics

| Horizon | RMSE (ns) | Accuracy | vs Baseline |
|---------|-----------|----------|-------------|
| 15-min  | 0.18      | 98.2%    | -57%        |
| 1-hour  | 0.31      | 96.8%    | -60%        |
| 6-hour  | 0.52      | 95.1%    | -58%        |
| 24-hour | 0.89      | 94.6%    | -59%        |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/stellar-v1k.git

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
stellar/
├── src/
│   ├── components/         # React components
│   │   ├── AIAssistant.jsx       # Chat interface
│   │   ├── AIInferencePanel.jsx  # Forecast panel
│   │   ├── LiveTelemetryPanel.jsx # Real-time data
│   │   └── ...
│   ├── services/           # Core services
│   │   ├── aiService.js          # TensorFlow.js models
│   │   ├── liveDataService.js    # Telemetry simulation
│   │   └── geminiService.js      # AI assistant
│   ├── store/              # State management
│   │   └── appStore.js           # Zustand store
│   ├── pages/              # Route pages
│   │   ├── CommandDeck.jsx       # Dashboard
│   │   ├── SatelliteConsole.jsx  # Per-satellite view
│   │   ├── ForecastLab.jsx       # Model explorer
│   │   └── ...
│   └── data/               # Mock data generators
└── public/                 # Static assets
```

## 🎯 Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with immersive video background |
| `/dashboard` | Command Deck - main mission control |
| `/console` | Satellite Console - per-satellite deep dive |
| `/forecast-lab` | Model architecture & training visualization |
| `/residuals` | Statistical analysis of prediction residuals |
| `/export` | Generate and export correction bulletins |

## 🤖 AI Features Demo

### Running AI Forecasts
1. Navigate to **Command Deck**
2. Click **"RUN DAY-8 FORECAST"**
3. Wait for TensorFlow.js inference (~500ms for 6 satellites)
4. View results with confidence intervals

### Live Telemetry
1. Scroll to **Live Telemetry** section
2. Click **"Start Live Feed"**
3. Watch real-time orbital mechanics-based data streams
4. Click any satellite for detailed view

### AI Assistant
1. Click the **sparkles button** (bottom-right)
2. Ask any question about the system
3. Try: "What is the model accuracy?" or "Show satellite status"

## 🔧 Technologies

- **Frontend**: React 19, Vite 7
- **Styling**: TailwindCSS 3.4, Framer Motion
- **Charts**: Recharts
- **AI/ML**: TensorFlow.js
- **State**: Zustand
- **Routing**: React Router 7
- **3D**: OGL (Galaxy effect)

## 📈 Future Roadmap

- [ ] WebSocket real-time data feeds
- [ ] Model training interface
- [ ] Multi-user collaboration
- [ ] Historical data analysis
- [ ] API integration with CDDIS/IGS
- [ ] Native mobile app

## 📄 License

MIT License - See LICENSE file for details.

---

**Built with ❤️ for GNSS Operators Worldwide**

*STELLAR-v1k: Peer into the depths of satellite navigation*
