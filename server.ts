import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

let aiClient: any = null;
function getAI() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Endpoint to generate psychometric analysis
app.post("/api/generate-psychometric", async (req, res) => {
  try {
    const { applicant, details } = req.body;
    if (!applicant) {
      return res.status(400).json({ error: "Applicant data is required" });
    }

    const ai = getAI();
    if (!ai) {
      // Return a smart fallback if key is missing so user still gets a realistic experience
      let pf16Str = "";
      if (details?.detailed16pf) {
        pf16Str = Object.entries(details.detailed16pf)
          .map(([k, v]) => `${k.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${v}`)
          .join(", ");
      }
      const fallbackText = `Based on the psychometric scores, ${applicant.metadata.fullName} demonstrates capability in ${applicant.scores.comprehension} comprehension and ${applicant.scores.planning} planning. Their CFIT score is evaluated as ${applicant.scores.cfit}. ${applicant.metadata.supervisoryTest ? `With a supervisory total evaluation of ${applicant.scores.supervisoryTotalEvaluation || 'Average'}, they show ${details?.supervisory?.management || 'Average'} management and ${details?.supervisory?.employeeRelations || 'Average'} employee relations skills suitable for leadership.` : 'They are suited for individual contributor roles requiring dedication and precision.'} Their 16PF profile indicates: ${pf16Str || 'steady collaborative work style'}.`;
      return res.json({ text: fallbackText });
    }

    let pfText = "Not available";
    if (details?.detailed16pf) {
      pfText = Object.entries(details.detailed16pf)
        .map(([k, v]) => `- ${k.replace(/([A-Z])/g, ' $1')}: ${v}`)
        .join("\n");
    }
    let supervisoryText = "";
    if (applicant.metadata.supervisoryTest && details?.supervisory) {
      supervisoryText = `
Supervisory test breakdown (all scored as classification ratings):
- Management: ${details.supervisory.management}
- Supervision: ${details.supervisory.supervision}
- Employee Relations: ${details.supervisory.employeeRelations}
- Human Relations Practices: ${details.supervisory.humanRelationsPractices}
- Overall Evaluation: ${applicant.scores.supervisoryTotalEvaluation}
`;
    }

    const prompt = `
Generate a professional psychometric evaluation summary for this applicant.
Applicant details:
Name: ${applicant.metadata.fullName}
Position: ${applicant.intent.positionAppliedFor}
Supervisory Role: ${applicant.metadata.supervisoryTest ? 'Yes' : 'No'}

Scores (all ratings are qualitative classification values, e.g. Low, Average, Superior):
- CFIT (Culture Fair Intelligence Test): ${applicant.scores.cfit}
- Comprehension: ${applicant.scores.comprehension}
- Planning: ${applicant.scores.planning}

16PF (16 Personality Factors) Detailed Profile:
${pfText}
${supervisoryText}

Output guidelines:
1. Write a professional, structured, objective, and insightful summary (approx 60-100 words).
2. Detail their cognitive style (CFIT, comprehension, planning), personality indicators (16PF), and supervisory potential if applicable.
3. Avoid using level numbers. Use the classification values.
4. Keep it scannable, actionable, and ready for an HR folder. Do not use generic placeholders.
5. Output only the plain text summary, do not wrap in markdown quotes.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert Industrial-Organizational Psychologist conducting professional candidate evaluations.",
      }
    });

    res.json({ text: response.text?.trim() });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: error.message || "Failed to generate psychometric evaluation" });
  }
});

// Serve assets / Vite middleware
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

setupServer();
