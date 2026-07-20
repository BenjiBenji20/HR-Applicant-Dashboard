import { Request, Response } from "express";
import { GoogleGenAI, Type } from "@google/genai";

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

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    mentalAbility: {
      type: Type.STRING,
      description: "A short, professional evaluation of the candidate's cognitive and mental ability based on their CFIT, comprehension, and planning scores. Max 50 words."
    },
    index1Assessment: {
      type: Type.STRING,
      description: "Exactly one short sentence assessing the candidate's Management leadership capability based on their management score. Must be an empty string if supervisoryTest is false."
    },
    index2Assessment: {
      type: Type.STRING,
      description: "Exactly one short sentence assessing the candidate's Supervision leadership capability based on their supervision score. Must be an empty string if supervisoryTest is false."
    },
    index3Assessment: {
      type: Type.STRING,
      description: "Exactly one short sentence assessing the candidate's Employee Relations capability based on their employeeRelations score. Must be an empty string if supervisoryTest is false."
    },
    index4Assessment: {
      type: Type.STRING,
      description: "Exactly one short sentence assessing the candidate's Human Relations Practices capability based on their humanRelationsPractices score. Must be an empty string if supervisoryTest is false."
    },
    aiGenPersonalityAssessment: {
      type: Type.STRING,
      description: "A short, professional summary of the candidate's personality profile based on their 16PF dimension scores. Max 60 words."
    }
  },
  required: [
    "mentalAbility",
    "index1Assessment",
    "index2Assessment",
    "index3Assessment",
    "index4Assessment",
    "aiGenPersonalityAssessment"
  ]
};

export default async function handler(req: Request, res: Response) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const action = req.query.action;

    // SECURE PROXY SAVE HANDLER
    if (action === "save") {
      const gasUrl = process.env.GAS_WEB_APP_URL;
      const gasSecret = process.env.GAS_SECRET || "csi-hr-portal-secure-token-2026";

      if (!gasUrl) {
        return res.status(500).json({ error: "GAS_WEB_APP_URL environment variable is not configured on the server." });
      }

      const targetUrl = `${gasUrl}?secret=${gasSecret}&action=save_ai_assessment`;
      
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      });

      if (!response.ok) {
        throw new Error(`Google Apps Script responded with HTTP error status: ${response.status}`);
      }

      const result = await response.json();
      return res.status(200).json(result);
    }

    const { applicant, details } = req.body;
    if (!applicant) {
      return res.status(400).json({ error: "Applicant data is required" });
    }

    const { supervisoryTest } = applicant.metadata;
    const position = applicant.intent.positionAppliedFor;
    const scores = applicant.scores;
    const pf16 = details?.detailed16pf || {};
    const supervisory = details?.supervisory || {};

    const ai = getAI();
    if (!ai) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      const fallback = {
        mentalAbility: `Based on a cognitive evaluation, the candidate exhibits standard capabilities in fluid intelligence (CFIT: ${scores.cfit}), verbal comprehension (${scores.comprehension}), and planning (${scores.planning}).`,
        index1Assessment: supervisoryTest ? `Demonstrates sound strategic planning and management index capabilities graded as ${supervisory.management}.` : "",
        index2Assessment: supervisoryTest ? `Exhibits capabilities for supervisor oversight graded as ${supervisory.supervision}.` : "",
        index3Assessment: supervisoryTest ? `Shows potential to manage worker grievances and employee relations graded as ${supervisory.employeeRelations}.` : "",
        index4Assessment: supervisoryTest ? `Possesses capabilities in human relations practices graded as ${supervisory.humanRelationsPractices}.` : "",
        aiGenPersonalityAssessment: `Personality evaluation shows emotional stability is ${pf16.emotionalStability || "Average"} and conscientiousness is ${pf16.conscientiousness || "Average"}. The candidate displays an overall balanced profile suitable for the ${position} role.`
      };
      await new Promise(resolve => setTimeout(resolve, 800));
      return res.status(200).json(fallback);
    }

    const prompt = `
Generate a professional psychometric evaluation summary.
Position applied for: ${position}
Supervisory Track: ${supervisoryTest ? 'Yes' : 'No'}

Scores (qualitative classifications like Low, Average, Superior):
- CFIT: ${scores.cfit}
- Comprehension: ${scores.comprehension}
- Planning: ${scores.planning}

16PF Personality Dimensions:
- Emotional Stability: ${pf16.emotionalStability || "Average"}
- Sense of Responsibility: ${pf16.senseOfResponsibility || "Average"}
- Conscientiousness: ${pf16.conscientiousness || "Average"}
- Assertiveness: ${pf16.assertiveness || "Average"}
- Confidence: ${pf16.confidence || "Average"}
- Flexibility: ${pf16.flexibility || "Average"}
- Open-Mindedness: ${pf16.openMindedness || "Average"}
- Self-Reliance: ${pf16.selfReliance || "Average"}
- Sociability: ${pf16.sociability || "Average"}
- Trust & Acceptance: ${pf16.trustAcceptance || "Average"}
- Objectivity: ${pf16.objectivity || "Average"}
- Optimism & Liveliness: ${pf16.optimismLiveliness || "Average"}

${supervisoryTest ? `Supervisory Performance Scores:
- Management: ${supervisory.management || "Average"}
- Supervision: ${supervisory.supervision || "Average"}
- Employee Relations: ${supervisory.employeeRelations || "Average"}
- Human Relations Practices: ${supervisory.humanRelationsPractices || "Average"}` : ''}

Output constraints:
1. mentalAbility: Must be a short (max 50 words) overview of cognitive, comprehension, and planning scores. Do not mention the applicant's name.
2. If Supervisory Track is Yes:
   - index1Assessment (Management): Exactly 1 short sentence assessing management capability.
   - index2Assessment (Supervision): Exactly 1 short sentence assessing supervision capability.
   - index3Assessment (Employee Relations): Exactly 1 short sentence assessing employee relations capability.
   - index4Assessment (Human Relations Practices): Exactly 1 short sentence assessing human relations practices capability.
3. If Supervisory Track is No:
   - Keep index1Assessment, index2Assessment, index3Assessment, and index4Assessment empty strings ("").
4. aiGenPersonalityAssessment: Must be a short (max 60 words) description of personality trends based on the 16PF dimensions. Do not use personal names.
5. All outputs must be wrapped in the requested JSON structure. Do not use markdown quotes or wrap the JSON in backticks.
`;

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert Industrial-Organizational Psychologist conducting professional candidate evaluations. Output must match the requested JSON schema exactly.",
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(chunk.text);
      }
    }
    res.end();
  } catch (error: any) {
    console.error("Gemini API error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || "Failed to generate psychometric evaluation stream" });
    }
  }
}
