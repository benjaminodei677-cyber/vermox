# Petroleum Engineering Suite: User Guide & Manual

Welcome to the **Petroleum Engineering Suite (v3.2)**, an industrial-grade reservoir fluid PVT property calculator and well Inflow Performance Relationship (IPR) simulation engine.

---

## Table of Contents
1. [Overview & Navigation](#overview--navigation)
2. [Module 1: Reservoir Fluid PVT Properties](#module-1-reservoir-fluid-pvt-properties)
   - [Natural Gas PVT Workflow](#natural-gas-pvt-workflow)
   - [Crude Oil (Black Oil) Workflow](#crude-oil-black-oil-workflow)
   - [Equations of State & Non-Hydrocarbon Corrections](#equations-of-state--non-hydrocarbon-corrections)
3. [Module 2: Reservoir Fluid Flow & Well IPR](#module-2-reservoir-fluid-flow--well-ipr)
   - [Input Parameters](#input-parameters)
   - [Darcy vs. Vogel Two-Phase Flow](#darcy-vs-vogel-two-phase-flow)
4. [Interpreting Calculation Results & Charts](#interpreting-calculation-results--charts)
   - [Z-Factor & Gas Density Curves](#z-factor--gas-density-curves)
   - [Formation Volume Factors ($B_g, B_o$) & Solution GOR ($R_s$)](#formation-volume-factors-b_g-b_o--solution-gor-r_s)
   - [IPR Curves & Absolute Open Flow (AOF)](#ipr-curves--absolute-open-flow-aof)
5. [Exporting PDF Reports](#exporting-pdf-reports)

---

## 1. Overview & Navigation

The application is structured into two core modules accessible via the top navigation bar:
- **1. PVT Properties**: Calculate real gas compressibility ($Z$), gas density ($\rho_g$), formation volume factor ($B_g$), gas viscosity ($\mu_g$), black oil bubble point ($P_b$), solution gas-oil ratio ($R_s$), and oil formation volume factor ($B_o$).
- **2. Fluid Flow & IPR**: Compute inflow performance relationship curves, skin effect losses, productivity index ($J$), and Absolute Open Flow (AOF) potential under single-phase and two-phase reservoir flow.

### Unit Systems
Switch between **Field Units** ($\text{psia}, ^\circ\text{F}, \text{lb/ft}^3, \text{Mscf/d}, \text{STB/d}, \text{md}$) and **SI Units** ($\text{bar}, ^\circ\text{C}, \text{kg/m}^3, \text{std m}^3/\text{d}$) at any time using the unit toggle in the header. All inputs, calculations, and chart axes instantly recalculate using exact conversion factors.

---

## 2. Module 1: Reservoir Fluid PVT Properties

### Natural Gas PVT Workflow
1. Select **Natural Gas** under Fluid Type in the left sidebar.
2. Set **Reservoir Pressure** ($P$) and **Reservoir Temperature** ($T$).
3. Choose a composition preset (e.g., *Standard Dry Gas*, *Condensate Gas*, *Sour Gas High CO₂/H₂S*, *Volatile Gas*) or enter custom mole fractions ($y_i$) in the **Gas Composition Table**.
4. Use the **Normalize Composition** button if total mole fraction differs from $1.0000$.
5. For heavy fraction ($C_{7+}$) characterization, enter $C_{7+}$ mole fraction, molecular weight ($M_{C7+}$), and specific gravity ($\gamma_{C7+}$).

### Crude Oil (Black Oil) Workflow
1. Select **Crude Oil** under Fluid Type.
2. Specify **Stock Tank Oil Gravity** ($^\circ\text{API}$), **Separator Gas Specific Gravity** ($\gamma_g$), and **Initial Solution Gas-Oil Ratio** ($R_{si}$).
3. Choose your preferred correlation suite:
   - **Standing (1947)** (California Crude Oils)
   - **Vasquez-Beggs (1980)** (General Worldwide Crude Oils)
   - **Glaso (1980)** (North Sea Crude Oils)
   - **Marhoun (1988)** (Middle East Crude Oils)
   - **Petrosky-Farshad (1993)** (Gulf of Mexico Crude Oils)

### Equations of State & Non-Hydrocarbon Corrections
- **Z-Factor Method**: Select between **Hall-Yarborough (1973)** (Carnahan-Starling EOS) and **Dranchuk-Abu Kassem (1975)** (Starling EOS).
- **Pseudo-Critical Method**: Choose **Kay's Compositional Mixing Rule**, **Standing Dry Gas Correlation**, or **Standing Gas Condensate Correlation**.
- **Impurity / Sour Gas Corrections**:
  - **Wichert-Aziz (1972)**: For $H_2S$ and $CO_2$ mixtures ($y_{H2S} + y_{CO2} < 85\%$).
  - **Carr-Kobayashi-Burrows (1954)**: Standard non-hydrocarbon adjustment for $N_2, CO_2, H_2S$.
  - **Piper et al. (1993)**: High-accuracy compositional characterization for sour gas.

---

## 3. Module 2: Reservoir Fluid Flow & Well IPR

### Input Parameters
In the **Fluid Flow & IPR** sidebar, configure wellbore and reservoir properties:
- **Permeability ($k$)**: Formation effective permeability in millidarcies ($\text{md}$).
- **Net Pay Thickness ($h$)**: Net reservoir pay thickness in feet or meters.
- **Reservoir Pressure ($P_r$)**: Average reservoir pressure.
- **Drainage Radius ($r_e$)** & **Wellbore Radius ($w_r$)**: Well spacing and borehole geometry.
- **Skin Factor ($S$)**: Mechanical formation damage ($S > 0$) or stimulation / acid fracturing ($S < 0$).
- **Fluid Viscosity ($\mu$)** & **Formation Volume Factor ($B$)**.
- **Bubble Point Pressure ($P_b$)**: Threshold pressure for gas liberation.

### Darcy vs. Vogel Two-Phase Flow
- **Single-Phase Darcy Flow**: Used when $P_{wf} \ge P_b$. Flow rate is linearly proportional to pressure drawdown ($q = J \cdot (P_r - P_{wf})$).
- **Vogel Combined Two-Phase Flow**: When $P_{wf} < P_b$, gas liberates from solution, causing multi-phase relative permeability impairment. Vogel's parabolic quadratic equation governs flow deliverability below $P_b$.

---

## 4. Interpreting Calculation Results & Charts

### Z-Factor & Gas Density Curves
- Real gas compressibility $Z < 1.0$ at moderate pressures indicates attractive intermolecular forces dominant over kinetic movement.
- At high pressures ($P > 4000 \text{ psia}$), $Z > 1.0$ due to finite molecular volume repulsions.

### Formation Volume Factors ($B_g, B_o$) & Solution GOR ($R_s$)
- **Gas $B_g$**: Decreases monotonically with pressure as gas compresses into smaller reservoir volume.
- **Oil $B_o$**: Increases with pressure up to $P_b$ as gas dissolves into oil, expanding the liquid phase. Above $P_b$, $B_o$ slightly decreases due to liquid oil compressibility.
- **Solution GOR $R_s$**: Remains constant at $R_{si}$ above $P_b$, and decreases below $P_b$ as gas evolves out of solution.

### IPR Curves & Absolute Open Flow (AOF)
- **Shut-In Point ($q = 0$)**: Occurs at $P_{wf} = P_r$.
- **Absolute Open Flow (AOF)**: Occurs at $P_{wf} = 0 \text{ psia}$ (maximum possible drawdown).
- **Skin Effect Comparison**: The chart displays the **Actual IPR ($S > 0$)** alongside the **Ideal IPR ($S = 0$)** to visually demonstrate production losses caused by formation damage.

---

## 5. Exporting PDF Reports

Click the **Export PDF Report** button in the header to open the publication generator:
- Customize engineer metadata, company name, well ID, and project notes.
- Select included sections (PVT Summary, EOS Coefficients, IPR Curve Points, Gas Composition Breakdown).
- Print or save a formatted, audit-ready engineering document.
