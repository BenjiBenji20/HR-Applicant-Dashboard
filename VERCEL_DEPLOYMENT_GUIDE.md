# Production Vercel Deployment & Security Configuration Guide

This guide details how to deploy the HR Applicant Dashboard to **Vercel** as a serverless web application, configure serverless API proxies, and set up security controls for Google Apps Script (GAS), Google Gemini AI, and Google Sheets.

---

## Architecture Overview

```
┌─────────────────────────────────┐
│     Client (React SPA)          │
└────────────────┬────────────────┘
                 │ (Internal API calls: /api/*)
                 ▼
┌─────────────────────────────────┐
│  Vercel Serverless Functions    │
│  - /api/applicants              │
│  - /api/analytics               │
│  - /api/generate-psychometric   │
└────────┬────────────────┬───────┘
         │                │
 (Server Proxy)     (Streaming API)
         │                │
         ▼                ▼
┌────────────────┐  ┌─────────────┐
│  Google Apps   │  │   Google    │
│    Script      │  │   Gemini    │
│  (GAS WebApp)  │  │   AI API    │
└────────┬───────┘  └─────────────┘
         │
         ▼
┌────────────────┐
│  Google Sheets │
└────────────────┘
```

---

## 1. Environment Variables Configuration

Set up the following environment variables in your **Vercel Project Settings** under **Environment Variables** (and locally in `.env`):

| Variable Name | Purpose | Example Value |
| :--- | :--- | :--- |
| `GAS_WEB_APP_URL` | Deployed Google Apps Script Web App URL | `https://script.google.com/macros/s/AKfycb.../exec` |
| `GAS_SECRET` | Secret authentication key shared between Vercel & GAS | `csi-hr-portal-secure-token-2026` |
| `GEMINI_API_KEY` | Google Gemini AI API key | `AIzaSy...` |

---

## 2. Vercel Project Deployment Setup

1. **Connect Repository to Vercel**:
   - Import the repository in [Vercel Dashboard](https://vercel.com/dashboard).

2. **Build Settings**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build` (`vite build && esbuild server.ts ...`)
   - **Output Directory**: `dist`

3. **Vercel Config (`vercel.json`)**:
   The `vercel.json` file in the project root rewrites `/api/*` requests to serverless function handlers and routes all client routes to `/index.html` for single-page routing:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite",
     "rewrites": [
       { "source": "/api/(.*)", "destination": "/api/$1" },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

---

## 3. Google Apps Script (GAS) Security Configuration

### A. Deploy Web App
1. Open your Google Apps Script project containing `Code.js`, `AiAssessment.js`, `Analytics.js`, and `EmploymentForm.js`.
2. Click **Deploy** > **New deployment**.
3. Select type: **Web App**.
4. Configure Deployment Settings:
   - **Description**: `CSI HR Applicant Dashboard Production API`
   - **Execute as**: `Me` (your Google Account)
   - **Who has access**: `Anyone` (Access control is secured via `SECRET_KEY`)
5. Copy the Web App URL and set it as `GAS_WEB_APP_URL` in Vercel.

### B. Configure Script Properties (Security Keys & Spreadsheet IDs)
In Google Apps Script, go to **Project Settings (Gear Icon)** > **Script Properties** and add the following keys:

| Property | Value Description |
| :--- | :--- |
| `SECRET_KEY` | Must match `GAS_SECRET` configured in Vercel (`csi-hr-portal-secure-token-2026`) |
| `IS_DEVELOPMENT` | Set to `false` for Production (`true` for staging/test spreadsheet testing) |
| `TEST_SPREADSHEET_ID` | Test Google Sheet ID for main applicants database (`Final Result` tab) |
| `PROD_SPREADSHEET_ID` | Production Google Sheet ID for main applicants database (`Final Result` tab) |
| `TEST_ANALYTICS_SPREADSHEET_ID` | Test Google Sheet ID for analytics data (`Application Summary` tab) |
| `PROD_ANALYTICS_SPREADSHEET_ID` | Production Google Sheet ID for analytics data (`Application Summary` tab) |

---

## 4. Security Controls & Best Practices Checklist

- [x] **No API Key Leakage**: Neither `GEMINI_API_KEY` nor `GAS_SECRET` are included in front-end bundle JavaScript. All requests go through serverless proxy endpoints in `/api`.
- [x] **Request Authentication**: GAS `doGet`/`doPost` checks `checkAuth(e)` against `SECRET_KEY` before reading/writing data.
- [x] **CORS & Origin Headers**: Vercel serverless handlers control CORS headers (`Access-Control-Allow-Origin`).
- [x] **Input Validation**: Search queries and applicant IDs are sanitized and passed securely.
- [x] **Fallback Protection**: Gemini API requests include safe fallback responses if the AI service key is unconfigured or rate-limited.
