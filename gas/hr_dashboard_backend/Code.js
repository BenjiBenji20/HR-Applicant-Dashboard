/**
 * HR Applicant Dashboard Backend
 * Google Apps Script Web App Endpoint
 *
 * Configures REST-like endpoints to query, filter, search, and delete
 * applicant data across multiple spreadsheet tabs to maintain database sync.
 */

// =========================================================================
// CONFIGURATION
// =========================================================================

// Toggle between Test (true) and Prod (false) environments
var IS_DEVELOPMENT = true;

// Authentication secret key. If present in Script Properties under SPREADSHEET_SECRET,
// it will override this default value. Keep this secure.
var scriptProperties = PropertiesService.getScriptProperties();

var SECRET_KEY = scriptProperties.getProperty('SECRET_KEY');

// Spreadsheet IDs
var TEST_SPREADSHEET_ID = scriptProperties.getProperty('TEST_SPREADSHEET_ID');
var PROD_SPREADSHEET_ID = scriptProperties.getProperty('PROD_SPREADSHEET_ID');

// Main data tab configuration
var TAB_NAME = "Final Result";
var COLUMN_ROW = 2; // Row where column headers are located (1-based)
var START_ROW = 3;  // Row where applicant records begin (1-based)

// Valid classifications
var classifications = [
  'Low',
  'Below Average',
  'Low Average',
  'Average',
  'High Average',
  'Above Average',
  'Superior'
];

// =========================================================================
// EVENT ROUTERS (GET & POST)
// =========================================================================

/**
 * Handles HTTP GET requests.
 * Query Parameters:
 * - action: "list" (default) or "get"
 * - secret/key/apiKey: Authentication token
 * - page: Current page (default: 1)
 * - limit: Number of rows per page (default: 20)
 * - search: Search text for matching ID, Full Name, Email, or Position
 * - supervisory: Filter by supervisory track (Yes/No, true/false)
 * - id: Specific applicant ID for "get" action
 */
function doGet(e) {
  try {
    if (!checkAuth(e)) {
      return respondJson({ success: false, error: "Unauthorized" }, 401);
    }

    var action = e.parameter.action;
    if (!action) {
      action = e.parameter.id ? "get" : "list";
    }

    if (action === "list") {
      return handleList(e);
    } else if (action === "get") {
      return handleGet(e);
    } else {
      return respondJson({ success: false, error: "Unknown action: " + action }, 400);
    }
  } catch (err) {
    return respondJson({ success: false, error: err.toString() }, 500);
  }
}

/**
 * Handles HTTP POST requests.
 * Body or query params:
 * - action: "delete" or "login"
 * - secret/key/apiKey: Authentication token
 * - id: Applicant ID to delete (for delete action)
 * - username / password: For login validation
 */
function doPost(e) {
  try {
    if (!checkAuth(e)) {
      return respondJson({ success: false, error: "Unauthorized" }, 401);
    }

    var action = e.parameter.action;
    var body = {};
    if (e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents);
      } catch (err) {
        // Fallback or ignore body parse error
      }
    }

    action = action || body.action;

    if (action === "delete") {
      var id = e.parameter.id || body.id;
      if (!id) {
        return respondJson({ success: false, error: "Missing applicant ID" }, 400);
      }
      var deletedCount = deleteApplicantFromAllSheets(id);
      return respondJson({ success: true, deletedCount: deletedCount });
    } else if (action === "login") {
      var username = body.username || e.parameter.username;
      var password = body.password || e.parameter.password;
      if (!username || !password) {
        return respondJson({ success: false, error: "Missing username or password" }, 400);
      }
      var isValid = verifyCredentials(username, password);
      return respondJson({ success: isValid });
    } else if (action === "save_ai_assessment") {
      var id = body.id || e.parameter.id;
      var assessmentData = body.data || body;
      if (!id) {
        return respondJson({ success: false, error: "Missing applicant ID" }, 400);
      }
      var success = saveAiAssessment(id, assessmentData);
      return respondJson({ success: success });
    } else if (action === "edit_company" || action === "update_company") {
      var id = body.id || e.parameter.id;
      var company = body.company !== undefined ? body.company : e.parameter.company;
      if (!id) {
        return respondJson({ success: false, error: "Missing applicant ID" }, 400);
      }
      var success = updateApplicantCompany(id, company);
      return respondJson({ success: success, company: company });
    } else {
      return respondJson({ success: false, error: "Unknown action: " + action }, 400);
    }
  } catch (err) {
    return respondJson({ success: false, error: err.toString() }, 500);
  }
}

/**
 * Updates the company cell (Column K, 1-based index 11, range K3:K) for an applicant ID in sheet 'Final Result'.
 */
function updateApplicantCompany(id, company) {
  if (!id) return false;
  var spreadsheet = getSpreadsheet();
  var sheet = spreadsheet.getSheetByName(TAB_NAME);
  if (!sheet) return false;

  var values = sheet.getDataRange().getValues();
  if (values.length < START_ROW) return false;

  for (var i = START_ROW - 1; i < values.length; i++) {
    var rowId = parseString(values[i][1]); // Column B is ID
    if (rowId === id) {
      var sheetRowIndex = i + 1; // 1-based row index in Google Sheets
      sheet.getRange(sheetRowIndex, 11).setValue(company);
      return true;
    }
  }
  return false;
}

// =========================================================================
// ROUTE HANDLERS
// =========================================================================

/**
 * Serves a paginated, filtered list of ApplicantSummary objects
 * and their matching ApplicantDetail profiles for performance optimization.
 */
function handleList(e) {
  var spreadsheet = getSpreadsheet();
  var sheet = spreadsheet.getSheetByName(TAB_NAME);
  if (!sheet) {
    return respondJson({ success: false, error: "Sheet '" + TAB_NAME + "' not found" }, 404);
  }

  var values = sheet.getDataRange().getValues();
  if (values.length < START_ROW) {
    return respondJson({
      success: true,
      data: [],
      details: {},
      pagination: { page: 1, limit: 20, totalCount: 0, totalPages: 0 }
    });
  }

  var dataRows = values.slice(START_ROW - 1);

  // Filter out invalid/empty rows (ensure ID exists and is not a formula error like #REF!, #N/A, etc.)
  dataRows = dataRows.filter(function (row) {
    var id = row[1] ? String(row[1]).trim() : "";
    return id !== "" && id.indexOf("#") !== 0;
  });

  // Search filter
  var search = e.parameter.search;
  if (search) {
    var q = String(search).toLowerCase().trim();
    dataRows = dataRows.filter(function (row) {
      var id = parseString(row[1]).toLowerCase();
      var email = parseString(row[3]).toLowerCase();
      var name = parseString(row[4]).toLowerCase();
      var position = parseString(row[8]).toLowerCase();
      return id.indexOf(q) !== -1 || email.indexOf(q) !== -1 || name.indexOf(q) !== -1 || position.indexOf(q) !== -1;
    });
  }

  // Supervisory filter
  var supervisory = e.parameter.supervisory;
  if (supervisory !== undefined && supervisory !== null && supervisory !== "") {
    var targetSupervisory = parseBoolean(supervisory);
    dataRows = dataRows.filter(function (row) {
      return parseBoolean(row[2]) === targetSupervisory;
    });
  }

  // Pagination
  var page = parseInt(e.parameter.page || "1", 10);
  var limit = parseInt(e.parameter.limit || "20", 10);
  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 20;

  var totalCount = dataRows.length;
  var totalPages = Math.ceil(totalCount / limit);
  var startIndex = (page - 1) * limit;
  var endIndex = startIndex + limit;
  var paginatedRows = dataRows.slice(startIndex, endIndex);

  var summaries = [];
  var details = {};

  for (var i = 0; i < paginatedRows.length; i++) {
    var mapped = mapRowToApplicant(paginatedRows[i]);
    if (mapped) {
      summaries.push(mapped.summary);
      details[mapped.detail.id] = mapped.detail;
    }
  }

  return respondJson({
    success: true,
    data: summaries,
    details: details,
    pagination: {
      page: page,
      limit: limit,
      totalCount: totalCount,
      totalPages: totalPages
    }
  });
}

/**
 * Serves a single applicant's data by UUID.
 */
function handleGet(e) {
  var id = e.parameter.id;
  if (!id) {
    return respondJson({ success: false, error: "Missing applicant ID" }, 400);
  }

  var spreadsheet = getSpreadsheet();
  var sheet = spreadsheet.getSheetByName(TAB_NAME);
  if (!sheet) {
    return respondJson({ success: false, error: "Sheet '" + TAB_NAME + "' not found" }, 404);
  }

  var values = sheet.getDataRange().getValues();
  if (values.length < START_ROW) {
    return respondJson({ success: false, error: "Applicant not found" }, 404);
  }

  var dataRows = values.slice(START_ROW - 1);
  for (var i = 0; i < dataRows.length; i++) {
    var row = dataRows[i];
    if (parseString(row[1]) === id) {
      var mapped = mapRowToApplicant(row);
      if (mapped) {
        return respondJson({
          success: true,
          data: mapped.summary,
          detail: mapped.detail
        });
      }
    }
  }

  return respondJson({ success: false, error: "Applicant not found" }, 404);
}

// =========================================================================
// DATA UTILITIES & ACTIONS
// =========================================================================

/**
 * Cascading deletion: Searches for the UUID in every sheet/tab of the spreadsheet
 * and deletes all matching rows. This preserves relational integrity when using XLOOKUP.
 */
function deleteApplicantFromAllSheets(id) {
  // Defensive validation: Ensure the ID is a valid non-empty string and not a short or invalid key
  if (!id || typeof id !== "string" || id.trim() === "" || id.length < 10) {
    return 0;
  }

  var spreadsheet = getSpreadsheet();
  var sheets = spreadsheet.getSheets();
  var deletedCount = 0;

  for (var i = 0; i < sheets.length; i++) {
    var sheet = sheets[i];

    // 1. Search cell VALUES only (not formula texts)
    // 2. Match the ENTIRE cell contents exactly (prevents partial matches)
    var finder = sheet.createTextFinder(id)
      .matchEntireCell(true)
      .matchFormulaText(false);

    var ranges = finder.findAll();
    var rowsToDelete = [];

    for (var j = 0; j < ranges.length; j++) {
      var row = ranges[j].getRow();
      // Defensive check: Do not delete header rows
      if (row >= START_ROW && rowsToDelete.indexOf(row) === -1) {
        rowsToDelete.push(row);
      }
    }

    // Sort in descending order to avoid shift issues during deletion
    rowsToDelete.sort(function (a, b) { return b - a; });
    for (var k = 0; k < rowsToDelete.length; k++) {
      sheet.deleteRow(rowsToDelete[k]);
      deletedCount++;
    }
  }
  return deletedCount;
}

/**
 * Dynamic credentials checker. Searches for columns named "Username" (or "Email")
 * and "Password" (or "Pass") inside a sheet named "Credentials" or "Users".
 * Checks against plain text or SHA-256 signatures.
 */
function verifyCredentials(username, password) {
  var spreadsheet = getSpreadsheet();
  var sheet = spreadsheet.getSheetByName("Credentials") || spreadsheet.getSheetByName("Users");
  if (!sheet) {
    return false; // Ready but returns false if not initialized yet
  }

  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return false;

  var headers = values[0];
  var userCol = -1;
  var passCol = -1;
  for (var i = 0; i < headers.length; i++) {
    var h = String(headers[i]).toLowerCase().trim();
    if (h === "username" || h === "email") userCol = i;
    if (h === "password" || h === "pass") passCol = i;
  }

  if (userCol === -1 || passCol === -1) return false;

  username = String(username).toLowerCase().trim();
  password = String(password);

  for (var rowIdx = 1; rowIdx < values.length; rowIdx++) {
    var dbUser = String(values[rowIdx][userCol]).toLowerCase().trim();
    var dbPass = String(values[rowIdx][passCol]);

    if (dbUser === username) {
      if (dbPass === password || hashPassword(password) === dbPass) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Computes SHA-256 signature for passwords stored as hashes in the sheet.
 */
function hashPassword(password) {
  var signature = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password, Utilities.Charset.UTF_8);
  var signatureStr = "";
  for (var i = 0; i < signature.length; i++) {
    var byteVal = signature[i];
    if (byteVal < 0) byteVal += 256;
    var byteString = byteVal.toString(16);
    if (byteString.length == 1) byteString = "0" + byteString;
    signatureStr += byteString;
  }
  return signatureStr;
}

/**
 * Verifies authorization secret.
 */
function checkAuth(e) {
  var token = null;

  if (e && e.parameter) {
    token = e.parameter.secret || e.parameter.key || e.parameter.apiKey;
  }

  if (!token && e && e.postData && e.postData.contents) {
    try {
      var body = JSON.parse(e.postData.contents);
      token = body.secret || body.key || body.apiKey;
    } catch (err) {
      // ignore
    }
  }

  var configuredSecret = SECRET_KEY;
  try {
    var propSecret = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_SECRET");
    if (propSecret) {
      configuredSecret = propSecret;
    }
  } catch (err) {
    // Ignore properties service errors
  }

  return token === configuredSecret;
}

/**
 * Opens and returns the spreadsheet based on current environment toggle.
 */
function getSpreadsheet() {
  var id = IS_DEVELOPMENT ? TEST_SPREADSHEET_ID : PROD_SPREADSHEET_ID;
  try {
    return SpreadsheetApp.openById(id);
  } catch (e) {
    // If openById is not permitted, fall back to active spreadsheet
    return SpreadsheetApp.getActiveSpreadsheet();
  }
}

/**
 * Generates JSON payload response with CORS-safe headers.
 */
function respondJson(data, statusCode) {
  if (statusCode) {
    data.status = statusCode;
  } else {
    data.status = data.success === false ? 400 : 200;
  }

  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// =========================================================================
// PARSERS AND TYPE CONVERTERS (DEFENSIVE)
// =========================================================================

function parseString(val) {
  if (val === undefined || val === null) return "";
  return String(val).trim();
}

function parseNumber(val) {
  if (val === undefined || val === null || val === "") return 0;
  var num = Number(val);
  return isNaN(num) ? val : num; // Returns original string (e.g. "[No answer]") if parsing fails
}

function parseBoolean(val) {
  if (val === undefined || val === null) return false;
  if (typeof val === "boolean") return val;
  var str = String(val).trim().toLowerCase();
  return str === "yes" || str === "true" || str === "1";
}

function parseDateString(val) {
  if (val instanceof Date) {
    var y = val.getFullYear();
    var m = ("0" + (val.getMonth() + 1)).slice(-2);
    var d = ("0" + val.getDate()).slice(-2);
    return y + "-" + m + "-" + d;
  }
  return parseString(val);
}

function parseDateTimeString(val) {
  if (val instanceof Date) {
    return val.toISOString();
  }
  return parseString(val);
}

function parseClassification(val) {
  var str = parseString(val);
  if (!str) return "N/A";

  var lower = str.toLowerCase();
  for (var i = 0; i < classifications.length; i++) {
    if (classifications[i].toLowerCase() === lower) {
      return classifications[i];
    }
  }
  return str;
}

/**
 * Maps a single row to the structured ApplicantSummary and ApplicantDetail format.
 */
function mapRowToApplicant(row) {
  var id = parseString(row[1]);
  if (!id) return null;

  var timestamp = parseDateTimeString(row[0]);
  var supervisoryTest = parseBoolean(row[2]);
  var emailAddress = parseString(row[3]);
  var fullName = parseString(row[4]);
  var age = parseNumber(row[5]);
  var education = parseString(row[6]);
  var contactNumber = parseString(row[7]);
  var company = parseString(row[10]) || "No Company Yet";

  var positionAppliedFor = parseString(row[8]);
  var date = parseDateString(row[9]);

  // scores
  var cfit = parseClassification(row[11]);
  var comprehension = parseClassification(row[12]);
  var planning = parseClassification(row[13]);
  var supervisoryTotalEvaluation = parseClassification(row[30]);

  // summary data structure
  var summary = {
    id: id,
    metadata: {
      timestamp: timestamp,
      supervisoryTest: supervisoryTest,
      emailAddress: emailAddress,
      fullName: fullName,
      age: age,
      education: education,
      contactNumber: contactNumber,
      company: company
    },
    intent: {
      positionAppliedFor: positionAppliedFor,
      date: date
    },
    scores: {
      cfit: cfit,
      comprehension: comprehension,
      planning: planning,
      supervisoryTotalEvaluation: supervisoryTotalEvaluation
    }
  };

  // detailed16pf (O to Z)
  var detailed16pf = {
    emotionalStability: parseClassification(row[14]),
    senseOfResponsibility: parseClassification(row[15]),
    conscientiousness: parseClassification(row[16]),
    assertiveness: parseClassification(row[17]),
    confidence: parseClassification(row[18]),
    flexibility: parseClassification(row[19]),
    openMindedness: parseClassification(row[20]),
    selfReliance: parseClassification(row[21]),
    sociability: parseClassification(row[22]),
    trustAcceptance: parseClassification(row[23]),
    objectivity: parseClassification(row[24]),
    optimismLiveliness: parseClassification(row[25])
  };

  // supervisory detailed (AA to AD)
  var supervisory = {
    management: parseClassification(row[26]),
    supervision: parseClassification(row[27]),
    employeeRelations: parseClassification(row[28]),
    humanRelationsPractices: parseClassification(row[29])
  };

  // supervisory indexes AI (AG to AJ)
  var supervisoryIndexesAI = {
    index1Assessment: parseString(row[32]),
    index2Assessment: parseString(row[33]),
    index3Assessment: parseString(row[34]),
    index4Assessment: parseString(row[35])
  };

  // time consumed parsing (AM to BZ)
  var allTestTimeConsumed = {
    cfitTestTime: {
      test1: { consumedTime: parseString(row[38]), timeFrame: parseString(row[39]), testAnswered: parseNumber(row[40]), testItem: parseNumber(row[41]) },
      test2: { consumedTime: parseString(row[42]), timeFrame: parseString(row[43]), testAnswered: parseNumber(row[44]), testItem: parseNumber(row[45]) },
      test3: { consumedTime: parseString(row[46]), timeFrame: parseString(row[47]), testAnswered: parseNumber(row[48]), testItem: parseNumber(row[49]) },
      test4: { consumedTime: parseString(row[50]), timeFrame: parseString(row[51]), testAnswered: parseNumber(row[52]), testItem: parseNumber(row[53]) }
    },
    jcTestTime: {
      test1: { consumedTime: parseString(row[54]), timeFrame: parseString(row[55]), testAnswered: parseNumber(row[56]), testItem: parseNumber(row[57]) }
    },
    fitPlanningTestTime: {
      test1: { consumedTime: parseString(row[58]), timeFrame: parseString(row[59]), testAnswered: parseNumber(row[60]), testItem: parseNumber(row[61]) }
    },
    "16pfTestTime": {
      test1: { consumedTime: parseString(row[62]), timeFrame: parseString(row[63]), testAnswered: parseNumber(row[64]), testItem: parseNumber(row[65]) },
      test2: { consumedTime: parseString(row[66]), timeFrame: parseString(row[67]), testAnswered: parseNumber(row[68]), testItem: parseNumber(row[69]) },
      test3: { consumedTime: parseString(row[70]), timeFrame: parseString(row[71]), testAnswered: parseNumber(row[72]), testItem: parseNumber(row[73]) }
    },
    supervTestTime: supervisoryTest ? {
      test1: { consumedTime: parseString(row[74]), timeFrame: parseString(row[75]), testAnswered: parseNumber(row[76]), testItem: parseNumber(row[77]) }
    } : null
  };

  // detail data structure
  var detail = {
    id: id,
    detailed16pf: detailed16pf,
    supervisory: supervisory,
    mentalAbility: parseString(row[31]),
    supervisoryIndexesAI: supervisoryIndexesAI,
    overAllAssessment: parseString(row[36]),
    aiGenPersonalityAssessment: parseString(row[37]),
    allTestTimeConsumed: allTestTimeConsumed
  };

  return {
    summary: summary,
    detail: detail
  };
}
