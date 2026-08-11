import math
import numpy as np
import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import streamlit as st

# ==============================================================================
# 1. STREAMLIT PAGE CONFIG & CUSTOM CSS (MATCHING REACT DARK PREVIEW DESIGN)
# ==============================================================================
st.set_page_config(
    page_title="Petroleum Engineering Suite v3.2",
    page_icon="⛽",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom High-End Dark Glass Theme CSS
st.markdown("""
<style>
    /* Dark Slate Body Background */
    .stApp {
        background-color: #0f172a;
        color: #f8fafc;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    
    /* Header Card */
    .header-card {
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 1.25rem 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
    }
    .header-title {
        color: #f59e0b;
        font-size: 1.75rem;
        font-weight: 800;
        letter-spacing: -0.025em;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    .header-subtitle {
        color: #94a3b8;
        font-size: 0.9rem;
        margin-top: 0.25rem;
    }

    /* Metric Cards */
    div[data-testid="stMetric"] {
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 10px;
        padding: 0.85rem 1rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        transition: transform 0.2s ease, border-color 0.2s ease;
    }
    div[data-testid="stMetric"]:hover {
        border-color: #f59e0b;
        transform: translateY(-2px);
    }
    div[data-testid="stMetric"] label {
        color: #94a3b8 !important;
        font-size: 0.8rem !important;
        font-weight: 600 !important;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    div[data-testid="stMetricValue"] {
        color: #f59e0b !important;
        font-size: 1.5rem !important;
        font-weight: 700 !important;
    }

    /* Sidebar Custom Styling */
    section[data-testid="stSidebar"] {
        background-color: #1e293b;
        border-right: 1px solid #334155;
    }
    section[data-testid="stSidebar"] .stMarkdown h1, 
    section[data-testid="stSidebar"] .stMarkdown h2, 
    section[data-testid="stSidebar"] .stMarkdown h3 {
        color: #f8fafc;
    }

    /* Custom Tabs Styling */
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
        background-color: #1e293b;
        padding: 6px;
        border-radius: 10px;
        border: 1px solid #334155;
    }
    .stTabs [data-baseweb="tab"] {
        color: #94a3b8;
        border-radius: 8px;
        font-weight: 600;
        padding: 8px 18px;
        border: none;
    }
    .stTabs [aria-selected="true"] {
        background-color: #f59e0b !important;
        color: #0f172a !important;
        font-weight: 700 !important;
    }

    /* Card Containers */
    .content-card {
        background-color: #1e293b;
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 1.25rem;
        margin-bottom: 1.25rem;
    }

    /* Custom Badges */
    .amber-badge {
        background-color: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
        border: 1px solid rgba(245, 158, 11, 0.3);
        padding: 0.25rem 0.65rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
    }
    .emerald-badge {
        background-color: rgba(16, 185, 129, 0.15);
        color: #10b981;
        border: 1px solid rgba(16, 185, 129, 0.3);
        padding: 0.25rem 0.65rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
    }

    /* Hide Streamlit Default Menu Noise */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
</style>
""", unsafe_allow_html=True)


# ==============================================================================
# 2. THERMODYNAMIC CONSTANTS & GAS COMPONENTS DATA
# ==============================================================================
R_CONST = 10.7316  # (psia * ft3) / (lb-mol * °R)
AIR_MOL_WEIGHT = 28.966  # lb/lb-mol

GAS_COMPONENTS = [
    {"id": "c1", "name": "Methane (C1)", "formula": "CH4", "mw": 16.043, "tc": 343.0, "pc": 666.4},
    {"id": "c2", "name": "Ethane (C2)", "formula": "C2H6", "mw": 30.070, "tc": 549.6, "pc": 706.5},
    {"id": "c3", "name": "Propane (C3)", "formula": "C3H8", "mw": 44.097, "tc": 665.7, "pc": 616.0},
    {"id": "ic4", "name": "i-Butane (iC4)", "formula": "iC4H10", "mw": 58.123, "tc": 734.1, "pc": 527.9},
    {"id": "nc4", "name": "n-Butane (nC4)", "formula": "nC4H10", "mw": 58.123, "tc": 765.3, "pc": 550.6},
    {"id": "ic5", "name": "i-Pentane (iC5)", "formula": "iC5H12", "mw": 72.150, "tc": 828.8, "pc": 490.4},
    {"id": "nc5", "name": "n-Pentane (nC5)", "formula": "nC5H12", "mw": 72.150, "tc": 845.4, "pc": 488.6},
    {"id": "c6", "name": "Hexanes (C6)", "formula": "C6H14", "mw": 86.177, "tc": 913.4, "pc": 436.9},
    {"id": "n2", "name": "Nitrogen (N2)", "formula": "N2", "mw": 28.013, "tc": 227.3, "pc": 493.1},
    {"id": "co2", "name": "Carbon Dioxide (CO2)", "formula": "CO2", "mw": 44.010, "tc": 547.6, "pc": 1070.6},
    {"id": "h2s", "name": "Hydrogen Sulfide (H2S)", "formula": "H2S", "mw": 34.082, "tc": 672.4, "pc": 1306.0},
    {"id": "c7plus", "name": "Heptanes Plus (C7+)", "formula": "C7+", "mw": 145.0, "tc": 1050.0, "pc": 380.0},
]

COMPOSITION_PRESETS = {
    "Dry Gas (Standard)": [0.890, 0.040, 0.015, 0.004, 0.006, 0.002, 0.002, 0.003, 0.018, 0.015, 0.000, 0.005],
    "Wet / Condensate Gas": [0.720, 0.080, 0.045, 0.012, 0.018, 0.008, 0.010, 0.012, 0.010, 0.020, 0.005, 0.060],
    "Sour Gas (High H2S & CO2)": [0.650, 0.030, 0.010, 0.003, 0.004, 0.002, 0.002, 0.003, 0.020, 0.120, 0.130, 0.006],
    "High Nitrogen Gas": [0.750, 0.030, 0.010, 0.002, 0.003, 0.001, 0.001, 0.002, 0.180, 0.015, 0.000, 0.006],
}


# ==============================================================================
# 3. THERMODYNAMIC & PETROLEUM CALCULATIONS ENGINE
# ==============================================================================

def calculate_z_factor_hall_yarborough(p_pr, t_pr):
    if p_pr <= 0 or t_pr <= 0:
        return 1.0
    t = 1.0 / t_pr
    a = 0.06125 * t * math.exp(-1.2 * (1.0 - t)**2)
    b = t * (14.76 - 9.76 * t + 4.58 * (t**2))
    c = t * (90.7 - 242.2 * t + 42.4 * (t**2))
    d = 2.18 + 2.82 * t

    def f(y):
        y2 = y * y
        y3 = y2 * y
        y4 = y3 * y
        one_minus_y = 1.0 - y
        term1 = (y + y2 + y3 - y4) / (one_minus_y**3)
        return -a * p_pr + term1 - b * y2 + c * (y**d)

    def df(y):
        y2 = y * y
        y3 = y2 * y
        one_minus_y = 1.0 - y
        num = 1.0 + 4.0 * y + 4.0 * y2 - 4.0 * y3 + y2 * y2
        term1 = num / (one_minus_y**4)
        return term1 - 2.0 * b * y + c * d * (y**(d - 1.0))

    y = 0.001 * p_pr
    if y > 0.8:
        y = 0.5

    for _ in range(100):
        fy = f(y)
        dfy = df(y)
        if abs(dfy) < 1e-12:
            break
        dy = fy / dfy
        y -= dy
        if y <= 0:
            y = 0.0001
        if y >= 0.95:
            y = 0.90
        if abs(dy) < 1e-7:
            break

    if y <= 0 or math.isnan(y):
        return 1.0
    z = (a * p_pr) / y
    return 1.0 if (math.isnan(z) or z <= 0) else z


def calculate_z_factor_dranchuk_abu_kassem(p_pr, t_pr):
    if p_pr <= 0 or t_pr <= 0:
        return 1.0

    a1, a2, a3, a4, a5 = 0.3265, -1.0700, -0.5339, 0.01569, -0.05165
    a6, a7, a8, a9, a10, a11 = 0.5475, -0.7361, 0.1844, 0.1056, 0.6134, 0.7210

    t1 = a1 + a2 / t_pr + a3 / (t_pr**3) + a4 / (t_pr**4) + a5 / (t_pr**5)
    t2 = a6 + a7 / t_pr + a8 / (t_pr**2)
    t3 = a9 * (a7 / t_pr + a8 / (t_pr**2))

    def f(r):
        r2 = r * r
        r5 = r2 * r2 * r
        exp_term = math.exp(-a11 * r2)
        term1 = t1 * r
        term2 = t2 * r2
        term3 = t3 * r5
        term4 = (a10 * (1.0 + a11 * r2) * (r2 / (t_pr**3))) * exp_term
        return 1.0 + term1 + term2 - term3 + term4 - (0.27 * p_pr / (r * t_pr))

    def df(r):
        r2 = r * r
        r4 = r2 * r2
        exp_term = math.exp(-a11 * r2)
        term1 = t1
        term2 = 2.0 * t2 * r
        term3 = 5.0 * t3 * r4
        d_term4 = (a10 / (t_pr**3)) * exp_term * (2.0 * r + 2.0 * a11 * (r**3) - 2.0 * a11 * (r**3) * (1.0 + a11 * r2))
        return term1 + term2 - term3 + d_term4 + (0.27 * p_pr / (r2 * t_pr))

    rho_r = 0.27 * p_pr / t_pr
    for _ in range(100):
        fr = f(rho_r)
        dfr = df(rho_r)
        if abs(dfr) < 1e-12:
            break
        d_rho = fr / dfr
        rho_r -= d_rho
        if rho_r <= 0:
            rho_r = 0.0001
        if abs(d_rho) < 1e-7:
            break

    if rho_r <= 0 or math.isnan(rho_r):
        return 1.0
    z = 0.27 * p_pr / (rho_r * t_pr)
    return 1.0 if (math.isnan(z) or z <= 0) else z


def calculate_lee_gonzalez_viscosity(p, t_deg_f, z, gas_sg):
    if p <= 0 or t_deg_f <= -459.67 or z <= 0 or gas_sg <= 0:
        return 0.015

    t_deg_r = t_deg_f + 459.67
    m_g = gas_sg * AIR_MOL_WEIGHT

    k = ((9.379 + 0.01607 * m_g) * (t_deg_r**1.5)) / (209.2 + 19.26 * m_g + t_deg_r)
    x = 3.448 + (986.4 / t_deg_r) + 0.01009 * m_g
    y = 2.447 - 0.2224 * x

    rho_g_lb_ft3 = (p * m_g) / (z * R_CONST * t_deg_r)
    rho_g_g_cm3 = rho_g_lb_ft3 * 0.0160185

    mu_g = (k * 1e-4) * math.exp(x * (rho_g_g_cm3**y))
    return max(0.001, mu_g)


def calculate_black_oil(api, gas_sg, rsi, temp_f, p_psia, method="standing"):
    gamma_o = 141.5 / (api + 131.5)
    t_r = temp_f + 459.67

    if method == "standing":
        pb = 18.2 * (((rsi / gas_sg)**0.83) * (10**(0.00091 * temp_f - 0.0125 * api)) - 1.4)
        pb = max(14.7, pb)

        if p_psia <= pb:
            rs = gas_sg * (((p_psia / 18.2 + 1.4) * (10**(0.0125 * api - 0.00091 * temp_f)))**(1 / 0.83))
            rs = max(0, min(rsi, rs))
            f_term = rs * ((gas_sg / gamma_o)**0.5) + 1.25 * temp_f
            bo = 0.972 + 0.000147 * (f_term**1.175)
        else:
            rs = rsi
            f_term = rsi * ((gas_sg / gamma_o)**0.5) + 1.25 * temp_f
            bob = 0.972 + 0.000147 * (f_term**1.175)
            co = (5 * rsi + 17.2 * temp_f - 1180 * gas_sg + 12.61 * api - 1433) / (p_psia * 105)
            co = max(1e-6, co)
            bo = bob * math.exp(-co * (p_psia - pb))

    elif method == "vasquez_beggs":
        c1, c2, c3 = (0.0362, 1.0937, 25.7240) if api <= 30 else (0.0178, 1.1870, 23.9310)
        pb = ((rsi / (c1 * gas_sg * math.exp(c3 * api / t_r)))**(1 / c2))
        pb = max(14.7, pb)

        if p_psia <= pb:
            rs = c1 * gas_sg * (p_psia**c2) * math.exp(c3 * api / t_r)
            rs = max(0, min(rsi, rs))
            bo = 1.0 + 0.000467 * rs + (temp_f - 60) * (api / gas_sg) * 11e-6
        else:
            rs = rsi
            bob = 1.0 + 0.000467 * rsi + (temp_f - 60) * (api / gas_sg) * 11e-6
            co = (5 * rsi + 17.2 * temp_f - 1180 * gas_sg + 12.61 * api - 1433) / (p_psia * 105)
            co = max(1e-6, co)
            bo = bob * math.exp(-co * (p_psia - pb))

    else:
        return calculate_black_oil(api, gas_sg, rsi, temp_f, p_psia, "standing")

    density_lb_ft3 = (62.4 * gamma_o + 0.0136 * rs * gas_sg) / max(0.5, bo)

    return {
        "bubblePoint": round(pb, 1),
        "solutionGor": round(rs, 1),
        "formationVolumeFactor": round(bo, 4),
        "oilDensity": round(density_lb_ft3, 2)
    }


def calculate_ipr(k_md, h_ft, pr_psia, re_ft, rw_ft, skin, mu_cp, bo_rb_stb, pb_psia, target_pwf_psia, use_vogel=True, is_field=True):
    ln_ratio = math.log(max(10, re_ft) / max(0.05, rw_ft))
    denom_actual = max(0.1, ln_ratio + skin)

    j_field = (0.00708 * k_md * h_ft) / (mu_cp * bo_rb_stb * denom_actual)
    j_ideal = (0.00708 * k_md * h_ft) / (mu_cp * bo_rb_stb * ln_ratio)

    def compute_q(pwf, j_val):
        if pwf >= pr_psia:
            return 0.0
        if not use_vogel or pr_psia <= pb_psia:
            q_max = (j_val * pr_psia) / 1.8
            ratio = max(0.0, pwf / pr_psia)
            return max(0.0, q_max * (1.0 - 0.2 * ratio - 0.8 * (ratio**2)))
        else:
            if pwf >= pb_psia:
                return max(0.0, j_val * (pr_psia - pwf))
            else:
                q_b = j_val * (pr_psia - pb_psia)
                q_vogel_max = (j_val * pb_psia) / 1.8
                ratio = max(0.0, pwf / pb_psia)
                q_vogel = q_vogel_max * (1.0 - 0.2 * ratio - 0.8 * (ratio**2))
                return max(0.0, q_b + q_vogel)

    q_max_field = compute_q(0, j_field)
    q_target_field = compute_q(target_pwf_psia, j_field)

    drawdown = pr_psia - target_pwf_psia
    delta_p_skin = (q_target_field / max(1e-5, j_ideal)) * (skin / ln_ratio)
    fe = max(0.0, (drawdown - delta_p_skin) / drawdown) if drawdown > 0 else 1.0

    q_factor = 1.0 if is_field else 0.158987
    p_factor = 1.0 if is_field else 0.0689476
    j_factor = 1.0 if is_field else 2.30588

    steps = 50
    pwf_list = np.linspace(pr_psia, 0, steps)
    q_actual_list = [compute_q(p, j_field) * q_factor for p in pwf_list]
    q_ideal_list = [compute_q(p, j_ideal) * q_factor for p in pwf_list]
    pwf_disp_list = [p * p_factor for p in pwf_list]

    return {
        "productivityIndex": round(j_field * j_factor, 4),
        "qMaxAof": round(q_max_field * q_factor, 1),
        "qTarget": round(q_target_field * q_factor, 1),
        "drawdown": round(drawdown * p_factor, 1),
        "flowEfficiency": round(fe * 100, 1),
        "skinPressureDrop": round(delta_p_skin * p_factor, 1),
        "pwf_disp_list": pwf_disp_list,
        "q_actual_list": q_actual_list,
        "q_ideal_list": q_ideal_list
    }


# ==============================================================================
# 4. APP HEADER & NAVIGATION
# ==============================================================================

st.markdown("""
<div class="header-card">
    <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
            <h1 class="header-title">⛽ Petroleum Engineering Suite <span class="amber-badge">v3.2</span></h1>
            <p class="header-subtitle">Reservoir PVT Thermodynamics & Well Inflow Performance Engine</p>
        </div>
        <div>
            <span class="emerald-badge">⚡ Live Calculation Engine</span>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

# Sidebar Configuration
st.sidebar.title("⚙️ Workspace Controls")

unit_system = st.sidebar.radio("Unit System", ["Field Units (psia, °F, STB/d)", "SI Metric Units (bar, °C, m³/d)"], index=0)
is_field = "Field" in unit_system

p_unit = "psia" if is_field else "bar"
t_unit = "°F" if is_field else "°C"
q_unit = "STB/d" if is_field else "m³/d"
gas_q_unit = "Mscf/d" if is_field else "std m³/d"

app_mode = st.sidebar.selectbox("Analysis Module", [
    "1. Reservoir Fluid PVT Properties",
    "2. Fluid Flow & Well IPR Analysis"
])


# ==============================================================================
# MODULE 1: PVT PROPERTIES & EOS CALCULATOR
# ==============================================================================
if "PVT" in app_mode:
    fluid_type = st.sidebar.radio("Fluid Type", ["Natural Gas", "Crude Oil (Black Oil)"])

    if fluid_type == "Natural Gas":
        st.sidebar.subheader("Thermodynamic Controls")
        p_input = st.sidebar.number_input(f"Pressure ({p_unit})", min_value=14.7 if is_field else 1.0, max_value=15000.0, value=3000.0 if is_field else 206.8, step=100.0)
        t_input = st.sidebar.number_input(f"Temperature ({t_unit})", min_value=60.0 if is_field else 15.0, max_value=400.0, value=180.0 if is_field else 82.2, step=5.0)

        p_psia = p_input if is_field else p_input / 0.0689476
        t_f = t_input if is_field else (t_input * 9/5 + 32)
        t_r = t_f + 459.67

        eos_method = st.sidebar.selectbox("Z-Factor EOS Method", ["Hall-Yarborough (1973)", "Dranchuk-Abu Kassem (1975)"])
        ppc_method = st.sidebar.selectbox("Pseudo-Critical Method", ["Kay's Compositional Rule", "Standing Dry Gas", "Standing Gas Condensate"])

        # Main Workspace Top Tabs
        tab_summary, tab_comp, tab_charts, tab_eqns = st.tabs([
            "📊 PVT Metrics & Results", 
            "🧪 Gas Composition Analysis", 
            "📈 Sensitivity & EOS Charts", 
            "📐 Theoretical Equations"
        ])

        with tab_comp:
            st.subheader("Gas Component Breakdown")
            preset_choice = st.selectbox("Load Standard Preset", list(COMPOSITION_PRESETS.keys()))
            selected_preset = COMPOSITION_PRESETS[preset_choice]

            comp_df = pd.DataFrame({
                "Component": [c["name"] for c in GAS_COMPONENTS],
                "Formula": [c["formula"] for c in GAS_COMPONENTS],
                "Mole Fraction (y_i)": selected_preset,
                "MW (lb/mol)": [c["mw"] for c in GAS_COMPONENTS],
                "Tc (°R)": [c["tc"] for c in GAS_COMPONENTS],
                "Pc (psia)": [c["pc"] for c in GAS_COMPONENTS],
            })

            edited_df = st.data_editor(comp_df, num_rows="fixed", use_container_width=True)
            y_vals = edited_df["Mole Fraction (y_i)"].values
            total_y = sum(y_vals)

            if abs(total_y - 1.0) > 0.001:
                st.warning(f"⚠️ Total mole fraction equals {total_y:.4f}. Normalizing automatically to 1.0000.")
                y_vals = y_vals / total_y

        # Calculations
        mw_mix = sum(y_vals * comp_df["MW (lb/mol)"].values)
        gas_sg = mw_mix / AIR_MOL_WEIGHT

        if "Kay" in ppc_method:
            tpc = sum(y_vals * comp_df["Tc (°R)"].values)
            ppc = sum(y_vals * comp_df["Pc (psia)"].values)
        elif "Dry Gas" in ppc_method:
            tpc = 168.0 + 325.0 * gas_sg - 12.5 * (gas_sg**2)
            ppc = 677.0 + 15.0 * gas_sg - 37.5 * (gas_sg**2)
        else:
            tpc = 187.0 + 330.0 * gas_sg - 71.5 * (gas_sg**2)
            ppc = 706.0 - 51.7 * gas_sg - 11.1 * (gas_sg**2)

        p_pr = p_psia / ppc
        t_pr = t_r / tpc

        z_val = calculate_z_factor_hall_yarborough(p_pr, t_pr) if "Hall" in eos_method else calculate_z_factor_dranchuk_abu_kassem(p_pr, t_pr)
        rho_lb_ft3 = (p_psia * mw_mix) / (z_val * R_CONST * t_r)
        rho_disp = rho_lb_ft3 if is_field else rho_lb_ft3 * 16.0185

        bg_ft3_scf = 0.02827 * z_val * t_r / p_psia
        mu_g = calculate_lee_gonzalez_viscosity(p_psia, t_f, z_val, gas_sg)

        with tab_summary:
            st.subheader("Real Gas Thermodynamic State")

            c1, c2, c3, c4 = st.columns(4)
            c1.metric("Compressibility Z-Factor", f"{z_val:.4f}", f"EOS: {eos_method.split()[0]}")
            c2.metric("Gas Gravity (γ_g)", f"{gas_sg:.4f}", f"MW: {mw_mix:.2f} lb/mol")
            c3.metric(f"Gas Density ({'lb/ft³' if is_field else 'kg/m³'})", f"{rho_disp:.2f}")
            c4.metric(f"FVF Bg ({'ft³/scf' if is_field else 'm³/m³'})", f"{bg_ft3_scf:.5f}")

            st.divider()

            c5, c6, c7, c8 = st.columns(4)
            c5.metric("Gas Viscosity", f"{mu_g:.4f} cP", "Lee-Gonzalez Method")
            c6.metric("Pseudo-Critical T_pc", f"{tpc:.1f} °R", f"T_pr = {t_pr:.3f}")
            c7.metric("Pseudo-Critical P_pc", f"{ppc:.1f} psia", f"P_pr = {p_pr:.3f}")
            c8.metric("Operating Pressure", f"{p_input:.1f} {p_unit}", f"{t_input:.1f} {t_unit}")

        with tab_charts:
            st.subheader("Sensitivity & PVT Curves vs Pressure")

            p_range = np.linspace(100, 8000, 60)
            z_curve = [calculate_z_factor_hall_yarborough(p / ppc, t_pr) if "Hall" in eos_method else calculate_z_factor_dranchuk_abu_kassem(p / ppc, t_pr) for p in p_range]
            bg_curve = [0.02827 * z * t_r / p for p, z in zip(p_range, z_curve)]
            mu_curve = [calculate_lee_gonzalez_viscosity(p, t_f, z, gas_sg) for p, z in zip(p_range, z_curve)]
            p_disp = p_range if is_field else p_range * 0.0689476

            fig = make_subplots(rows=1, cols=3, subplot_titles=("Z-Factor vs Pressure", "Formation Volume Factor Bg", "Gas Viscosity μ_g"))

            fig.add_trace(go.Scatter(x=p_disp, y=z_curve, mode="lines", name="Z-Factor", line=dict(color="#f59e0b", width=3)), row=1, col=1)
            fig.add_trace(go.Scatter(x=p_disp, y=bg_curve, mode="lines", name="Bg (ft³/scf)", line=dict(color="#3b82f6", width=3)), row=1, col=2)
            fig.add_trace(go.Scatter(x=p_disp, y=mu_curve, mode="lines", name="Viscosity (cP)", line=dict(color="#10b981", width=3)), row=1, col=3)

            fig.update_layout(template="plotly_dark", height=450, showlegend=False)
            st.plotly_chart(fig, use_container_width=True)

        with tab_eqns:
            st.subheader("Thermodynamic Governing Equations")
            st.latex(r"Z = \frac{p \cdot V}{n \cdot R \cdot T}")
            st.latex(r"B_g = 0.02827 \cdot \frac{Z \cdot T}{p} \quad \text{ft}^3/\text{scf}")
            st.latex(r"\rho_g = \frac{p \cdot M_w}{Z \cdot R \cdot T}")

    else:
        # Crude Oil (Black Oil)
        st.sidebar.subheader("Black Oil Parameters")
        api = st.sidebar.number_input("Oil Gravity (°API)", min_value=10.0, max_value=60.0, value=35.0, step=1.0)
        gas_sg = st.sidebar.number_input("Gas Specific Gravity (Air=1.0)", min_value=0.5, max_value=1.5, value=0.75, step=0.05)
        rsi = st.sidebar.number_input("Initial GOR (scf/STB)", min_value=0.0, max_value=5000.0, value=500.0, step=50.0)
        temp_f = st.sidebar.number_input(f"Temperature ({t_unit})", min_value=60.0 if is_field else 15.0, max_value=300.0, value=180.0 if is_field else 82.2)
        p_input = st.sidebar.number_input(f"Pressure ({p_unit})", min_value=100.0, max_value=10000.0, value=3000.0)

        p_psia = p_input if is_field else p_input / 0.0689476
        t_f = temp_f if is_field else (temp_f * 9/5 + 32)

        method = st.sidebar.selectbox("Correlation Suite", ["Standing (1947)", "Vasquez-Beggs (1980)"])
        m_key = "standing" if "Standing" in method else "vasquez_beggs"

        bo_res = calculate_black_oil(api, gas_sg, rsi, t_f, p_psia, m_key)

        st.subheader("🛢️ Crude Oil Black Oil Results")

        col1, col2, col3, col4 = st.columns(4)
        col1.metric("Bubble Point (P_b)", f"{bo_res['bubblePoint']} psia", f"Suite: {method.split()[0]}")
        col2.metric("Solution GOR (R_s)", f"{bo_res['solutionGor']} scf/STB")
        col3.metric("Oil FVF (B_o)", f"{bo_res['formationVolumeFactor']} rb/STB")
        col4.metric("Oil Density", f"{bo_res['oilDensity']} lb/ft³")


# ==============================================================================
# MODULE 2: RESERVOIR FLUID FLOW & WELL IPR ANALYSIS
# ==============================================================================
else:
    st.sidebar.subheader("Reservoir Flow Controls")
    k = st.sidebar.number_input("Permeability k (md)", min_value=0.1, max_value=5000.0, value=50.0)
    h = st.sidebar.number_input(f"Pay Thickness h ({'ft' if is_field else 'm'})", min_value=1.0, max_value=500.0, value=50.0)
    pr = st.sidebar.number_input(f"Reservoir Pressure ({p_unit})", min_value=100.0, max_value=10000.0, value=3000.0)
    re = st.sidebar.number_input(f"Drainage Radius r_e ({'ft' if is_field else 'm'})", min_value=100.0, max_value=10000.0, value=1490.0)
    rw = st.sidebar.number_input(f"Wellbore Radius r_w ({'ft' if is_field else 'm'})", min_value=0.1, max_value=5.0, value=0.328)
    skin = st.sidebar.number_input("Skin Factor S (+ damage, - stimulated)", min_value=-5.0, max_value=50.0, value=2.0, step=0.5)
    mu = st.sidebar.number_input("Fluid Viscosity μ (cP)", min_value=0.01, max_value=100.0, value=1.2)
    bo = st.sidebar.number_input("Formation Vol Factor B_o (rb/STB)", min_value=1.0, max_value=3.0, value=1.25)
    pb = st.sidebar.number_input(f"Bubble Point P_b ({p_unit})", min_value=14.7, max_value=10000.0, value=2200.0)
    pwf_target = st.sidebar.number_input("Operating Target P_wf ({p_unit})", min_value=0.0, max_value=pr, value=1500.0)

    pr_psia = pr if is_field else pr / 0.0689476
    pb_psia = pb if is_field else pb / 0.0689476
    pwf_target_psia = pwf_target if is_field else pwf_target / 0.0689476

    ipr_res = calculate_ipr(k, h, pr_psia, re, rw, skin, mu, bo, pb_psia, pwf_target_psia, use_vogel=True, is_field=is_field)

    tab_ipr_summary, tab_ipr_curves, tab_ipr_eqns = st.tabs([
        "📊 Inflow Performance Metrics", 
        "📉 IPR & Skin Sensitivity Curves", 
        "📐 Vogel & Darcy Equations"
    ])

    with tab_ipr_summary:
        st.subheader("Well Deliverability & Inflow Results")

        c1, c2, c3, c4 = st.columns(4)
        c1.metric("Productivity Index (J)", f"{ipr_res['productivityIndex']} {'STB/d/psi' if is_field else 'm³/d/bar'}")
        c2.metric("Max AOF Potential (q_max)", f"{ipr_res['qMaxAof']} {q_unit}")
        c3.metric("Rate at Target Pwf", f"{ipr_res['qTarget']} {q_unit}")
        c4.metric("Flow Efficiency (FE)", f"{ipr_res['flowEfficiency']}%")

        st.divider()

        c5, c6, c7, c8 = st.columns(4)
        c5.metric("Total Pressure Drawdown", f"{ipr_res['drawdown']} {p_unit}")
        c6.metric("Skin Pressure Drop (ΔP_skin)", f"{ipr_res['skinPressureDrop']} {p_unit}")
        c7.metric("Skin Damage S", f"{skin:+.1f}", "Stimulated" if skin < 0 else "Damaged")
        c8.metric("Operating P_wf", f"{pwf_target:.1f} {p_unit}")

    with tab_ipr_curves:
        st.subheader("Inflow Performance Curves")

        fig = go.Figure()
        fig.add_trace(go.Scatter(x=ipr_res['q_actual_list'], y=ipr_res['pwf_disp_list'], mode="lines", name=f"Actual IPR (S = {skin})", line=dict(color="#10b981", width=3.5)))
        fig.add_trace(go.Scatter(x=ipr_res['q_ideal_list'], y=ipr_res['pwf_disp_list'], mode="lines", name="Ideal IPR (S = 0)", line=dict(color="#94a3b8", width=2, dash="dash")))

        # Target operating point
        fig.add_trace(go.Scatter(x=[ipr_res['qTarget']], y=[pwf_target], mode="markers+text", name="Operating Point", marker=dict(color="#f59e0b", size=12), text=["Operating Point"], textposition="top right"))

        fig.update_layout(
            title=f"Flowing Pressure (P_wf) vs Production Rate (q) in {q_unit}",
            xaxis_title=f"Production Rate q ({q_unit})",
            yaxis_title=f"Flowing Bottomhole Pressure P_wf ({p_unit})",
            template="plotly_dark",
            height=500,
            hovermode="x unified"
        )
        st.plotly_chart(fig, use_container_width=True)

    with tab_ipr_eqns:
        st.subheader("Inflow Governing Equations")
        st.latex(r"J = \frac{0.00708 \cdot k \cdot h}{\mu \cdot B_o \cdot \left( \ln\frac{r_e}{r_w} + S \right)}")
        st.latex(r"\frac{q}{q_{\text{max}}} = 1 - 0.2 \left( \frac{p_{wf}}{p_r} \right) - 0.8 \left( \frac{p_{wf}}{p_r} \right)^2")


# Footer
st.divider()
st.caption("Petroleum Engineering Suite v3.2 • Custom Streamlit Design Matching React Preview • For Estimation & Analysis")
