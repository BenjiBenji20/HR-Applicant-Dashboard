/**
 * HR Applicant Dashboard Backend - AI Assessment Extensions
 * Google Apps Script Web App Extension
 *
 * Handles saving AI-generated psychometric reports and supervisory evaluations
 * back to the corresponding columns in the Google Sheet.
 */

/**
 * Saves AI-generated assessments to the spreadsheet for a specific applicant.
 * 
 * Target columns in "Final Results" tab (starting row 3):
 * - Mental Ability: Column AF (column index 32, 1-based)
 * - Management Index AI Gen Assessment: Column AG (column index 33, 1-based)
 * - Supervision Index AI Gen Assessment: Column AH (column index 34, 1-based)
 * - Employee Index AI Gen Assessment: Column AI (column index 35, 1-based)
 * - HRP AI Gen Assessment: Column AJ (column index 36, 1-based)
 * - Personality AI Assessment: Column AL (column index 38, 1-based)
 * 
 * @param {string} id - The applicant's UUID
 * @param {Object} data - The assessment text fields
 * @returns {boolean} - True if successfully saved, false otherwise
 */
function saveAiAssessment(id, data) {
  // Validate inputs
  if (!id || typeof id !== "string" || id.trim() === "" || id.length < 10) {
    return false;
  }
  
  if (!data) {
    return false;
  }
  
  var spreadsheet = getSpreadsheet();
  var sheet = spreadsheet.getSheetByName(TAB_NAME);
  if (!sheet) {
    return false;
  }
  
  var values = sheet.getDataRange().getValues();
  if (values.length < START_ROW) {
    return false;
  }
  
  // Find row containing the ID (col B is index 1 in 0-based array)
  var targetRowIdx = -1;
  for (var i = START_ROW - 1; i < values.length; i++) {
    if (String(values[i][1]).trim() === id) {
      targetRowIdx = i + 1; // 1-based row number for getRange()
      break;
    }
  }
  
  if (targetRowIdx === -1) {
    return false;
  }
  
  // Set values (col numbers correspond to spreadsheet 1-based columns AF, AG, AH, AI, AJ, AL)
  sheet.getRange(targetRowIdx, 32).setValue(parseString(data.mentalAbility));
  sheet.getRange(targetRowIdx, 33).setValue(parseString(data.index1Assessment));
  sheet.getRange(targetRowIdx, 34).setValue(parseString(data.index2Assessment));
  sheet.getRange(targetRowIdx, 35).setValue(parseString(data.index3Assessment));
  sheet.getRange(targetRowIdx, 36).setValue(parseString(data.index4Assessment));
  sheet.getRange(targetRowIdx, 38).setValue(parseString(data.aiGenPersonalityAssessment));
  
  return true;
}
