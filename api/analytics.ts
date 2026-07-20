import { Request, Response } from "express";

export default async function handler(req: Request, res: Response) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const gasUrl = process.env.GAS_WEB_APP_URL;
  const gasSecret = process.env.GAS_SECRET || "csi-hr-portal-secure-token-2026";

  if (!gasUrl) {
    return res.status(500).json({ error: "GAS_WEB_APP_URL environment variable is not configured on the server." });
  }

  try {
    const queryParams = new URLSearchParams(req.query as any);
    queryParams.set("secret", gasSecret);
    if (!queryParams.has("action")) {
      queryParams.set("action", "analytics");
    }

    const targetUrl = `${gasUrl}?${queryParams.toString()}`;
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: { "Content-Type": "application/json" },
      body: req.method === "POST" ? JSON.stringify(req.body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Google Apps Script responded with HTTP error status: ${response.status}`);
    }

    const result = await response.json();
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Analytics serverless proxy handler error:", error);
    return res.status(500).json({ error: error.message || "Failed to contact Google Apps Script database" });
  }
}
