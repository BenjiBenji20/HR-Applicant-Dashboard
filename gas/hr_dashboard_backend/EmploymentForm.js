/**
 * Employment Application Form Endpoint
 * Tab: "EMPLOYMENT_APPLICATION_FORM"
 */

var scriptProperties = PropertiesService.getScriptProperties();
var envProp = scriptProperties.getProperty('IS_DEVELOPMENT');
var IS_DEVELOPMENT = envProp ? String(envProp).trim().toLowerCase() === 'true' : false;
var TEST_SPREADSHEET_ID = scriptProperties.getProperty('TEST_SPREADSHEET_ID');
var PROD_SPREADSHEET_ID = scriptProperties.getProperty('PROD_SPREADSHEET_ID');

var FORM_TAB_NAME = "EMPLOYMENT_APPLICATION_FORM";
var FORM_COLUMN_ROW = 1; // Header row (Row 1)
var FORM_START_ROW = 2;  // Starting record row (Row 2)

/**
 * Endpoint handler to retrieve an applicant's Employment Application Form Document URL by ID.
 * Column mapping (A to D):
 * A: Timestamp
 * B: ID
 * C: Supervisory Test
 * D: Document URL
 */
function handleEmploymentForm(e) {
  try {
    var applicantId = e.parameter.id || e.parameter.applicantId || "";
    if (!applicantId) {
      return respondJson({ success: false, error: "Applicant ID parameter is missing" }, 400);
    }

    var idToFind = String(applicantId).trim().toLowerCase();
    var ssId = IS_DEVELOPMENT ? TEST_SPREADSHEET_ID : PROD_SPREADSHEET_ID;
    var ss = null;

    if (ssId) {
      try {
        ss = SpreadsheetApp.openById(ssId);
      } catch (err) {
        Logger.log("Failed to open spreadsheet by ID: " + ssId + ". Error: " + err.toString());
      }
    }
    if (!ss) {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    }

    if (!ss) {
      return respondJson({ success: false, error: "Spreadsheet database unavailable" }, 500);
    }

    var sheet = ss.getSheetByName(FORM_TAB_NAME);
    if (!sheet) {
      return respondJson({ success: false, error: "Applicant Form Not Submitted" }, 404);
    }

    var lastRow = sheet.getLastRow();
    if (lastRow < FORM_START_ROW) {
      return respondJson({ success: false, error: "Applicant Form Not Submitted" }, 404);
    }

    // Read range A2:D{lastRow}
    var values = sheet.getRange(FORM_START_ROW, 1, lastRow - FORM_START_ROW + 1, 4).getValues();

    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      var rowId = String(row[1] || "").trim().toLowerCase();

      if (rowId === idToFind) {
        var docUrl = String(row[3] || "").trim();
        if (docUrl) {
          return respondJson({
            success: true,
            id: applicantId,
            supervisoryTest: row[2],
            documentUrl: docUrl
          });
        }
      }
    }

    return respondJson({ success: false, error: "Applicant Form Not Submitted" }, 404);
  } catch (err) {
    return respondJson({ success: false, error: err.toString() }, 500);
  }
}
