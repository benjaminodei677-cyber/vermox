import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI Client
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    return new GoogleGenAI({ apiKey });
  };

  // API Route for Reservoir Fluid Analysis Insights
  app.post('/api/ai-insights', async (req, res) => {
    try {
      const { fluidType = 'gas', pressure, temperature, ma, sg, zFactor, realDensity, idealDensity, bg, viscosity, compositionSummary, isSourGas, apiGravity, gasSg, solutionGorInit, currentRs, bo, pb, fluidState } = req.body;

      const ai = getGeminiClient();
      
      let prompt = '';

      if (fluidType === 'oil') {
        prompt = `You are an expert Petroleum Reservoir Engineer and Black Oil PVT Specialist.
Analyze the following Crude Oil reservoir fluid properties calculated using Standing's Empirical Correlations:

- Fluid Type: Crude Oil (Black Oil Empirical Model)
- Reservoir Pressure: ${pressure} psia
- Reservoir Temperature: ${temperature} °F
- Stock Tank Oil Gravity: ${apiGravity} °API
- Solution Gas Gravity (Air = 1.0): ${gasSg}
- Initial Solution GOR (R_si): ${solutionGorInit} scf/STB
- Current Solution GOR (R_s): ${currentRs} scf/STB
- Bubble Point Pressure (p_b): ${pb} psia
- Oil Formation Volume Factor (B_o): ${bo} rb/STB
- Thermodynamic Fluid State: ${fluidState}

Provide a concise, highly professional 4-section Black Oil Reservoir Engineering Brief:
1. **Crude Oil Classification & State**: Classify this oil (Heavy, Medium, Light, Volatile, Black Oil) with technical justification based on API gravity, GOR, and bubble point pressure compared to current reservoir pressure (${pressure} psia).
2. **Volumetric & Phase Behavior**: Explain the phase status (${fluidState}) and how pressure depletion will impact oil shrinkage (B_o) and gas liberation (R_s).
3. **Primary Drive Mechanisms**: Analyze expected primary production performance (Undersaturated oil expansion drive vs. Solution gas drive / Gas cap drive).
4. **Production Engineering & Artificial Lift**: Recommend field strategies regarding artificial lift selection (ESP, Rod Pump, Gas Lift) and flow assurance (asphaltene precipitation, paraffin wax deposition, pressure maintenance via water injection).

Format cleanly in structured Markdown with bold headers and bullet points. Keep it clear, rigorous, and directly applicable to petroleum reservoir management.`;
      } else {
        prompt = `You are an expert Petroleum Reservoir Engineer and PVT Fluid Specialist.
Analyze the following reservoir gas mixture and calculated thermodynamic properties:

- Reservoir Pressure: ${pressure} psia
- Reservoir Temperature: ${temperature} °F
- Apparent Molecular Weight (Ma): ${ma} lb/lb-mol
- Gas Specific Gravity (Air = 1.0): ${sg}
- Z-Factor (Hall-Yarborough): ${zFactor}
- Real Gas Density: ${realDensity} lb/ft³
- Ideal Gas Density: ${idealDensity} lb/ft³
- Gas Formation Volume Factor (Bg): ${bg} ft³/scf
- Gas Viscosity: ${viscosity} cP
- Sour Gas Correction Applied: ${isSourGas ? 'Yes (Wichert-Aziz Method)' : 'No'}
- Gas Composition Summary:
${JSON.stringify(compositionSummary, null, 2)}

Provide a concise, highly professional 4-section Reservoir Engineering Brief:
1. **Fluid Type & Classification**: Classify this gas mixture (Dry Gas, Wet Gas, Retrograde Condensate, Sour Gas, etc.) with technical justification based on molecular weight, heavy fractions, and pseudo-critical properties.
2. **Thermodynamic Behavior**: Discuss the real gas deviation (Z-factor impact) under these current P & T conditions compared to ideal behavior.
3. **Flow Assurance & Production Hazards**: Highlight potential operational risks such as gas hydrate formation, scaling, CO2 corrosion, or H2S toxicity/sour gas handling requirements.
4. **Reservoir Management Recommendation**: Provide 2 practical recommendations for field development or processing plant design (e.g., glycol dehydration, amine sweetening, dew-point control).

Format cleanly in structured Markdown with bold headers and bullet points. Keep it clear, rigorous, and directly applicable to petroleum engineering.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      res.json({
        success: true,
        text: response.text
      });
    } catch (error: any) {
      console.error('Error generating AI reservoir insight:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate reservoir insight.'
      });
    }
  });


  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Vite middleware for dev mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Reservoir Fluid Calculator server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
