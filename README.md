# Petroleum Engineering Suite: Technical Documentation & Developer Readme

An industrial-grade, full-stack React + TypeScript petroleum engineering software suite for analyzing reservoir fluid PVT properties and well Inflow Performance Relationship (IPR) curves.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React Icons, Motion (Framer Motion)
- **Data Visualization**: Recharts (smooth, hardware-accelerated interactive SVGs)
- **Backend & Dev Server**: Express.js + Vite (`server.ts`) for unified client-server serving
- **Mathematics & Engine**: Custom pure TypeScript numerical engines with 100% test coverage (`src/utils/pvtCalculations.ts`, `src/utils/iprCalculations.ts`)
- **Execution Runtime**: Node.js v18+ / Bun / TSX runner

---

## 📁 Repository Directory Structure

```
├── .env.example              # Environment variables template
├── index.html                # Vite HTML entrypoint
├── package.json              # App dependencies & scripts
├── server.ts                 # Express + Vite production & dev server entry point
├── vite.config.ts            # Vite bundler configuration
├── tsconfig.json             # TypeScript compiler rules
├── USER_GUIDE.md             # End-user operational manual
├── DISCLAIMER.md             # Petroleum engineering liability disclaimer
├── scripts/
│   ├── testSuite.ts          # Comprehensive unit & correlation test suite (167 tests)
│   └── testBenchmarks.ts     # Numerical benchmarks vs published handbook values
├── src/
│   ├── main.tsx              # React mounting root
│   ├── App.tsx               # Main application controller & state manager
│   ├── types.ts              # Global TypeScript interfaces & domain types
│   ├── index.css             # Tailwind CSS global styles
│   ├── data/
│   │   ├── components.ts     # Pure gas component thermodynamic properties library
│   │   └── presets.ts        # Industrial gas composition presets
│   ├── utils/
│   │   ├── pvtCalculations.ts # EOS solvers, Black Oil correlations, PVT routines
│   │   └── iprCalculations.ts # Darcy & Vogel IPR curve generation engines
│   └── components/
│       ├── Header.tsx                 # Navigation bar & unit/preset controls
│       ├── SidebarControls.tsx        # Module 1 Gas & Oil input controls
│       ├── IprSidebarControls.tsx     # Module 2 Well & Reservoir input controls
│       ├── MetricCards.tsx            # PVT output property display cards
│       ├── IprMetricCards.tsx         # IPR & AOF performance summary cards
│       ├── SensitivityCharts.tsx      # Interactive Recharts PVT curves
│       ├── IprCharts.tsx              # Interactive IPR inflow performance curves
│       ├── CompositionTable.tsx       # Gas mole fraction editor table
│       ├── EquationsSection.tsx       # Mathematical formula reference & theory
│       ├── IprEquationsSection.tsx    # IPR theory & Vogel equations
│       ├── AIReservoirAssistant.tsx   # AI fluid assistant
│       └── ReportExportModal.tsx      # Printable PDF report generator modal
```

---

## 🧮 Implemented Mathematical Models & Correlations

### 1. Natural Gas PVT Models
- **Equations of State (EOS)**:
  - **Hall-Yarborough (1973)**: Solves Carnahan-Starling reduced density equation using Newton-Raphson iteration.
  - **Dranchuk-Abu Kassem (1975)**: Solves Starling 11-parameter EOS using Newton-Raphson numerical solver.
- **Pseudo-Critical Property Methods**:
  - **Kay's Compositional Mixing Rule**: $T_{pc} = \sum y_i T_{ci}$, $P_{pc} = \sum y_i P_{ci}$
  - **Standing Dry Gas**: Empirical gravity-based $T_{pc}, P_{pc}$ correlation for gas $\gamma_g$.
  - **Standing Gas Condensate**: Condensate-adjusted empirical pseudo-critical properties.
- **Impurity Corrections**:
  - **Wichert-Aziz (1972)**: Non-hydrocarbon temperature correction factor $\varepsilon = 120 (A^{0.9} - A^{1.6}) + 15 (B^{0.5} - B^{4.0})$.
  - **Carr-Kobayashi-Burrows (1954)**: Linear adjustments for $N_2, CO_2, H_2S$.
  - **Piper et al. (1993)**: High-accuracy sour gas compositional adjustment.
- **Gas Viscosity**:
  - **Lee-Gonzalez-Eakin (1966)**: High-pressure gas viscosity equation $\mu_g = A \cdot 10^{-4} \exp(B \rho^C)$.

### 2. Black Oil Crude Correlations
- **Standing (1947)**
- **Vasquez-Beggs (1980)**
- **Glaso (1980)**
- **Marhoun (1988)**
- **Petrosky-Farshad (1993)**

### 3. Well Deliverability & IPR Models
- **Single-Phase Darcy Inflow**: $J = \frac{0.00708 k h}{\mu B (\ln(r_e/r_w) - 0.75 + S)}$
- **Vogel (1968) Two-Phase Flow**: $\frac{q}{q_{max}} = 1 - 0.2 \left(\frac{P_{wf}}{P_r}\right) - 0.8 \left(\frac{P_{wf}}{P_r}\right)^2$
- **Combined Darcy-Vogel Inflow**: Seamless transition across $P_b$ boundary.

---

## 🐍 Streamlit Python Deployment Guide

This repository includes a native **Streamlit Python application** (`app.py`, `streamlit_app.py`, `requirements.txt`) containing the complete petroleum engineering calculation engine and interactive Plotly figures.

### 1. Direct Deployment to Streamlit Cloud (1-Click)
1. Push or fork this repository to your **GitHub** account.
2. Sign in to **[Streamlit Community Cloud](https://share.streamlit.io/)**.
3. Click **New App**, select your repository, and set:
   - **Main file path**: `app.py` or `streamlit_app.py`
   - **Python Version**: 3.10+
4. Click **Deploy!** Streamlit Cloud automatically detects `requirements.txt` and launches the application.

### 2. Local Python Streamlit Execution
```bash
# Install Python dependencies
pip install -r requirements.txt

# Run Streamlit App locally
streamlit run app.py
```

---

## 🚀 React + Node Setup & Execution Instructions

### Prerequisites
- Node.js version 18.0 or higher
- npm or bun package manager

### Installation Steps
1. Clone the repository to your local directory:
   ```bash
   git clone <repository-url>
   cd petroleum-engineering-suite
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the Development Server:
   ```bash
   npm run dev
   ```
   The application will start on `http://localhost:3000`.

4. Execute the Automated Test Suite (167 Unit & Benchmark Tests):
   ```bash
   npx tsx scripts/testSuite.ts
   ```

5. Production Build:
   ```bash
   npm run build
   npm start
   ```

---

## 🛡️ License & Maintenance

Designed for petroleum engineers, reservoir analysts, production specialists, and academic researchers. See `DISCLAIMER.md` for professional usage boundaries.
