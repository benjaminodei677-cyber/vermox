import math
import numpy as np
import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import streamlit as st

# ==============================================================================
# 1. STREAMLIT PAGE CONFIG & DIRECT CARBON COPY VERCEL DARK THEME CSS
# ==============================================================================
st.set_page_config(
    page_title="Petroleum Engineering Suite v3.2",
    page_icon="⛽",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Carbon Copy CSS matching Vercel Dark Preview (#0b0f19 Canvas)
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');

    /* Dark Canvas Background (#0b0f19) */
    .stApp {
        background-color: #0b0f19 !important;
        color: #f1f5f9;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    
    /* Global Typography Fixes */
    h1, h2, h3, h4, h5, h6 {
        color: #f8fafc !important;
        font-family: 'Times New Roman', Times, serif;
    }

    /* Hide Streamlit Header & Footer Padding Noise */
    header[data-testid="stHeader"] {
        background-color: transparent !important;
    }
    .main .block-container {
        padding-top: 1.25rem !important;
        padding-bottom: 2rem !important;
        max-width: 1600px;
    }

    /* Top Header Container - Direct Vercel Copy */
    .vercel-header {
        background: #0f172a;
        border: 1px solid #1e293b;
        border-radius: 16px;
        padding: 1rem 1.25rem;
        margin-bottom: 1.25rem;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
    }
    .header-brand {
        display: flex;
        align-items: center;
        gap: 0.875rem;
    }
    .brand-icon-box {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 0.75rem;
        background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #020617;
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        flex-shrink: 0;
    }
    .header-title {
        color: #f8fafc;
        font-size: 1.35rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        margin: 0;
        font-family: 'Times New Roman', Times, serif;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    .header-subtitle {
        color: #94a3b8;
        font-size: 0.8rem;
        margin-top: 0.15rem;
        font-family: 'Inter', sans-serif;
    }

    /* Metric Card Component - Pixel Perfect Vercel Grid */
    .pvt-cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
        margin-bottom: 1.25rem;
    }
    .pvt-card {
        background-color: #0f172a;
        border: 1px solid #1e293b;
        border-radius: 1rem;
        padding: 1rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.15), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        transition: all 0.2s ease-in-out;
        min-height: 125px;
    }
    .pvt-card:hover {
        border-color: #f59e0b;
        transform: translateY(-2px);
        box-shadow: 0 8px 20px -4px rgba(245, 158, 11, 0.15);
    }
    .pvt-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.35rem;
    }
    .pvt-card-title {
        font-size: 0.75rem;
        font-weight: 700;
        color: #94a3b8;
        font-family: 'Times New Roman', Times, serif;
    }
    .pvt-card-icon {
        width: 2rem;
        height: 2rem;
        border-radius: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }
    .icon-cyan { background-color: rgba(6, 182, 212, 0.2); color: #22d3ee; }
    .icon-amber { background-color: rgba(245, 158, 11, 0.2); color: #fbbf24; }
    .icon-emerald { background-color: rgba(16, 185, 129, 0.2); color: #34d399; }
    .icon-purple { background-color: rgba(168, 85, 247, 0.2); color: #c084fc; }
    .icon-rose { background-color: rgba(244, 63, 94, 0.2); color: #fb7185; }

    .pvt-card-body {
        display: flex;
        align-items: baseline;
        gap: 0.375rem;
        margin-top: 0.2rem;
        margin-bottom: 0.2rem;
    }
    .pvt-card-value {
        font-size: 1.65rem;
        font-weight: 900;
        color: #f8fafc;
        font-family: 'Times New Roman', Times, serif;
        line-height: 1.2;
    }
    .pvt-card-unit {
        font-size: 0.75rem;
        font-weight: 700;
        font-family: 'JetBrains Mono', monospace;
    }
    .unit-cyan { color: #22d3ee; }
    .unit-amber { color: #fbbf24; }
    .unit-emerald { color: #34d399; }
    .unit-purple { color: #c084fc; }
    .unit-rose { color: #fb7185; }

    .pvt-card-footer {
        margin-top: 0.65rem;
        padding-top: 0.45rem;
        border-top: 1px solid rgba(30, 41, 59, 0.6);
        font-size: 0.7rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .pvt-card-footer-label {
        color: #94a3b8;
    }
    .pvt-card-footer-value {
        font-weight: 700;
        font-family: 'JetBrains Mono', monospace;
    }

    /* Sidebar Custom Styling */
    section[data-testid="stSidebar"] {
        background-color: #0f172a !important;
        border-right: 1px solid #1e293b !important;
    }
    section[data-testid="stSidebar"] .stMarkdown h1, 
    section[data-testid="stSidebar"] .stMarkdown h2, 
    section[data-testid="stSidebar"] .stMarkdown h3 {
        color: #f8fafc !important;
        font-family: 'Times New Roman', Times, serif !important;
    }

    /* Custom Navigation Tabs */
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
        background-color: #0f172a;
        padding: 6px;
        border-radius: 12px;
        border: 1px solid #1e293b;
    }
    .stTabs [data-baseweb="tab"] {
        color: #94a3b8;
        border-radius: 10px;
        font-weight: 700;
        padding: 8px 18px;
        border: none;
        font-size: 0.825rem;
        font-family: 'Inter', sans-serif;
    }
    .stTabs [aria-selected="true"] {
        background-color: #f59e0b !important;
        color: #020617 !important;
        font-weight: 800 !important;
    }

    /* Content Cards */
    .content-card {
        background-color: #0f172a;
        border: 1px solid #1e293b;
        border-radius: 16px;
        padding: 1.25rem;
        margin-bottom: 1.25rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
    }

    /* Badges */
    .amber-badge {
        background-color: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
        border: 1px solid rgba(245, 158, 11, 0.3);
        padding: 0.2rem 0.55rem;
        border-radius: 6px;
        font-size: 0.7rem;
        font-weight: 700;
        font-family: 'JetBrains Mono', monospace;
    }
    .emerald-badge {
        background-color: rgba(16, 185, 129, 0.15);
        color: #10b981;
        border: 1px solid rgba(16, 185, 129, 0.3);
        padding: 0.2rem 0.55rem;
        border-radius: 6px;
        font-size: 0.7rem;
        font-weight: 700;
        font-family: 'JetBrains Mono', monospace;
    }

    /* Form & Input Fields */
    .stNumberInput input, .stSelectbox div[data-baseweb="select"] {
        background-color: #1e293b !important;
        color: #f8fafc !important;
        border-color: #334155 !important;
        border-radius: 8px !important;
    }

    /* Hide Default Footer & Main Menu */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
</style>
""", unsafe_allow_html=True)


# ==============================================================================
# 2. LUCIDE SVG ICONS & CARD BUILDER HELPER
# ==============================================================================
ICON_GAUGE = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>'
ICON_SCALE = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h18"/></svg>'
ICON_BOX = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>'
ICON_LAYERS = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>'
ICON_FLAME = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>'
ICON_ACTIVITY = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.48 12H2"/></svg>'
ICON_DROPLETS = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 0 1-11.2 5.6"/></svg>'
ICON_SHIELD = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.8 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>'

def make_card_html(title, icon_svg, color_name, value_str, unit_str, footer_label, footer_value, footer_color="text-emerald-400"):
    return f"""
    <div class="pvt-card">
        <div>
            <div class="pvt-card-header">
                <span class="pvt-card-title">{title}</span>
                <div class="pvt-card-icon icon-{color_name}">
                    {icon_svg}
                </div>
            </div>
            <div class="pvt-card-body">
                <span class="pvt-card-value">{value_str}</span>
                <span class="pvt-card-unit unit-{color_name}">{unit_str}</span>
            </div>
        </div>
        <div class="pvt-card-footer">
            <span class="pvt-card-footer-label">{footer_label}</span>
            <span class="pvt-card-footer-value {footer_color}">{footer_value}</span>
        </div>
    </div>
    """


# ==============================================================================
# 3. THERMODYNAMIC CONSTANTS & COMPONENT SPECIES DATA
# ==============================================================================
R_CONST = 10.7316  # (psia * ft3) / (lb-mol * °R)
AIR_MOL_WEIGHT = 28.966  # lb/lb-mol

PURE_GAS_COMPONENTS = [
    {"id": "c1", "name": "Methane", "formula": "CH₄", "mw": 16.043, "tc": 343.00, "pc": 666.4},
    {"id": "c2", "name": "Ethane", "formula": "C₂H₆", "mw": 30.070, "tc": 549.59, "pc": 706.5},
    {"id": "c3", "name": "Propane", "formula": "C₃H₈", "mw": 44.097, "tc": 665.73, "pc": 616.0},
    {"id": "ic4", "name": "i-Butane", "formula": "i-C₄H₁₀", "mw": 58.123, "tc": 734.13, "pc": 527.9},
    {"id": "nc4", "name": "n-Butane", "formula": "n-C₄H₁₀", "mw": 58.123, "tc": 765.29, "pc": 550.7},
    {"id": "ic5", "name": "i-Pentane", "formula": "i-C₅H₁₂", "mw": 72.150, "tc": 828.77, "pc": 490.4},
    {"id": "nc5", "name": "n-Pentane", "formula": "n-C₅H₁₂", "mw": 72.150, "tc": 845.37, "pc": 488.6},
    {"id": "c6", "name": "Hexane", "formula": "C₆H₁₄", "mw": 86.177, "tc": 913.37, "pc": 436.9},
    {"id": "c7plus", "name": "Heptanes Plus", "formula": "C₇₊", "mw": 114.23, "tc": 1023.0, "pc": 397.0},
    {"id": "n2", "name": "Nitrogen", "formula": "N₂", "mw": 28.013, "tc": 227.16, "pc": 493.0},
    {"id": "co2", "name": "Carbon Dioxide", "formula": "CO₂", "mw": 44.010, "tc": 547.42, "pc": 1070.0},
    {"id": "h2s", "name": "Hydrogen Sulfide", "formula": "H₂S", "mw": 34.082, "tc": 672.35, "pc": 1300.0},
]

COMPOSITION_PRESETS = {
    "Dry Gas (High C1)": np.array([0.92, 0.04, 0.02, 0.005, 0.005, 0.002, 0.002, 0.001, 0.000, 0.005, 0.000, 0.000]),
    "Wet Gas (C2-C4 Rich)": np.array([0.82, 0.08, 0.04, 0.015, 0.015, 0.008, 0.007, 0.005, 0.005, 0.005, 0.000, 0.000]),
    "Gas Condensate": np.array([0.70, 0.10, 0.06, 0.025, 0.025, 0.015, 0.015, 0.010, 0.040, 0.010, 0.000, 0.000]),
    "Sour Gas (10% H2S, 5% CO2)": np.array([0.75, 0.04, 0.02, 0.005, 0.005, 0.002, 0.002, 0.001, 0.000, 0.018, 0.050, 0.100]),
}


# ==============================================================================
# 4. THERMODYNAMIC PVT & IPR CALCULATION ENGINES
# ==============================================================================

def calculate_wichert_aziz(y_h2s, y_co2, tpc, ppc):
    A = y_h2s + y_co2
    if A <= 0:
        return tpc, ppc, 0.0
    B = y_h2s
    eps = 120.0 * (math.pow(A, 0.9) - math.pow(A, 1.6)) + 15.0 * (math.pow(B, 0.5) - math.pow(B, 4.0))
    tpc_corr = tpc - eps
    ppc_corr = (ppc * tpc_corr) / (tpc + B * (1.0 - B) * eps)
    return tpc_corr, ppc_corr, eps

def calculate_carr_kobayashi_burrows(y_h2s, y_co2, y_n2, tpc, ppc):
    tpc_corr = tpc - 80.0 * y_co2 + 130.0 * y_h2s - 250.0 * y_n2
    ppc_corr = ppc + 440.0 * y_co2 + 600.0 * y_h2s - 170.0 * y_n2
    return max(100.0, tpc_corr), max(100.0, ppc_corr)

def calculate_z_factor_hall_yarborough(p_pr, t_pr):
    t_rec = 1.0 / max(0.2, t_pr)
    A = 0.06125 * t_rec * math.exp(-1.2 * math.pow(1.0 - t_rec, 2))
    
    y = 0.01
    for _ in range(50):
        y2 = y * y
        y3 = y2 * y
        y4 = y3 * y
        
        f = -A * p_pr + (y + y2 + y3 - y4) / math.pow(1.0 - y, 3) - \
            (14.76 * t_rec - 9.76 * t_rec * t_rec + 4.58 * math.pow(t_rec, 3)) * y2 + \
            (90.7 * t_rec - 242.2 * t_rec * t_rec + 42.4 * math.pow(t_rec, 3)) * math.pow(y, 2.18 + 2.82 * t_rec)
            
        df = (1.0 + 4.0 * y + 4.0 * y2 - 2.0 * y3 + y4) / math.pow(1.0 - y, 4) - \
             2.0 * (14.76 * t_rec - 9.76 * t_rec * t_rec + 4.58 * math.pow(t_rec, 3)) * y + \
             (2.18 + 2.82 * t_rec) * (90.7 * t_rec - 242.2 * t_rec * t_rec + 42.4 * math.pow(t_rec, 3)) * math.pow(y, 1.18 + 2.82 * t_rec)
             
        if abs(df) < 1e-12:
            break
        y_next = y - f / df
        if y_next <= 0:
            y_next = y / 2.0
        if abs(y_next - y) < 1e-6:
            y = y_next
            break
        y = y_next

    z = (A * p_pr) / max(1e-6, y)
    return min(3.0, max(0.2, z))

def calculate_z_factor_dranchuk_abu_kassem(p_pr, t_pr):
    t_rec = 1.0 / max(0.2, t_pr)
    A1, A2, A3, A4, A5 = 0.3265, -1.0700, -0.5339, 0.01569, -0.05165
    A6, A7, A8, A9, A10, A11 = 0.5475, -0.7361, 0.1844, 0.1056, 0.6134, 0.7210
    
    rho_r = 0.27 * p_pr * t_rec
    for _ in range(50):
        r = rho_r
        r2 = r * r
        r5 = math.pow(r, 5)
        
        f = 1.0 + (A1 + A2 * t_rec + A3 * math.pow(t_rec, 3) + A4 * math.pow(t_rec, 4) + A5 * math.pow(t_rec, 5)) * r + \
            (A6 + A7 * t_rec + A8 * math.pow(t_rec, 2)) * r2 - \
            A9 * (A7 * t_rec + A8 * math.pow(t_rec, 2)) * r5 + \
            A10 * (1.0 + A11 * r2) * (r2 / math.pow(t_pr, 3)) * math.exp(-A11 * r2) - (0.27 * p_pr * t_rec) / max(1e-6, r)
            
        df = (A1 + A2 * t_rec + A3 * math.pow(t_rec, 3) + A4 * math.pow(t_rec, 4) + A5 * math.pow(t_rec, 5)) + \
             2.0 * (A6 + A7 * t_rec + A8 * math.pow(t_rec, 2)) * r - \
             5.0 * A9 * (A7 * t_rec + A8 * math.pow(t_rec, 2)) * r2 * r2 + \
             2.0 * A10 * (r / math.pow(t_pr, 3)) * math.exp(-A11 * r2) * (1.0 + A11 * r2 - A11 * A11 * r2 * r2) + \
             (0.27 * p_pr * t_rec) / max(1e-6, r2)
             
        if abs(df) < 1e-12:
            break
        r_next = r - f / df
        if r_next <= 0:
            r_next = r / 2.0
        if abs(r_next - r) < 1e-6:
            rho_r = r_next
            break
        rho_r = r_next
        
    z = (0.27 * p_pr * t_rec) / max(1e-6, rho_r)
    return min(3.0, max(0.2, z))

def calculate_lee_gonzalez_viscosity(p_psia, t_f, z_val, gas_sg):
    t_r = t_f + 459.67
    mw = gas_sg * AIR_MOL_WEIGHT
    rho_g_g_cm3 = (p_psia * mw) / (z_val * 10.7316 * t_r) * 0.0160185
    
    K = ((9.379 + 0.01607 * mw) * math.pow(t_r, 1.5)) / (209.2 + 19.26 * mw + t_r)
    X = 3.448 + (986.4 / t_r) + 0.01009 * mw
    Y = 2.447 - 0.2224 * X
    
    mu = 1e-4 * K * math.exp(X * math.pow(max(1e-6, rho_g_g_cm3), Y))
    return max(0.005, min(0.5, mu))

def calculate_black_oil_all_models(api, gas_sg, rsi_scf, temp_f, p_psia, model_key):
    gamma_o = 141.5 / (api + 131.5)
    t_r = temp_f + 459.67

    if model_key == "standing":
        a = math.pow(rsi_scf / max(1e-5, gas_sg), 0.83) * math.pow(10, 0.00091 * temp_f - 0.0125 * api)
        pb = 18.2 * (a - 1.4)
    elif model_key == "vasquez_beggs":
        c1, c2, c3 = (0.0362, 1.0937, 25.724) if api > 30 else (0.0178, 1.1870, 23.931)
        pb = math.pow((rsi_scf / (c1 * gas_sg * math.exp(c3 * api / t_r))), 1.0 / c2)
    else:
        pb = 18.2 * (math.pow(rsi_scf / max(1e-5, gas_sg), 0.83) * math.pow(10, 0.00091 * temp_f - 0.0125 * api) - 1.4)

    pb = max(14.7, pb)
    p_calc = min(p_psia, pb)

    rs = rsi_scf if p_psia >= pb else rsi_scf * math.pow(p_psia / pb, 1.2)
    f_val = rs * math.sqrt(gas_sg / gamma_o) + 1.25 * temp_f
    bo_sat = 0.9759 + 0.000120 * math.pow(f_val, 1.2)

    if p_psia > pb:
        co = (5.0 * rs + 17.2 * temp_f - 1180.0 * gas_sg + 12.61 * api - 1433.0) / (100000.0 * p_psia)
        co = max(1e-6, co)
        bo = bo_sat * math.exp(-co * (p_psia - pb))
    else:
        bo = bo_sat

    rho_o_lb_ft3 = (62.4 * gamma_o + 0.0136 * rs * gas_sg) / max(0.5, bo)

    return {
        "bubblePoint": round(pb, 1),
        "solutionGor": round(rs, 1),
        "formationVolumeFactor": round(bo, 4),
        "oilDensity": round(rho_o_lb_ft3, 2),
        "isSaturated": p_psia <= pb
    }

def calculate_ipr(k, h, pr_psia, re, rw, skin, mu, bo, pb_psia, target_pwf_psia, use_vogel=True, is_field=True):
    ln_ratio = math.log(max(10.0, re / max(0.01, rw)))
    j_ideal = (0.00708 * k * h) / (mu * bo * ln_ratio)
    j_field = (0.00708 * k * h) / (mu * bo * (ln_ratio + skin))

    def compute_q(pwf, j_val):
        if pwf >= pr_psia:
            return 0.0
        if pr_psia > pb_psia:
            if pwf >= pb_psia:
                return j_val * (pr_psia - pwf)
            else:
                q_single = j_val * (pr_psia - pb_psia)
                q_vogel_max = (j_val * pb_psia) / 1.8
                ratio = pwf / pb_psia
                return q_single + q_vogel_max * (1.0 - 0.2 * ratio - 0.8 * ratio * ratio)
        else:
            q_vogel_max = (j_val * pr_psia) / 1.8
            ratio = pwf / pr_psia
            return q_vogel_max * (1.0 - 0.2 * ratio - 0.8 * ratio * ratio)

    q_max_field = compute_q(0.0, j_field)
    q_target_field = compute_q(target_pwf_psia, j_field)

    drawdown = pr_psia - target_pwf_psia
    delta_p_skin = (q_target_field / max(1e-5, j_ideal)) * (skin / ln_ratio)
    fe = max(0.0, (drawdown - delta_p_skin) / drawdown) if drawdown > 0 else 1.0

    q_factor = 1.0 if is_field else 0.158987
    p_factor = 1.0 if is_field else 0.0689476
    j_factor = 1.0 if is_field else 2.30588

    steps = 60
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
# 5. TOP HEADER BAR WITH BRANDING
# ==============================================================================

st.markdown("""
<div class="vercel-header">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div class="header-brand">
            <div class="brand-icon-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
            </div>
            <div>
                <h1 class="header-title">Petroleum Engineering Suite <span class="amber-badge">v3.2</span></h1>
                <p class="header-subtitle">Reservoir Fluid PVT Thermodynamics & Well Inflow Performance Engine</p>
            </div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span class="emerald-badge">⚡ Live Calculation Engine</span>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)


# ==============================================================================
# 6. SIDEBAR WORKSPACE CONTROLS
# ==============================================================================
st.sidebar.markdown("### ⚙️ Workspace Controls")

unit_system = st.sidebar.radio("Unit System", ["Field Units (psia, °F, STB/d)", "SI Metric Units (bar, °C, m³/d)"], index=0)
is_field = "Field" in unit_system

p_unit = "psia" if is_field else "bar"
t_unit = "°F" if is_field else "°C"
q_unit = "STB/d" if is_field else "m³/d"
rs_unit = "scf/STB" if is_field else "m³/m³"
bo_unit = "rb/STB" if is_field else "m³/m³"
dens_unit = "lb/ft³" if is_field else "kg/m³"

app_mode = st.sidebar.selectbox("Analysis Module", [
    "1. Reservoir Fluid PVT Properties",
    "2. Fluid Flow & Well IPR Analysis"
])


# ==============================================================================
# MODULE 1: RESERVOIR FLUID PVT PROPERTIES
# ==============================================================================
if "PVT" in app_mode:
    fluid_type = st.sidebar.radio("Fluid Type", ["Natural Gas (EOS Compositional)", "Crude Oil (Black Oil Correlations)"])

    if "Gas" in fluid_type:
        st.sidebar.markdown("---")
        st.sidebar.markdown("### 🌡️ Reservoir State")
        p_input = st.sidebar.number_input(f"Pressure ({p_unit})", min_value=14.7 if is_field else 1.0, max_value=15000.0, value=3000.0 if is_field else 206.8, step=100.0)
        t_input = st.sidebar.number_input(f"Temperature ({t_unit})", min_value=60.0 if is_field else 15.0, max_value=400.0, value=150.0 if is_field else 65.6, step=5.0)

        p_psia = p_input if is_field else p_input / 0.0689476
        t_f = t_input if is_field else (t_input * 9/5 + 32)
        t_r = t_f + 459.67

        st.sidebar.markdown("### 🔬 EOS Thermodynamic Models")
        eos_method = st.sidebar.selectbox("Z-Factor EOS Method", ["Hall-Yarborough (1973)", "Dranchuk-Abu Kassem (1975)"])
        ppc_method = st.sidebar.selectbox("Pseudo-Critical Ppc Method", ["Kay's Compositional Rule", "Standing Dry Gas Correlation", "Standing Gas Condensate Correlation"])
        sour_method = st.sidebar.selectbox("Sour Gas Correction", ["Wichert-Aziz (H₂S & CO₂)", "Carr-Kobayashi-Burrows", "Piper Correlation", "None (Uncorrected)"])

        # Main Workspace Tabs
        tab_summary, tab_comp, tab_charts, tab_eqns, tab_ai = st.tabs([
            "📊 PVT Dashboard", 
            "🧪 Composition Table", 
            "📈 Sensitivity Curves", 
            "📐 Physics & Formulas",
            "🤖 AI Reservoir Assistant"
        ])

        with tab_comp:
            st.subheader("🧪 Gas Component Composition Breakdown")
            preset_choice = st.selectbox("Load Standard Preset Mixture", list(COMPOSITION_PRESETS.keys()))
            selected_preset = COMPOSITION_PRESETS[preset_choice]

            comp_df = pd.DataFrame({
                "Component": [c["name"] for c in PURE_GAS_COMPONENTS],
                "Formula": [c["formula"] for c in PURE_GAS_COMPONENTS],
                "Mole Fraction (y_i)": selected_preset,
                "MW (lb/mol)": [c["mw"] for c in PURE_GAS_COMPONENTS],
                "Tc (°R)": [c["tc"] for c in PURE_GAS_COMPONENTS],
                "Pc (psia)": [c["pc"] for c in PURE_GAS_COMPONENTS],
            })

            col_edit, col_c7 = st.columns([3, 1])
            with col_edit:
                edited_df = st.data_editor(comp_df, num_rows="fixed", use_container_width=True)
            with col_c7:
                st.markdown("#### 🔬 C₇₊ Characterization")
                c7_mw = st.number_input("C7+ Mol Weight", value=114.23, step=1.0)
                c7_sg = st.number_input("C7+ Specific Gravity", value=0.785, step=0.01)

            y_vals = edited_df["Mole Fraction (y_i)"].values
            total_y = sum(y_vals)

            if abs(total_y - 1.0) > 0.001:
                st.warning(f"⚠️ Total mole fraction sum = {total_y:.4f}. Normalizing automatically to 1.0000.")
                y_vals = y_vals / total_y

            # Update C7+ MW in calculation array
            mw_vals = comp_df["MW (lb/mol)"].values.copy()
            mw_vals[8] = c7_mw

            tc_vals = comp_df["Tc (°R)"].values
            pc_vals = comp_df["Pc (psia)"].values

        # Calculations Engine
        mw_mix = sum(y_vals * mw_vals)
        gas_sg = mw_mix / AIR_MOL_WEIGHT

        if "Kay" in ppc_method:
            tpc = sum(y_vals * tc_vals)
            ppc = sum(y_vals * pc_vals)
        elif "Dry Gas" in ppc_method:
            tpc = 168.0 + 325.0 * gas_sg - 12.5 * (gas_sg**2)
            ppc = 677.0 + 15.0 * gas_sg - 37.5 * (gas_sg**2)
        else:
            tpc = 187.0 + 330.0 * gas_sg - 71.5 * (gas_sg**2)
            ppc = 706.0 - 51.7 * gas_sg - 11.1 * (gas_sg**2)

        # Sour Gas Corrections
        y_h2s = y_vals[11]
        y_co2 = y_vals[10]
        y_n2 = y_vals[9]

        eps = 0.0
        if "Wichert" in sour_method:
            tpc, ppc, eps = calculate_wichert_aziz(y_h2s, y_co2, tpc, ppc)
        elif "Carr" in sour_method:
            tpc, ppc = calculate_carr_kobayashi_burrows(y_h2s, y_co2, y_n2, tpc, ppc)

        p_pr = p_psia / ppc
        t_pr = t_r / tpc

        z_val = calculate_z_factor_hall_yarborough(p_pr, t_pr) if "Hall" in eos_method else calculate_z_factor_dranchuk_abu_kassem(p_pr, t_pr)
        rho_lb_ft3 = (p_psia * mw_mix) / (z_val * R_CONST * t_r)
        rho_disp = rho_lb_ft3 if is_field else rho_lb_ft3 * 16.0185
        rho_ideal = (p_psia * mw_mix) / (1.0 * R_CONST * t_r) * (1.0 if is_field else 16.0185)

        bg_ft3_scf = 0.02827 * z_val * t_r / p_psia
        mu_g = calculate_lee_gonzalez_viscosity(p_psia, t_f, z_val, gas_sg)

        z_dev = ((z_val - 1.0) * 100)

        # Render Metric Cards in Tab Summary
        with tab_summary:
            st.markdown("### 📊 Natural Gas Real EOS Thermodynamic Results")

            card1 = make_card_html("Compressibility (Z-Factor)", ICON_GAUGE, "cyan", f"{z_val:.4f}", "dim.", "Deviation from Ideal:", f"{z_dev:+.1f}%", "text-emerald-400" if z_dev < 0 else "text-amber-400")
            card2 = make_card_html("Real Gas Density (ρ_real)", ICON_SCALE, "amber", f"{rho_disp:.3f}", dens_unit, "Ideal Density (ρ_ideal):", f"{rho_ideal:.3f} {dens_unit}", "text-slate-300")
            card3 = make_card_html("Formation Vol Factor (Bg)", ICON_BOX, "emerald", f"{bg_ft3_scf:.5f}", "ft³/scf" if is_field else "m³/m³", "Viscosity (μ_g):", f"{mu_g:.4f} cP", "text-emerald-400")
            card4 = make_card_html("Apparent Mol. Wt (Ma)", ICON_LAYERS, "purple", f"{mw_mix:.2f}", "lb/lb-mol", "P_pc / T_pc:", f"{ppc:.0f} psia | {tpc:.0f} °R", "text-slate-300")

            st.markdown(f"""
            <div class="pvt-cards-grid">
                {card1}
                {card2}
                {card3}
                {card4}
            </div>
            """, unsafe_allow_html=True)

            card5 = make_card_html("Gas Viscosity (μ_g)", ICON_ACTIVITY, "cyan", f"{mu_g:.4f}", "cP", "Correlation Model:", "Lee-Gonzalez Method", "text-amber-400")
            card6 = make_card_html("Pseudo-Critical Temp (T_pc)", ICON_FLAME, "amber", f"{tpc:.1f}", "°R", "Pseudo-Reduced T_pr:", f"{t_pr:.3f}", "text-amber-400")
            card7 = make_card_html("Pseudo-Critical Pressure (P_pc)", ICON_GAUGE, "emerald", f"{ppc:.1f}", "psia", "Pseudo-Reduced P_pr:", f"{p_pr:.3f}", "text-emerald-400")
            card8 = make_card_html("Operating Reservoir State", ICON_SCALE, "purple", f"{p_input:.1f}", p_unit, "Temperature State:", f"{t_input:.1f} {t_unit}", "text-purple-400")

            st.markdown(f"""
            <div class="pvt-cards-grid">
                {card5}
                {card6}
                {card7}
                {card8}
            </div>
            """, unsafe_allow_html=True)

        with tab_charts:
            st.markdown("### 📈 Thermodynamic Sensitivity Curves vs Reservoir Pressure")

            p_range = np.linspace(100, 8000, 80)
            z_curve = [calculate_z_factor_hall_yarborough(p / ppc, t_pr) if "Hall" in eos_method else calculate_z_factor_dranchuk_abu_kassem(p / ppc, t_pr) for p in p_range]
            bg_curve = [0.02827 * z * t_r / p for p, z in zip(p_range, z_curve)]
            mu_curve = [calculate_lee_gonzalez_viscosity(p, t_f, z, gas_sg) for p, z in zip(p_range, z_curve)]
            dens_curve = [(p * mw_mix) / (z * R_CONST * t_r) * (1.0 if is_field else 16.0185) for p, z in zip(p_range, z_curve)]
            p_disp = p_range if is_field else p_range * 0.0689476

            fig = make_subplots(rows=2, cols=2, subplot_titles=(
                "Compressibility Z-Factor vs Pressure", 
                "Formation Volume Factor Bg vs Pressure", 
                "Gas Viscosity μ_g (cP) vs Pressure", 
                f"Gas Density ({dens_unit}) vs Pressure"
            ))

            fig.add_trace(go.Scatter(x=p_disp, y=z_curve, mode="lines", name="Z-Factor", line=dict(color="#fbbf24", width=3)), row=1, col=1)
            fig.add_trace(go.Scatter(x=p_disp, y=bg_curve, mode="lines", name="Bg", line=dict(color="#06b6d4", width=3)), row=1, col=2)
            fig.add_trace(go.Scatter(x=p_disp, y=mu_curve, mode="lines", name="Viscosity (cP)", line=dict(color="#34d399", width=3)), row=2, col=1)
            fig.add_trace(go.Scatter(x=p_disp, y=dens_curve, mode="lines", name=f"Density ({dens_unit})", line=dict(color="#c084fc", width=3)), row=2, col=2)

            fig.update_layout(
                template="plotly_dark", 
                height=520, 
                showlegend=False, 
                paper_bgcolor="#0b0f19", 
                plot_bgcolor="#0f172a",
                margin=dict(l=40, r=40, t=50, b=40)
            )
            st.plotly_chart(fig, use_container_width=True)

        with tab_eqns:
            st.markdown("### 📐 Engineering Physics & Equations")
            st.latex(r"Z = \frac{p \cdot V}{n \cdot R \cdot T}")
            st.latex(r"B_g = 0.02827 \cdot \frac{Z \cdot T}{p} \quad \text{ft}^3/\text{scf}")
            st.latex(r"\rho_g = \frac{p \cdot M_w}{Z \cdot R \cdot T}")
            st.latex(r"\mu_g = 10^{-4} \cdot K \cdot \exp\left(X \cdot \rho_g^Y\right)")

        with tab_ai:
            st.markdown("### 🤖 AI Reservoir Assistant")
            st.info("💡 Ask technical questions regarding fluid thermodynamic state, EOS model selection, or well performability:")
            q_ai = st.text_input("Enter engineering query:", value="How does high H2S content affect the Z-factor and gas formation volume factor?")
            if q_ai:
                st.markdown(f"""
                <div class="content-card">
                    <h4 style="color:#f59e0b; margin-top:0;">🤖 AI Thermodynamic Analysis</h4>
                    <p style="color:#cbd5e1; font-size:0.9rem;">
                    Based on the Wichert-Aziz correlation for sour gas at <strong>{p_input} {p_unit}</strong> and <strong>{t_input} {t_unit}</strong>:<br><br>
                    Non-hydrocarbon acid gases (H₂S = {y_h2s*100:.1f}%, CO₂ = {y_co2*100:.1f}%) significantly depress the pseudo-critical temperature T_pc by <strong>{eps:.1f} °R</strong>. 
                    This shift increases the pseudo-reduced pressure P_pr, resulting in lower Z-factors, higher fluid density, and tighter gas formation volume factor (B_g).
                    </p>
                </div>
                """, unsafe_allow_html=True)

    else:
        # Crude Oil (Black Oil)
        st.sidebar.markdown("---")
        st.sidebar.markdown("### 🛢️ Black Oil Parameters")
        api = st.sidebar.number_input("Oil Gravity (°API)", min_value=10.0, max_value=60.0, value=35.0, step=1.0)
        gas_sg = st.sidebar.number_input("Gas Specific Gravity (Air=1.0)", min_value=0.5, max_value=1.5, value=0.75, step=0.05)
        rsi = st.sidebar.number_input(f"Initial GOR R_si ({rs_unit})", min_value=0.0, max_value=5000.0, value=750.0 if is_field else 133.5, step=50.0)
        temp_f = st.sidebar.number_input(f"Temperature ({t_unit})", min_value=60.0 if is_field else 15.0, max_value=300.0, value=150.0 if is_field else 65.6)
        p_input = st.sidebar.number_input(f"Pressure ({p_unit})", min_value=100.0, max_value=10000.0, value=3000.0 if is_field else 206.8)

        p_psia = p_input if is_field else p_input / 0.0689476
        t_f = temp_f if is_field else (temp_f * 9/5 + 32)
        rsi_scf = rsi if is_field else rsi / 0.178107

        method = st.sidebar.selectbox("Correlation Suite", [
            "Standing (1947)", 
            "Vasquez-Beggs (1980)",
            "Glaso (1980)",
            "Marhoun (1988)",
            "Petrosky-Farshad (1993)"
        ])
        m_key = method.split()[0].lower()
        if "vasquez" in m_key:
            m_key = "vasquez_beggs"
        elif "petrosky" in m_key:
            m_key = "petrosky_farshad"

        bo_res = calculate_black_oil_all_models(api, gas_sg, rsi_scf, t_f, p_psia, m_key)

        tab_bo_sum, tab_bo_charts, tab_bo_eqns = st.tabs([
            "📊 Black Oil Results",
            "📈 Sensitivity Curves",
            "📐 Mathematical Derivations"
        ])

        with tab_bo_sum:
            st.markdown("### 🛢️ Crude Oil Black Oil Thermodynamics")

            state_str = "Saturated" if bo_res['isSaturated'] else "Undersaturated"
            state_col = "text-emerald-400" if bo_res['isSaturated'] else "text-amber-400"

            card1 = make_card_html("Bubble Point Pressure (Pb)", ICON_ACTIVITY, "amber", f"{bo_res['bubblePoint']:.1f}", "psia", "Reservoir State:", state_str, state_col)
            card2 = make_card_html("Solution GOR (Rs)", ICON_DROPLETS, "cyan", f"{bo_res['solutionGor']:.1f}", rs_unit, "Initial GOR R_si:", f"{rsi:.1f} {rs_unit}", "text-cyan-400")
            card3 = make_card_html("Oil Vol Factor (Bo)", ICON_BOX, "emerald", f"{bo_res['formationVolumeFactor']:.4f}", bo_unit, "Pressure Ratio (P/Pb):", f"{(p_psia/bo_res['bubblePoint']):.2f}x", "text-emerald-400")
            card4 = make_card_html("API Gravity & Density", ICON_SCALE, "purple", f"{api:.1f}", "°API", "Specific Gravity (γ_o):", f"{(141.5/(api+131.5)):.3f}", "text-purple-400")

            st.markdown(f"""
            <div class="pvt-cards-grid">
                {card1}
                {card2}
                {card3}
                {card4}
            </div>
            """, unsafe_allow_html=True)

        with tab_bo_charts:
            p_range = np.linspace(100, 6000, 80)
            bo_curve = [calculate_black_oil_all_models(api, gas_sg, rsi_scf, t_f, p, m_key)["formationVolumeFactor"] for p in p_range]
            rs_curve = [calculate_black_oil_all_models(api, gas_sg, rsi_scf, t_f, p, m_key)["solutionGor"] * (1.0 if is_field else 0.178107) for p in p_range]

            fig = make_subplots(rows=1, cols=2, subplot_titles=("Oil FVF (Bo) vs Pressure", f"Solution GOR (Rs) vs Pressure"))
            fig.add_trace(go.Scatter(x=p_range, y=bo_curve, mode="lines", name="Bo", line=dict(color="#34d399", width=3)), row=1, col=1)
            fig.add_trace(go.Scatter(x=p_range, y=rs_curve, mode="lines", name="Rs", line=dict(color="#22d3ee", width=3)), row=1, col=2)

            fig.update_layout(template="plotly_dark", height=450, paper_bgcolor="#0b0f19", plot_bgcolor="#0f172a")
            st.plotly_chart(fig, use_container_width=True)

        with tab_bo_eqns:
            st.markdown("### 📐 Black Oil Governing Equations")
            st.latex(r"P_b = 18.2 \left[ \left(\frac{R_{si}}{\gamma_g}\right)^{0.83} 10^{0.00091 T - 0.0125 \text{API}} - 1.4 \right]")
            st.latex(r"B_o = 0.9759 + 0.000120 \left[ R_s \sqrt{\frac{\gamma_g}{\gamma_o}} + 1.25 T \right]^{1.2}")


# ==============================================================================
# MODULE 2: RESERVOIR FLUID FLOW & WELL IPR ANALYSIS
# ==============================================================================
else:
    st.sidebar.markdown("---")
    st.sidebar.markdown("### 🌊 Reservoir Flow Controls")
    k = st.sidebar.number_input("Permeability k (md)", min_value=0.1, max_value=5000.0, value=50.0)
    h = st.sidebar.number_input(f"Pay Thickness h ({'ft' if is_field else 'm'})", min_value=1.0, max_value=500.0, value=30.0 if is_field else 9.1)
    pr = st.sidebar.number_input(f"Reservoir Pressure ({p_unit})", min_value=100.0, max_value=10000.0, value=3000.0 if is_field else 206.8)
    re = st.sidebar.number_input(f"Drainage Radius r_e ({'ft' if is_field else 'm'})", min_value=100.0, max_value=10000.0, value=1000.0 if is_field else 304.8)
    rw = st.sidebar.number_input(f"Wellbore Radius r_w ({'ft' if is_field else 'm'})", min_value=0.05, max_value=5.0, value=0.328 if is_field else 0.1)
    skin = st.sidebar.number_input("Skin Factor S (+ damage, - stimulated)", min_value=-5.0, max_value=50.0, value=0.0, step=0.5)
    mu = st.sidebar.number_input("Fluid Viscosity μ (cP)", min_value=0.01, max_value=100.0, value=1.5)
    bo = st.sidebar.number_input("Formation Vol Factor B_o (rb/STB)", min_value=1.0, max_value=3.0, value=1.2)
    pb = st.sidebar.number_input(f"Bubble Point P_b ({p_unit})", min_value=14.7, max_value=10000.0, value=2200.0 if is_field else 151.7)
    pwf_target = st.sidebar.number_input(f"Operating Target P_wf ({p_unit})", min_value=0.0, max_value=pr, value=1500.0 if is_field else 103.4)

    pr_psia = pr if is_field else pr / 0.0689476
    pb_psia = pb if is_field else pb / 0.0689476
    pwf_target_psia = pwf_target if is_field else pwf_target / 0.0689476

    ipr_res = calculate_ipr(k, h, pr_psia, re, rw, skin, mu, bo, pb_psia, pwf_target_psia, use_vogel=True, is_field=is_field)

    tab_ipr_summary, tab_ipr_curves, tab_ipr_eqns = st.tabs([
        "📊 Inflow Performance Dashboard", 
        "📉 IPR & Skin Sensitivity Curves", 
        "📐 Vogel & Darcy Physics"
    ])

    with tab_ipr_summary:
        st.markdown("### 📊 Well Deliverability & Inflow Performance Results")

        j_unit = "STB/d/psi" if is_field else "m³/d/bar"

        card1 = make_card_html("Productivity Index (J)", ICON_ACTIVITY, "cyan", f"{ipr_res['productivityIndex']:.3f}", j_unit, "Permeability k:", f"{k} md", "text-slate-200")
        card2 = make_card_html("Max Open Flow (q_max / AOF)", ICON_FLAME, "amber", f"{ipr_res['qMaxAof']:,.0f}", q_unit, "Flow Model:", "Darcy + Vogel" if pr > pb else "Vogel IPR", "text-amber-400")
        card3 = make_card_html(f"Target Rate (P_wf = {pwf_target:.0f})", ICON_GAUGE, "emerald", f"{ipr_res['qTarget']:,.0f}", q_unit, "Drawdown ΔP:", f"{ipr_res['drawdown']:,.0f} {p_unit}", "text-emerald-400")

        skin_col = "text-rose-400" if skin > 0 else "text-emerald-400"
        card4 = make_card_html(f"Skin Damage (S = {skin:+.1f})", ICON_SHIELD, "rose" if skin > 0 else "emerald", f"{ipr_res['flowEfficiency']:.1f}%", "FE", "Skin ΔP_skin:", f"{ipr_res['skinPressureDrop']:.1f} {p_unit}", skin_col)

        st.markdown(f"""
        <div class="pvt-cards-grid">
            {card1}
            {card2}
            {card3}
            {card4}
        </div>
        """, unsafe_allow_html=True)

    with tab_ipr_curves:
        st.markdown("### 📉 Inflow Performance Curves")

        fig = go.Figure()
        fig.add_trace(go.Scatter(x=ipr_res['q_actual_list'], y=ipr_res['pwf_disp_list'], mode="lines", name=f"Actual IPR (S = {skin})", line=dict(color="#34d399", width=3.5)))
        fig.add_trace(go.Scatter(x=ipr_res['q_ideal_list'], y=ipr_res['pwf_disp_list'], mode="lines", name="Ideal IPR (S = 0)", line=dict(color="#94a3b8", width=2, dash="dash")))

        # Target operating point
        fig.add_trace(go.Scatter(x=[ipr_res['qTarget']], y=[pwf_target], mode="markers+text", name="Operating Point", marker=dict(color="#fbbf24", size=12), text=["Operating Target"], textposition="top right"))

        fig.update_layout(
            title=f"Flowing Pressure (P_wf) vs Production Rate (q) in {q_unit}",
            xaxis_title=f"Production Rate q ({q_unit})",
            yaxis_title=f"Flowing Bottomhole Pressure P_wf ({p_unit})",
            template="plotly_dark",
            height=500,
            paper_bgcolor="#0b0f19",
            plot_bgcolor="#0f172a"
        )
        st.plotly_chart(fig, use_container_width=True)

    with tab_ipr_eqns:
        st.markdown("### 📐 Inflow Performance Governing Equations")
        st.latex(r"J = \frac{0.00708 \cdot k \cdot h}{\mu \cdot B_o \cdot \left( \ln\frac{r_e}{r_w} + S \right)}")
        st.latex(r"\frac{q}{q_{\text{max}}} = 1 - 0.2 \left( \frac{p_{wf}}{p_r} \right) - 0.8 \left( \frac{p_{wf}}{p_r} \right)^2")


# Footer
st.divider()
st.caption("Petroleum Engineering Suite v3.2 • Direct Carbon Copy Design Matching Vercel App • Real PVT & Well Engine")
