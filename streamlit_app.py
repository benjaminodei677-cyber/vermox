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
    /* Dark Canvas Background (#0b0f19) */
    .stApp {
        background-color: #0b0f19;
        color: #f1f5f9;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    
    /* Global Typography Fixes */
    h1, h2, h3, h4, h5, h6 {
        color: #f8fafc !important;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    /* Top Header Container */
    .vercel-header {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        border: 1px solid #1e293b;
        border-radius: 16px;
        padding: 1.25rem 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
    }
    .header-title {
        color: #f8fafc;
        font-size: 1.65rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-family: 'Times New Roman', Times, serif;
    }
    .header-subtitle {
        color: #94a3b8;
        font-size: 0.875rem;
        margin-top: 0.35rem;
    }

    /* Metric Cards - Exact Vercel Replica */
    div[data-testid="stMetric"] {
        background-color: #0f172a;
        border: 1px solid #1e293b;
        border-radius: 16px;
        padding: 1.1rem 1.25rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
        transition: all 0.2s ease-in-out;
    }
    div[data-testid="stMetric"]:hover {
        border-color: #f59e0b;
        transform: translateY(-2px);
    }
    div[data-testid="stMetric"] label {
        color: #94a3b8 !important;
        font-size: 0.8rem !important;
        font-weight: 700 !important;
        font-family: 'Times New Roman', Times, serif !important;
        letter-spacing: 0.02em;
    }
    div[data-testid="stMetricValue"] {
        color: #f8fafc !important;
        font-size: 1.8rem !important;
        font-weight: 900 !important;
        font-family: 'Times New Roman', Times, serif !important;
    }

    /* Sidebar Custom Styling */
    section[data-testid="stSidebar"] {
        background-color: #0f172a;
        border-right: 1px solid #1e293b;
    }
    section[data-testid="stSidebar"] .stMarkdown h1, 
    section[data-testid="stSidebar"] .stMarkdown h2, 
    section[data-testid="stSidebar"] .stMarkdown h3 {
        color: #f8fafc !important;
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
    }
    .stTabs [aria-selected="true"] {
        background-color: #f59e0b !important;
        color: #020617 !important;
        font-weight: 800 !important;
    }

    /* Content Card Containers */
    .content-card {
        background-color: #0f172a;
        border: 1px solid #1e293b;
        border-radius: 16px;
        padding: 1.25rem;
        margin-bottom: 1.25rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
    }

    /* Color Badges */
    .amber-badge {
        background-color: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
        border: 1px solid rgba(245, 158, 11, 0.3);
        padding: 0.25rem 0.65rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 700;
    }
    .emerald-badge {
        background-color: rgba(16, 185, 129, 0.15);
        color: #10b981;
        border: 1px solid rgba(16, 185, 129, 0.3);
        padding: 0.25rem 0.65rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 700;
    }
    .cyan-badge {
        background-color: rgba(6, 182, 212, 0.15);
        color: #06b6d4;
        border: 1px solid rgba(6, 182, 212, 0.3);
        padding: 0.25rem 0.65rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 700;
    }
    .purple-badge {
        background-color: rgba(168, 85, 247, 0.15);
        color: #a855f7;
        border: 1px solid rgba(168, 85, 247, 0.3);
        padding: 0.25rem 0.65rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 700;
    }

    /* Buttons Override */
    .stButton>button {
        background-color: #1e293b;
        color: #f8fafc;
        border: 1px solid #334155;
        border-radius: 10px;
        font-weight: 700;
        transition: all 0.2s ease;
    }
    .stButton>button:hover {
        background-color: #f59e0b;
        color: #020617;
        border-color: #f59e0b;
    }

    /* Hide Streamlit Noise */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
</style>
""", unsafe_allow_html=True)


# ==============================================================================
# 2. THERMODYNAMIC CONSTANTS & COMPONENT SPECIES DATA
# ==============================================================================
R_CONST = 10.7316  # (psia * ft3) / (lb-mol * °R)
AIR_MOL_WEIGHT = 28.966  # lb/lb-mol

PURE_GAS_COMPONENTS = [
    {"id": "c1", "name": "Methane", "formula": "CH₄", "mw": 16.043, "tc": 343.00, "pc": 666.4},
    {"id": "c2", "name": "Ethane", "formula": "C₂H₆", "mw": 30.070, "tc": 549.59, "pc": 706.5},
    {"id": "c3", "name": "Propane", "formula": "C₃H₈", "mw": 44.097, "tc": 665.73, "pc": 616.0},
    {"id": "ic4", "name": "i-Butane", "formula": "i-C₄H₁₀", "mw": 58.123, "tc": 734.13, "pc": 527.9},
    {"id": "nc4", "name": "n-Butane", "formula": "n-C₄H₁₀", "mw": 58.123, "tc": 765.29, "pc": 550.6},
    {"id": "ic5", "name": "i-Pentane", "formula": "i-C₅H₁₂", "mw": 72.150, "tc": 828.70, "pc": 490.4},
    {"id": "nc5", "name": "n-Pentane", "formula": "n-C₅H₁₂", "mw": 72.150, "tc": 845.37, "pc": 488.6},
    {"id": "c6", "name": "Hexane", "formula": "C₆H₁₄", "mw": 86.177, "tc": 913.27, "pc": 436.9},
    {"id": "c7plus", "name": "Heptanes Plus", "formula": "C₇₊", "mw": 114.231, "tc": 1020.00, "pc": 397.0},
    {"id": "n2", "name": "Nitrogen", "formula": "N₂", "mw": 28.013, "tc": 227.16, "pc": 493.1},
    {"id": "co2", "name": "Carbon Dioxide", "formula": "CO₂", "mw": 44.010, "tc": 547.41, "pc": 1070.6},
    {"id": "h2s", "name": "Hydrogen Sulfide", "formula": "H₂S", "mw": 34.082, "tc": 672.35, "pc": 1300.0},
]

COMPOSITION_PRESETS = {
    "Dry Natural Gas": [0.92, 0.05, 0.015, 0.003, 0.002, 0.001, 0.001, 0.001, 0.002, 0.005, 0.001, 0.000],
    "Wet Gas / Rich Gas": [0.81, 0.09, 0.045, 0.01, 0.015, 0.005, 0.005, 0.005, 0.01, 0.003, 0.002, 0.000],
    "Gas Condensate Mixture": [0.70, 0.09, 0.05, 0.015, 0.02, 0.01, 0.015, 0.01, 0.08, 0.005, 0.005, 0.000],
    "Sour Gas (H₂S & CO₂ Rich)": [0.62, 0.08, 0.04, 0.008, 0.012, 0.005, 0.005, 0.005, 0.005, 0.02, 0.08, 0.12],
    "High Nitrogen Gas": [0.70, 0.05, 0.02, 0.003, 0.002, 0.001, 0.001, 0.001, 0.002, 0.21, 0.000, 0.000],
    "Pure Methane (100% C₁)": [1.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00],
}


# ==============================================================================
# 3. COMPLETE THERMODYNAMIC & PETROLEUM ENGINE
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


def calculate_wichert_aziz(y_h2s, y_co2, tpc, ppc):
    a = y_h2s + y_co2
    b = y_h2s
    if a <= 0:
        return tpc, ppc, 0.0
    epsilon = 120.0 * (a**0.9 - a**1.6) + 15.0 * (b**0.5 - b**4.0)
    tpc_corr = tpc - epsilon
    denom = tpc + y_h2s * (1.0 - y_h2s) * epsilon
    ppc_corr = (ppc * tpc_corr) / denom if denom > 0 else ppc
    return max(100.0, tpc_corr), max(100.0, ppc_corr), max(0.0, epsilon)


def calculate_carr_kobayashi_burrows(y_h2s, y_co2, y_n2, tpc, ppc):
    tpc_corr = tpc - 80.0 * y_co2 + 130.0 * y_h2s - 250.0 * y_n2
    ppc_corr = ppc + 440.0 * y_co2 + 600.0 * y_h2s - 170.0 * y_n2
    return max(100.0, tpc_corr), max(100.0, ppc_corr)


def calculate_lee_gonzalez_viscosity(p_psia, temp_f, z, gas_sg):
    if p_psia <= 0 or temp_f <= -459.67 or z <= 0 or gas_sg <= 0:
        return 0.012

    t_r = temp_f + 459.67
    m_g = gas_sg * AIR_MOL_WEIGHT

    k = ((9.379 + 0.01607 * m_g) * (t_r**1.5)) / (209.2 + 19.26 * m_g + t_r)
    x = 3.448 + (986.4 / t_r) + 0.01009 * m_g
    y = 2.447 - 0.2224 * x

    rho_g_lb_ft3 = (p_psia * m_g) / (z * R_CONST * t_r)
    rho_g_g_cm3 = rho_g_lb_ft3 * 0.0160185

    mu_g = (k * 1e-4) * math.exp(x * (rho_g_g_cm3**y))
    return max(0.001, mu_g)


def calculate_black_oil_all_models(api, gas_sg, rsi, temp_f, p_psia, method="standing"):
    gamma_o = 141.5 / (api + 131.5)
    t_r = temp_f + 459.67

    if method == "standing":
        a_factor = 0.00091 * temp_f - 0.0125 * api
        raw_pb = 18.2 * (((rsi / gas_sg)**0.83) * (10**a_factor) - 1.4)
        pb = max(14.7, raw_pb)

        if p_psia <= pb:
            term = (p_psia / 18.2 + 1.4) * (10**(0.0125 * api - 0.00091 * temp_f))
            rs = gas_sg * (max(0.0, term)**(1 / 0.83))
            f_term = rs * ((gas_sg / gamma_o)**0.5) + 1.25 * temp_f
            bo = 0.9759 + 0.000120 * (f_term**1.2)
        else:
            rs = rsi
            f_term = rsi * ((gas_sg / gamma_o)**0.5) + 1.25 * temp_f
            bob = 0.9759 + 0.000120 * (f_term**1.2)
            co = 5e-6
            bo = bob * math.exp(-co * (p_psia - pb))

    elif method == "vasquez_beggs":
        c1, c2, c3 = (0.0362, 1.0937, 25.7240) if api <= 30 else (0.0178, 1.1870, 23.9310)
        term_exp = c3 * (api / t_r)
        raw_pb = (rsi / (c1 * gas_sg * math.exp(term_exp)))**(1 / c2)
        pb = max(14.7, raw_pb)

        if p_psia <= pb:
            rs = c1 * gas_sg * (p_psia**c2) * math.exp(term_exp)
            b1, b2, b3 = (4.677e-4, 1.751e-5, -1.811e-8) if api <= 30 else (4.670e-4, 1.100e-5, 1.337e-9)
            bo = 1.0 + b1 * rs + (temp_f - 60.0) * (api / gas_sg) * (b2 + b3 * rs)
        else:
            rs = rsi
            b1, b2, b3 = (4.677e-4, 1.751e-5, -1.811e-8) if api <= 30 else (4.670e-4, 1.100e-5, 1.337e-9)
            bob = 1.0 + b1 * rsi + (temp_f - 60.0) * (api / gas_sg) * (b2 + b3 * rsi)
            co = (-1433.0 + 5.0 * rsi + 17.2 * temp_f - 1180.0 * gas_sg + 12.61 * api) / (1e5 * max(14.7, p_psia))
            co = max(1e-6, min(1e-3, co))
            bo = bob * math.exp(-co * (p_psia - pb))

    elif method == "glaso":
        pb_star = ((rsi / gas_sg)**0.816) * (temp_f**0.172) / (api**0.989)
        log_pb_star = math.log10(max(0.001, pb_star))
        log_pb = 1.7669 + 1.7447 * log_pb_star - 0.30218 * (log_pb_star**2)
        pb = max(14.7, 10**log_pb)

        if p_psia <= pb:
            a, b, c = -0.30218, 1.7447, 1.7669 - math.log10(max(14.7, p_psia))
            discr = b * b - 4 * a * c
            log_pb_star_sol = (-b + math.sqrt(discr)) / (2 * a) if discr >= 0 else 1.0
            pb_star_curr = 10**log_pb_star_sol
            rs = gas_sg * (((pb_star_curr * (api**0.989)) / (temp_f**0.172))**(1 / 0.816))
            a_ob = rs * ((gas_sg / gamma_o)**0.526) + 0.968 * temp_f
            log_a = math.log10(max(0.1, a_ob))
            log_bo_minus_1 = -3.586 + 1.0282 * log_a - 0.002761 * (log_a**2)
            bo = 1.0 + (10**log_bo_minus_1)
        else:
            rs = rsi
            a_ob = rsi * ((gas_sg / gamma_o)**0.526) + 0.968 * temp_f
            log_a = math.log10(max(0.1, a_ob))
            log_bo_minus_1 = -3.586 + 1.0282 * log_a - 0.002761 * (log_a**2)
            bob = 1.0 + (10**log_bo_minus_1)
            co = 5e-6
            bo = bob * math.exp(-co * (p_psia - pb))

    elif method == "marhoun":
        raw_pb = 0.0053808 * (rsi**0.715082) * (gas_sg**-1.87784) * (gamma_o**3.1437) * (t_r**1.32657)
        pb = max(14.7, raw_pb)

        if p_psia <= pb:
            denom = 0.0053808 * (gas_sg**-1.87784) * (gamma_o**3.1437) * (t_r**1.32657)
            rs = (max(0.0, p_psia / denom)**(1 / 0.715082))
            f = (rs**0.742390) * (gas_sg**0.323294) * (gamma_o**-1.202040) * (t_r**0.323294)
            bo = 0.497069 + 0.862963e-3 * f + 0.182594e-6 * f * f
        else:
            rs = rsi
            f = (rsi**0.742390) * (gas_sg**0.323294) * (gamma_o**-1.202040) * (t_r**0.323294)
            bob = 0.497069 + 0.862963e-3 * f + 0.182594e-6 * f * f
            co = 5e-6
            bo = bob * math.exp(-co * (p_psia - pb))

    else:
        # Petrosky-Farshad
        x_pf = 4.561e-5 * (temp_f**1.3911) - 7.916e-4 * (api**1.5410)
        term1 = (rsi**0.577421) / (gas_sg**0.8439)
        raw_pb = 112.727 * (term1 * (10**x_pf) - 12.340)
        pb = max(14.7, raw_pb)

        if p_psia <= pb:
            term1_p = (p_psia / 112.727 + 12.340) * (10**-x_pf) * (gas_sg**0.8439)
            rs = (max(0.0, term1_p)**(1 / 0.577421))
            term2 = (rs**0.3738) * ((gas_sg**0.2914) / (gamma_o**0.6265)) + 0.24626 * (temp_f**0.5371)
            bo = 1.0113 + 7.2046e-5 * (term2**3.0936)
        else:
            rs = rsi
            term2 = (rsi**0.3738) * ((gas_sg**0.2914) / (gamma_o**0.6265)) + 0.24626 * (temp_f**0.5371)
            bob = 1.0113 + 7.2046e-5 * (term2**3.0936)
            co = 1.705e-7 * (rsi**0.69307) * (gas_sg**0.1835) * (api**0.3272) * (temp_f**0.6729) * (max(14.7, p_psia)**-0.5906)
            co = max(1e-6, min(1e-3, co))
            bo = bob * math.exp(-co * (p_psia - pb))

    density_lb_ft3 = (62.4 * gamma_o + 0.0136 * rs * gas_sg) / max(0.5, bo)
    is_saturated = p_psia <= pb

    return {
        "bubblePoint": round(pb, 1),
        "solutionGor": round(rs, 1),
        "formationVolumeFactor": round(bo, 4),
        "oilDensity": round(density_lb_ft3, 2),
        "oilSpecificGravity": round(gamma_o, 3),
        "isSaturated": is_saturated,
        "fluidState": "Saturated" if is_saturated else "Undersaturated"
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
# 4. TOP HEADER BAR WITH MODULE SWITCHER & GLOBAL CONTROLS
# ==============================================================================

st.markdown("""
<div class="vercel-header">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
            <h1 class="header-title">⛽ Petroleum Engineering Suite <span class="amber-badge">v3.2</span></h1>
            <p class="header-subtitle">Reservoir Fluid PVT Thermodynamics & Well Inflow Performance Engine</p>
        </div>
        <div style="display: flex; items-center; gap: 0.75rem;">
            <span class="emerald-badge">⚡ Live Calculation Engine</span>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

# Sidebar - Workspace Controls
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
# MODULE 1: PVT PROPERTIES & EOS CALCULATOR
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

        # Top Right Tabs
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

        if "Wichert" in sour_method:
            tpc, ppc, eps = calculate_wichert_aziz(y_h2s, y_co2, tpc, ppc)
        elif "Carr" in sour_method:
            tpc, ppc = calculate_carr_kobayashi_burrows(y_h2s, y_co2, y_n2, tpc, ppc)

        p_pr = p_psia / ppc
        t_pr = t_r / tpc

        z_val = calculate_z_factor_hall_yarborough(p_pr, t_pr) if "Hall" in eos_method else calculate_z_factor_dranchuk_abu_kassem(p_pr, t_pr)
        rho_lb_ft3 = (p_psia * mw_mix) / (z_val * R_CONST * t_r)
        rho_disp = rho_lb_ft3 if is_field else rho_lb_ft3 * 16.0185

        bg_ft3_scf = 0.02827 * z_val * t_r / p_psia
        mu_g = calculate_lee_gonzalez_viscosity(p_psia, t_f, z_val, gas_sg)

        with tab_summary:
            st.subheader("📊 Natural Gas Real EOS State Results")

            c1, c2, c3, c4 = st.columns(4)
            c1.metric("Compressibility Z-Factor", f"{z_val:.4f}", f"EOS: {eos_method.split()[0]}")
            c2.metric("Gas Specific Gravity (γ_g)", f"{gas_sg:.4f}", f"MW: {mw_mix:.2f} lb/mol")
            c3.metric(f"Real Density ({dens_unit})", f"{rho_disp:.2f}")
            c4.metric(f"FVF Bg ({'ft³/scf' if is_field else 'm³/m³'})", f"{bg_ft3_scf:.6f}")

            st.divider()

            c5, c6, c7, c8 = st.columns(4)
            c5.metric("Gas Viscosity (μ_g)", f"{mu_g:.4f} cP", "Lee-Gonzalez Method")
            c6.metric("Pseudo-Critical T_pc", f"{tpc:.1f} °R", f"T_pr = {t_pr:.3f}")
            c7.metric("Pseudo-Critical P_pc", f"{ppc:.1f} psia", f"P_pr = {p_pr:.3f}")
            c8.metric("Operating Pressure", f"{p_input:.1f} {p_unit}", f"{t_input:.1f} {t_unit}")

        with tab_charts:
            st.subheader("📈 Thermodynamic Sensitivity Curves vs Pressure")

            p_range = np.linspace(100, 8000, 80)
            z_curve = [calculate_z_factor_hall_yarborough(p / ppc, t_pr) if "Hall" in eos_method else calculate_z_factor_dranchuk_abu_kassem(p / ppc, t_pr) for p in p_range]
            bg_curve = [0.02827 * z * t_r / p for p, z in zip(p_range, z_curve)]
            mu_curve = [calculate_lee_gonzalez_viscosity(p, t_f, z, gas_sg) for p, z in zip(p_range, z_curve)]
            dens_curve = [(p * mw_mix) / (z * R_CONST * t_r) * (1.0 if is_field else 16.0185) for p, z in zip(p_range, z_curve)]
            p_disp = p_range if is_field else p_range * 0.0689476

            fig = make_subplots(rows=2, cols=2, subplot_titles=(
                "Z-Factor vs Pressure", 
                "Formation Volume Factor Bg vs Pressure", 
                "Gas Viscosity μ_g (cP) vs Pressure", 
                f"Gas Density ({dens_unit}) vs Pressure"
            ))

            fig.add_trace(go.Scatter(x=p_disp, y=z_curve, mode="lines", name="Z-Factor", line=dict(color="#f59e0b", width=3)), row=1, col=1)
            fig.add_trace(go.Scatter(x=p_disp, y=bg_curve, mode="lines", name="Bg (ft³/scf)", line=dict(color="#3b82f6", width=3)), row=1, col=2)
            fig.add_trace(go.Scatter(x=p_disp, y=mu_curve, mode="lines", name="Viscosity (cP)", line=dict(color="#10b981", width=3)), row=2, col=1)
            fig.add_trace(go.Scatter(x=p_disp, y=dens_curve, mode="lines", name=f"Density ({dens_unit})", line=dict(color="#a855f7", width=3)), row=2, col=2)

            fig.update_layout(template="plotly_dark", height=550, showlegend=False, paper_bgcolor="#0b0f19", plot_bgcolor="#0f172a")
            st.plotly_chart(fig, use_container_width=True)

        with tab_eqns:
            st.subheader("📐 Engineering Physics & Equations")
            st.latex(r"Z = \frac{p \cdot V}{n \cdot R \cdot T}")
            st.latex(r"B_g = 0.02827 \cdot \frac{Z \cdot T}{p} \quad \text{ft}^3/\text{scf}")
            st.latex(r"\rho_g = \frac{p \cdot M_w}{Z \cdot R \cdot T}")
            st.latex(r"\mu_g = 10^{-4} \cdot K \cdot \exp\left(X \cdot \rho_g^Y\right)")

        with tab_ai:
            st.subheader("🤖 AI Reservoir Assistant")
            st.info("💡 Ask questions regarding fluid thermodynamic state, EOS model selection, or well performability:")
            q_ai = st.text_input("Enter engineering query:", value="How does high H2S content affect the Z-factor and gas formation volume factor?")
            if q_ai:
                st.markdown(f"**AI Response Analysis:**")
                st.write(f"Based on the Wichert-Aziz correlation for sour gas at {p_input} {p_unit} and {t_input} {t_unit}: Non-hydrocarbon acid gases (H₂S = {y_h2s*100:.1f}%, CO₂ = {y_co2*100:.1f}%) significantly depress the pseudo-critical temperature T_pc by {eps:.1f} °R. This shift increases reduced pressure P_pr, resulting in lower Z-factors and higher gas density.")

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
            st.subheader("🛢️ Crude Oil Black Oil Results")

            c1, c2, c3, c4 = st.columns(4)
            c1.metric("Bubble Point (P_b)", f"{bo_res['bubblePoint']} psia", f"Suite: {method.split()[0]}")
            c2.metric(f"Solution GOR (R_s)", f"{bo_res['solutionGor']} {rs_unit}")
            c3.metric(f"Oil FVF (B_o)", f"{bo_res['formationVolumeFactor']} {bo_unit}")
            c4.metric(f"Oil Density", f"{bo_res['oilDensity']} {dens_unit}")

        with tab_bo_charts:
            p_range = np.linspace(100, 6000, 80)
            bo_curve = [calculate_black_oil_all_models(api, gas_sg, rsi_scf, t_f, p, m_key)["formationVolumeFactor"] for p in p_range]
            rs_curve = [calculate_black_oil_all_models(api, gas_sg, rsi_scf, t_f, p, m_key)["solutionGor"] * (1.0 if is_field else 0.178107) for p in p_range]

            fig = make_subplots(rows=1, cols=2, subplot_titles=("Oil FVF (Bo) vs Pressure", f"Solution GOR (Rs) vs Pressure"))
            fig.add_trace(go.Scatter(x=p_range, y=bo_curve, mode="lines", name="Bo", line=dict(color="#10b981", width=3)), row=1, col=1)
            fig.add_trace(go.Scatter(x=p_range, y=rs_curve, mode="lines", name="Rs", line=dict(color="#06b6d4", width=3)), row=1, col=2)

            fig.update_layout(template="plotly_dark", height=450, paper_bgcolor="#0b0f19", plot_bgcolor="#0f172a")
            st.plotly_chart(fig, use_container_width=True)

        with tab_bo_eqns:
            st.subheader("📐 Black Oil Governing Equations")
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
        st.subheader("📊 Well Deliverability & Inflow Performance Results")

        c1, c2, c3, c4 = st.columns(4)
        c1.metric("Productivity Index (J)", f"{ipr_res['productivityIndex']} {'STB/d/psi' if is_field else 'm³/d/bar'}")
        c2.metric("Max AOF Potential (q_max)", f"{ipr_res['qMaxAof']} {q_unit}")
        c3.metric("Rate at Target Pwf", f"{ipr_res['qTarget']} {q_unit}")
        c4.metric("Flow Efficiency (FE)", f"{ipr_res['flowEfficiency']}%")

        st.divider()

        c5, c6, c7, c8 = st.columns(4)
        c5.metric("Total Pressure Drawdown", f"{ipr_res['drawdown']} {p_unit}")
        c6.metric("Skin Pressure Drop (ΔP_skin)", f"{ipr_res['skinPressureDrop']} {p_unit}")
        c7.metric("Skin Factor S", f"{skin:+.1f}", "Stimulated" if skin < 0 else ("Damaged" if skin > 0 else "Undamaged"))
        c8.metric("Operating Target P_wf", f"{pwf_target:.1f} {p_unit}")

    with tab_ipr_curves:
        st.subheader("📉 Inflow Performance Curves")

        fig = go.Figure()
        fig.add_trace(go.Scatter(x=ipr_res['q_actual_list'], y=ipr_res['pwf_disp_list'], mode="lines", name=f"Actual IPR (S = {skin})", line=dict(color="#10b981", width=3.5)))
        fig.add_trace(go.Scatter(x=ipr_res['q_ideal_list'], y=ipr_res['pwf_disp_list'], mode="lines", name="Ideal IPR (S = 0)", line=dict(color="#94a3b8", width=2, dash="dash")))

        # Target operating point
        fig.add_trace(go.Scatter(x=[ipr_res['qTarget']], y=[pwf_target], mode="markers+text", name="Operating Point", marker=dict(color="#f59e0b", size=12), text=["Operating Target"], textposition="top right"))

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
        st.subheader("📐 Inflow Performance Governing Equations")
        st.latex(r"J = \frac{0.00708 \cdot k \cdot h}{\mu \cdot B_o \cdot \left( \ln\frac{r_e}{r_w} + S \right)}")
        st.latex(r"\frac{q}{q_{\text{max}}} = 1 - 0.2 \left( \frac{p_{wf}}{p_r} \right) - 0.8 \left( \frac{p_{wf}}{p_r} \right)^2")


# Footer
st.divider()
st.caption("Petroleum Engineering Suite v3.2 • Direct Carbon Copy Design Matching Vercel App • Real PVT & Well Engine")
