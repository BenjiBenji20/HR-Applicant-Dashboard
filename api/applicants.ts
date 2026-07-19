import { Request, Response } from "express";

export default async function handler(req: Request, res: Response) {
  // Allow cross-origin requests for local testing if needed
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
    // =========================================================================
    // GET PROXY (List & Get details)
    // =========================================================================
    if (req.method === "GET") {
      // Forward all incoming query parameters and append the hidden GAS secret
      const queryParams = new URLSearchParams(req.query as any);
      queryParams.set("secret", gasSecret);
      
      const targetUrl = `${gasUrl}?${queryParams.toString()}`;
      const response = await fetch(targetUrl, { method: "GET" });

      if (!response.ok) {
        throw new Error(`Google Apps Script responded with HTTP error status: ${response.status}`);
      }

      const result = await response.json();
      return res.status(200).json(result);
    }

    // =========================================================================
    // POST PROXY (Login & any other secure actions)
    // =========================================================================
    if (req.method === "POST") {
      const action = req.query.action || req.body.action || "";
      const targetUrl = `${gasUrl}?secret=${gasSecret}&action=${action}`;

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

    return res.status(455).json({ error: "HTTP Method Not Supported" });
  } catch (error: any) {
    console.error("Serverless proxy handler error:", error);
    return res.status(500).json({ error: error.message || "Failed to contact Google Apps Script database" });
  }
}
