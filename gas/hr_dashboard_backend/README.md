# Google Apps Script Web App Backend for HR Dashboard

This directory contains the Google Apps Script (GAS) Web App source code that serves as the backend for the CSI HR Applicant Response Portal. It interacts directly with the Google Sheets database (supporting separate environments for Test and Production) and exposes REST-like endpoints for pagination, search, track filtering, credentials verification, and cascading row deletions.

## Deployment Instructions

### 1. Create a Google Apps Script Project
1. Open the target Google Sheet:
   - **Test Sheet**: ``
   - **Prod Sheet**: ``
2. In the menu, go to **Extensions** > **Apps Script**.
3. Clear any existing template code and paste the contents of `Code.js`.

### 2. Configure Environment variables and Secrets
You can secure the backend by setting a custom security secret:
1. In the Apps Script editor, click on the **Gear icon (Project Settings)** in the left sidebar.
2. Scroll down to **Script Properties** and click **Edit script properties**.
3. Add a property with:
   - **Property**: `SPREADSHEET_SECRET`
   - **Value**: Your custom secret key (e.g. `your-secure-vercel-token`)
4. In `Code.js`, make sure to toggle:
   - `var IS_DEVELOPMENT = true;` (For Test Sheet)
   - `var IS_DEVELOPMENT = false;` (For Prod Sheet)

### 3. Deploy the Web App
1. In the top right of the Apps Script editor, click **Deploy** > **New deployment**.
2. Click the **Gear icon (Select type)** and select **Web app**.
3. Enter a description (e.g., `CSI HR Backend App v1.0`).
4. Set the configuration:
   - **Execute as**: `Me (your-email@domain.com)`
   - **Who has access**: `Anyone`
5. Click **Deploy**.
6. Copy the **Web App URL** (e.g., `https://script.google.com/macros/s/AKfycbz.../exec`). This is your API Endpoint URL.

---

## API Endpoints Reference

All requests must supply the secret key using the query parameter or POST body field `secret`, `key`, or `apiKey`.

### 1. Get Applicants List (GET)
Returns a paginated list of `ApplicantSummary` records and their matching `ApplicantDetail` objects.

- **URL**: `https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec`
- **Method**: `GET`
- **Query Parameters**:
  - `secret`: `csi-hr-portal-secure-token-2026` (or your custom secret)
  - `action`: `list` (optional, default)
  - `page`: `1` (optional, default: 1)
  - `limit`: `20` (optional, default: 20)
  - `search`: `John` (optional, searches ID, Full Name, Email, or Position)
  - `supervisory`: `true` or `false` (optional, filters by supervisory test track)

#### Example Response (200 OK)
```json
{
  "success": true,
  "status": 200,
  "data": [
    {
      "id": "8a8d8eed-1600-41fa-9023-b7a687df816d",
      "metadata": {
        "timestamp": "2026-07-08T10:15:00.000Z",
        "supervisoryTest": false,
        "emailAddress": "john.doe@example.com",
        "fullName": "John Doe",
        "age": 28,
        "education": "Bachelor of Science in Information Technology",
        "contactNumber": "+1 (555) 019-2834",
        "company": "CSI"
      },
      "intent": {
        "positionAppliedFor": "Senior Software Engineer",
        "date": "2026-07-08"
      },
      "scores": {
        "cfit": "Below Average",
        "comprehension": "Below Average",
        "planning": "Below Average",
        "supervisoryTotalEvaluation": "Below Average"
      }
    }
  ],
  "details": {
    "8a8d8eed-1600-41fa-9023-b7a687df816d": {
      "id": "8a8d8eed-1600-41fa-9023-b7a687df816d",
      "detailed16pf": {
        "emotionalStability": "Below Average",
        "senseOfResponsibility": "Below Average",
        "conscientiousness": "Below Average",
        "assertiveness": "Below Average",
        "confidence": "Below Average",
        "flexibility": "Below Average",
        "openMindedness": "Below Average",
        "selfReliance": "Below Average",
        "sociability": "Below Average",
        "trustAcceptance": "Below Average",
        "objectivity": "Below Average",
        "optimismLiveliness": "Low Average"
      },
      "supervisory": {
        "management": "Below Average",
        "supervision": "Below Average",
        "employeeRelations": "Below Average",
        "humanRelationsPractices": "Low Average"
      },
      "mentalAbility": "The candidate demonstrates...",
      "supervisoryIndexesAI": {
        "index1Assessment": "",
        "index2Assessment": "",
        "index3Assessment": "",
        "index4Assessment": ""
      },
      "overAllAssessment": "",
      "aiGenPersonalityAssessment": "The candidate...",
      "allTestTimeConsumed": {
        "cfitTestTime": {
          "test1": { "consumedTime": "1m 32s", "timeFrame": "3 mins", "testAnswered": 1, "testItem": 13 }
        }
      }
    }
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalCount": 1,
    "totalPages": 1
  }
}
```

---

### 2. Get Single Applicant Detail (GET)
Fetches detailed info for a single applicant.

- **URL**: `https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec`
- **Method**: `GET`
- **Query Parameters**:
  - `secret`: `csi-hr-portal-secure-token-2026`
  - `action`: `get`
  - `id`: `8a8d8eed-1600-41fa-9023-b7a687df816d`

---

### 3. Delete Applicant (POST)
Performs cascading deletion across all sheets.

- **URL**: `https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec?secret=csi-hr-portal-secure-token-2026`
- **Method**: `POST`
- **Body (JSON)**:
```json
{
  "action": "delete",
  "id": "8a8d8eed-1600-41fa-9023-b7a687df816d"
}
```
- **Response**:
```json
{
  "success": true,
  "status": 200,
  "deletedCount": 13
}
```

---

### 4. Basic Login Validation (POST)
Validates a dashboard username and password. This looks up credentials in a sheet tab named `Credentials` or `Users` containing columns for `Username` (or `Email`) and `Password` (or `Pass`). Passwords can be stored in the sheet as plain text or SHA-256 hashes.

- **URL**: `https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec?secret=csi-hr-portal-secure-token-2026`
- **Method**: `POST`
- **Body (JSON)**:
```json
{
  "action": "login",
  "username": "admin@csi.com",
  "password": "mySecurePassword"
}
```
- **Response**:
```json
{
  "success": true,
  "status": 200
}
```
*(If credentials don't match, returns `{ "success": false, "status": 200 }`)*.

---

## Postman Testing Tips

1. **Follow Redirects**: Google Apps Script redirects Web App responses with HTTP `302 Found`. In Postman, ensure "Follow Redirects" is enabled in settings (it is enabled by default).
2. **Method Override**: Since GAS only processes `GET` and `POST`, always use `GET` (for listing and single fetch) or `POST` (for delete and login). Specify the operation in the body/query parameters (`action=delete`).
3. **CORS Options**: Local web environments should connect through server-side functions (like Next.js API/Vercel Edge functions) or pass standard query params.
