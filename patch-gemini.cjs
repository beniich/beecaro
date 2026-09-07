const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const importGemini = `import { GoogleGenAI } from "@google/genai";\n`;
if (!code.includes('@google/genai')) {
  code = importGemini + code;
}

const geminiRoute = `
app.post("/api/gemini/analyze", async (req, res) => {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    
    const { prompt, systemInstruction } = req.body;
    
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || "You are an AI system core.",
      }
    });
    
    res.json({ text: response.text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message });
  }
});
`;

if (!code.includes('/api/gemini/analyze')) {
  code = code.replace('app.get("/api/health"', geminiRoute + '\n  app.get("/api/health"');
}

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts with Gemini API");
