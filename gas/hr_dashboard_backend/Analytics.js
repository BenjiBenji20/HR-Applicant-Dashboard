/**
 * Analytics Backend for HR Applicant Dashboard
 * Tab: "Application Summary"
 */

var scriptProperties = PropertiesService.getScriptProperties();
var envProp = scriptProperties.getProperty('IS_DEVELOPMENT');
var IS_DEVELOPMENT = envProp ? String(envProp).trim().toLowerCase() === 'true' : false;
var TEST_ANALYTICS_SPREADSHEET_ID = scriptProperties.getProperty('TEST_ANALYTICS_SPREADSHEET_ID');
var PROD_ANALYTICS_SPREADSHEET_ID = scriptProperties.getProperty('PROD_ANALYTICS_SPREADSHEET_ID');

var ANALYTICS_TAB_NAME = "Application Summary";
var ANALYTICS_COLUMN_ROW = 2; // Header row (Row 2)
var ANALYTICS_START_ROW = 3;  // Starting Record row (Row 3)

/**
 * Gets the target analytics spreadsheet depending on IS_DEVELOPMENT setting.
 */
function getAnalyticsSpreadsheet() {
  var id = IS_DEVELOPMENT ? TEST_ANALYTICS_SPREADSHEET_ID : PROD_ANALYTICS_SPREADSHEET_ID;
  if (id) {
    try {
      return SpreadsheetApp.openById(id);
    } catch (e) {
      Logger.log("Failed to open spreadsheet by ID: " + id + ". Error: " + e.toString());
    }
  }
  // Fallback to main spreadsheet ID if analytics spreadsheet ID is not set
  var fallbackId = IS_DEVELOPMENT
    ? scriptProperties.getProperty('TEST_SPREADSHEET_ID')
    : scriptProperties.getProperty('PROD_SPREADSHEET_ID');
  if (fallbackId) {
    try {
      return SpreadsheetApp.openById(fallbackId);
    } catch (e) {}
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Main handler for fetching analytics data from "Application Summary" tab.
 * Column mapping (A to L):
 * A: Total Applied (Single record value at row 3)
 * B: Position
 * C: Application Count by Position
 * D: Passed Application Count by Position
 * E: Pooling Application Count by Position
 * F: Failed Application Count by Position
 * G: Test Completed Count by Position
 * H: Test Not Completed Count by Position
 * I: Total Interviewed (Single record value at row 3)
 * J: Interviewed Count by Position
 * K: Total No-Show (Single record value at row 3)
 * L: Interview No-Show by Position
 */
function handleAnalytics(e) {
  try {
    var ss = getAnalyticsSpreadsheet();
    if (!ss) {
      return respondJson({ success: false, error: "Analytics spreadsheet not found" }, 404);
    }

    var sheet = ss.getSheetByName(ANALYTICS_TAB_NAME);
    if (!sheet) {
      return respondJson({ success: false, error: "Sheet '" + ANALYTICS_TAB_NAME + "' not found" }, 404);
    }

    var lastRow = sheet.getLastRow();
    if (lastRow < ANALYTICS_START_ROW) {
      return respondJson({
        success: true,
        data: {
          totalApplicants: 0,
          applyCountByPosition: [],
          applicationOutcome: [
            { label: "Successful", count: 0 },
            { label: "Failed", count: 0 },
            { label: "Pending", count: 0 }
          ],
          testCompletion: { completed: 0, notCompleted: 0 },
          interviews: { totalInterviewed: 0, totalNoShow: 0, byPosition: [] },
          hiringFunnel: [
            { stage: "Applied", count: 0 },
            { stage: "Test Finished", count: 0 },
            { stage: "Interviewed", count: 0 },
            { stage: "Hired", count: 0 }
          ],
          generatedAt: new Date().toISOString()
        }
      });
    }

    // Read range A3:L{lastRow}
    var range = sheet.getRange(ANALYTICS_START_ROW, 1, lastRow - ANALYTICS_START_ROW + 1, 12);
    var values = range.getValues();

    // Single-record values from Row 3 (index 0 in values)
    var row3 = values[0] || [];
    var scalarTotalApplied = Number(row3[0]) || 0;
    var scalarTotalInterviewed = Number(row3[8]) || 0;
    var scalarTotalNoShow = Number(row3[10]) || 0;

    var applyCountByPosition = [];
    var totalPassed = 0;
    var totalPooling = 0;
    var totalFailed = 0;
    var totalCompleted = 0;
    var totalNotCompleted = 0;
    var totalAppsSum = 0;
    var totalInterviewedSum = 0;
    var totalNoShowSum = 0;
    var byPositionInterviews = [];

    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      var position = String(row[1] || "").trim(); // Column B: Position
      if (!position) continue;

      var appCount = Number(row[2]) || 0;          // Column C: Application Count by Position
      var passedCount = Number(row[3]) || 0;       // Column D: Passed Application Count by Position
      var poolingCount = Number(row[4]) || 0;      // Column E: Pooling Application Count by Position
      var failedCount = Number(row[5]) || 0;       // Column F: Failed Application Count by Position
      var completedCount = Number(row[6]) || 0;    // Column G: Test Completed Count by Position
      var notCompletedCount = Number(row[7]) || 0; // Column H: Test Not Completed Count by Position
      var interviewedCount = Number(row[9]) || 0;  // Column J: Interviewed Count by Position
      var noShowCount = Number(row[11]) || 0;      // Column L: Interview No-Show by Position

      totalAppsSum += appCount;
      totalPassed += passedCount;
      totalPooling += poolingCount;
      totalFailed += failedCount;
      totalCompleted += completedCount;
      totalNotCompleted += notCompletedCount;
      totalInterviewedSum += interviewedCount;
      totalNoShowSum += noShowCount;

      applyCountByPosition.push({
        label: position,
        count: appCount
      });

      byPositionInterviews.push({
        label: position,
        primary: interviewedCount,
        secondary: noShowCount
      });
    }

    var finalTotalApplicants = scalarTotalApplied > 0 ? scalarTotalApplied : totalAppsSum;
    var finalTotalInterviewed = scalarTotalInterviewed > 0 ? scalarTotalInterviewed : totalInterviewedSum;
    var finalTotalNoShow = scalarTotalNoShow > 0 ? scalarTotalNoShow : totalNoShowSum;

    var applicationOutcome = [
      { label: "Successful", count: totalPassed },
      { label: "Failed", count: totalFailed }
    ];
    if (totalPooling > 0) {
      applicationOutcome.push({ label: "Pending", count: totalPooling });
    }

    var testCompletion = {
      completed: totalCompleted,
      notCompleted: totalNotCompleted
    };

    var interviews = {
      totalInterviewed: finalTotalInterviewed,
      totalNoShow: finalTotalNoShow,
      byPosition: byPositionInterviews
    };

    var hiringFunnel = [
      { stage: "Applied", count: finalTotalApplicants },
      { stage: "Test Finished", count: totalCompleted },
      { stage: "Interviewed", count: finalTotalInterviewed },
      { stage: "Hired", count: totalPassed }
    ];

    var result = {
      totalApplicants: finalTotalApplicants,
      applyCountByPosition: applyCountByPosition,
      applicationOutcome: applicationOutcome,
      testCompletion: testCompletion,
      interviews: interviews,
      hiringFunnel: hiringFunnel,
      generatedAt: new Date().toISOString()
    };

    return respondJson({ success: true, data: result });
  } catch (err) {
    return respondJson({ success: false, error: err.toString() }, 500);
  }
}
