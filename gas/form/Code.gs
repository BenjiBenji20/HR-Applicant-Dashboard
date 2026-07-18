// ============================================================
//  Code.gs  –  Continental Sales Inc. Pre-employment Exam
// ============================================================

// -------------------------------------------------------
//  DEPLOYMENT CONFIGURATION FLAGS
// -------------------------------------------------------
var IS_SUPERVISORY = true; // Set true for supervisory mode, false for non-supervisory mode
var IS_DEV_MODE = true;    // Set true for 1min time limit, false for regular time limit

function doGet(e) {
  var setNum = e.parameter.set || "1";
  var template = HtmlService.createTemplateFromFile('Index');
  template.currentSet = setNum;
  template.webAppUrl = ScriptApp.getService().getUrl();
  template.isSupervisory = IS_SUPERVISORY;
  template.isDevMode = IS_DEV_MODE;

  return template.evaluate()
    .setTitle('Continental Sales Inc. - Pre-employment Exam - Set ' + setNum)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// -------------------------------------------------------
//  SET CONFIGURATION
// -------------------------------------------------------
function getAllSetConfigurations() {
  return {
    "CFIT&J&C_1": { formId: "1EPL7DZo-aQZRE7ap6frgdpxyc_1E-pfAXnCE5eCWDQ4", sheetName: "CFIT&J&C_Test 1 Results", sectionCount: 5 },
    "CFIT&J&C_2": { formId: "1HfjkyZeLbBal-LWuqa_JQpNlNcCgiRbSCBGaECV9SRM", sheetName: "CFIT&J&C_Test 2 Results", sectionCount: 3 },
    "CFIT&J&C_3": { formId: "19Ts4RIyMTllMR29pP_efw9N5dorXQH4KZTD3SbhpENI", sheetName: "CFIT&J&C_Test 3 Results", sectionCount: 3 },
    "CFIT&J&C_4": { formId: "1uedjDrTUiy6qugfzdM4MplCJvgG_2x_9TVXVGV73pmQ", sheetName: "CFIT&J&C_Test 4 Results", sectionCount: 2 },
    "CFIT&J&C_5": { formId: "1EBMWDKZi1lAsdkm3Z836Zpf65ca7cM5_J2T3E_PjHt0", sheetName: "CFIT&J&C_Test 5 Results", sectionCount: 2 },

    // FIT_PLANNING&16PF 3&4 forms
    "FIT_PLANNING&16PF_1": { formId: "18bOJcNtyFttlMDQ7niDshFVf9SX_I8leR3RaAA-v2OY", sheetName: "FIT_PLANNING&16PF_Test 1 Results", sectionCount: 5 },
    "FIT_PLANNING&16PF_2": { formId: "1Qc6Vsc8lk_aICrxuv4bKUsnLsfa3miev7Xf6bI3eqZQ", sheetName: "FIT_PLANNING&16PF_Test 2 Results", sectionCount: 3 },
    "FIT_PLANNING&16PF_3": { formId: "1b64AH-5Yo6Syz_EJSoVBSS3Y-M66k6tNNsfbz6XowhE", sheetName: "FIT_PLANNING&16PF_Test 3 Results", sectionCount: 3 },
    "FIT_PLANNING&16PF_4": { formId: "1Q7-yGseDZDGQQVpWo9qOLJLwH_hhOsxmnnHAsqCEcto", sheetName: "FIT_PLANNING&16PF_Test 4 Results", sectionCount: 2 },

    // supervisory test form
    "SUPERVISORY_1": { formId: "1Ov0NUd2r6U9h9W9JE9DyYGHt8TxuGEHUxs4LREtgg_4", sheetName: "SUPERVISORY_Test 1 Results", sectionCount: 2 },

    // essay
    "ESSAY": { formId: "1bAgVqe_oBql6g1XAmMQfqiYdx4awScsOX4CdjT1aTQc", sheetName: "ESSAY Results", sectionCount: 1 },

    // application upload
    "APPLICATION_UPLOAD": { formId: "", sheetName: "EMPLOYMENT_APPLICATION_FORM", sectionCount: 0 }
  };
}

function getOrderedSetKeys() {
  var keys = [
    "CFIT&J&C_1",
    "CFIT&J&C_2",
    "CFIT&J&C_3",
    "CFIT&J&C_4",
    "CFIT&J&C_5",
    "FIT_PLANNING&16PF_1",
    "FIT_PLANNING&16PF_2",
    "FIT_PLANNING&16PF_3",
    "FIT_PLANNING&16PF_4"
  ];
  if (IS_SUPERVISORY) {
    keys.push("SUPERVISORY_1");
  }
  keys.push("ESSAY");
  keys.push("APPLICATION_UPLOAD");
  return keys;
}

function getSetConfiguration(setNum) {
  var keys = getOrderedSetKeys();
  var idx = parseInt(setNum, 10) - 1;
  var config = getAllSetConfigurations();
  var key = (idx >= 0 && idx < keys.length) ? keys[idx] : keys[0];
  return config[key];
}

function getSectionNumberOffset(setNum) {
  var orderedKeys = getOrderedSetKeys();
  var targetIdx = parseInt(setNum, 10) - 1;
  if (isNaN(targetIdx) || targetIdx < 0) targetIdx = 0;

  var allConfigs = getAllSetConfigurations();
  var offset = 0;
  for (var i = 0; i < targetIdx && i < orderedKeys.length; i++) {
    var key = orderedKeys[i];
    offset += allConfigs[key].sectionCount || 0;
  }
  return offset;
}

// -------------------------------------------------------
//  FORM QUESTION PARSER
// -------------------------------------------------------
function getFormQuestions(setNum) {
  var targetConfig = getSetConfiguration(setNum);
  if (!targetConfig || !targetConfig.formId) {
    return {
      isCustom: true,
      formTitle: targetConfig ? targetConfig.sheetName : "Application Form",
      formDescription: "",
      questions: []
    };
  }
  var form = FormApp.openById(targetConfig.formId);
  var items = form.getItems();
  var parsedQuestions = [];

  var formTitle = form.getTitle();
  var formDescription = form.getDescription();
  var requiresEmailInput = (setNum === "1");

  // Check if Advanced Google Forms Service is enabled
  var formsApiEnabled = false;
  try {
    if (typeof Forms !== 'undefined' && Forms.Forms) {
      formsApiEnabled = true;
    }
  } catch (e) { }

  // Fetch images from Forms REST API if available (handles inline question images and standalone ImageItems)
  var formsApiImageMap = {};
  if (formsApiEnabled) {
    try {
      var formsApiData = Forms.Forms.get(targetConfig.formId);
      if (formsApiData && formsApiData.items) {
        formsApiData.items.forEach(function (restItem) {
          var contentUri = null;
          if (restItem.questionItem && restItem.questionItem.image) {
            contentUri = restItem.questionItem.image.contentUri;
          } else if (restItem.imageItem && restItem.imageItem.image) {
            contentUri = restItem.imageItem.image.contentUri;
          }

          if (contentUri) {
            try {
              var decimalId = parseInt(restItem.itemId, 16).toString();
              if (decimalId !== "NaN") {
                formsApiImageMap[decimalId] = contentUri;
              }
            } catch (err) { }
          }
        });
      }
    } catch (e) {
      Logger.log('Failed to fetch form via Forms API: ' + e.toString());
    }
  }

  var ACCESSOR_MAP = {
    'MULTIPLE_CHOICE': 'asMultipleChoiceItem',
    'CHECKBOX': 'asCheckboxItem',
    'LIST': 'asListItem'
  };

  var REQUIRABLE_ACCESSOR_MAP = {
    'TEXT': 'asTextItem',
    'PARAGRAPH_TEXT': 'asParagraphTextItem',
    'MULTIPLE_CHOICE': 'asMultipleChoiceItem',
    'CHECKBOX': 'asCheckboxItem',
    'LIST': 'asListItem',
    'DATE': 'asDateItem',
    'TIME': 'asTimeItem',
    'IMAGE': 'asImageItem'
  };

  var runningSectionNumber = getSectionNumberOffset(setNum);

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var type = item.getType().toString();
    var title = item.getTitle();
    var helpText = item.getHelpText() || "";

    if (title.trim().toLowerCase() === 'score') continue;

    if (['TEXT', 'PARAGRAPH_TEXT', 'MULTIPLE_CHOICE', 'CHECKBOX', 'LIST',
      'DATE', 'TIME', 'PAGE_BREAK', 'SECTION_HEADER', 'IMAGE'].indexOf(type) === -1) {
      continue;
    }

    var questionObj = {
      index: parsedQuestions.length,
      id: item.getId().toString(),
      title: title,
      type: type,
      helpText: helpText,
      choices: [],
      isQuestion: ['PAGE_BREAK', 'SECTION_HEADER', 'IMAGE'].indexOf(type) === -1,
      required: ['PAGE_BREAK', 'SECTION_HEADER', 'IMAGE'].indexOf(type) === -1,
      sectionNumber: null,
      questionImageData: null
    };

    if (type === 'SECTION_HEADER') {
      runningSectionNumber += 1;
      questionObj.sectionNumber = runningSectionNumber;
    }

    // Populate question image URL from Google Forms REST API if available
    if (formsApiImageMap[questionObj.id]) {
      questionObj.questionImageData = formsApiImageMap[questionObj.id];
    }

    try {
      var reqAccessor = REQUIRABLE_ACCESSOR_MAP[type];
      if (reqAccessor) {
        var specificItem = item[reqAccessor]();
        if (type !== 'IMAGE' && typeof specificItem.isRequired === 'function') {
          questionObj.required = specificItem.isRequired();
        }
        // Fallback to Image Blob extraction if REST API did not map it (primarily for standalone layout ImageItems)
        if (!questionObj.questionImageData && typeof specificItem.getImage === 'function') {
          var imgBlob = specificItem.getImage();
          if (imgBlob) {
            var contentType = imgBlob.getContentType() || "image/png";
            questionObj.questionImageData = "data:" + contentType + ";base64," +
              Utilities.base64Encode(imgBlob.getBytes());
          }
        }
      }
    } catch (err) {
      Logger.log('Property extraction failed for item "%s": %s', title, err.toString());
    }

    try {
      var choiceAccessor = ACCESSOR_MAP[type];
      if (choiceAccessor) {
        questionObj.choices = item[choiceAccessor]().getChoices().map(function (c) {
          return c.getValue();
        });
      }
    } catch (err) { }

    if ((setNum == 2 || String(setNum) === "2") && questionObj.type === "MULTIPLE_CHOICE") {
      questionObj.type = "CHECKBOX";
    }

    parsedQuestions.push(questionObj);
  }

  // Merge adjacent standalone image items into adjacent questions
  var finalQuestions = [];
  for (var j = 0; j < parsedQuestions.length; j++) {
    var current = parsedQuestions[j];
    if (current.type === 'IMAGE') {
      var merged = false;
      // 1. Try to merge with the previous item if it is a question
      if (finalQuestions.length > 0) {
        var prev = finalQuestions[finalQuestions.length - 1];
        if (prev.isQuestion && !prev.questionImageData && current.questionImageData) {
          prev.questionImageData = current.questionImageData;
          merged = true;
        }
      }
      // 2. Try to merge with the next item if it is a question
      if (!merged && j + 1 < parsedQuestions.length) {
        var next = parsedQuestions[j + 1];
        if (['PAGE_BREAK', 'SECTION_HEADER', 'IMAGE'].indexOf(next.type) === -1 && current.questionImageData) {
          next.questionImageData = current.questionImageData;
          merged = true;
        }
      }
      // If it couldn't be merged, retain as a standalone layout card
      if (!merged) {
        finalQuestions.push(current);
      }
    } else {
      finalQuestions.push(current);
    }
  }

  // Re-adjust indexes to be sequential for UI rendering (IDs like card_X)
  var nameIdx = -1;
  for (var k = 0; k < finalQuestions.length; k++) {
    var title = finalQuestions[k].title;
    if (title) {
      var cleanTitle = title.trim().toLowerCase().replace(/[:*]/g, "").trim();
      if (cleanTitle === "full name" || cleanTitle === "name" || cleanTitle === "candidate name" || cleanTitle === "complete name" || cleanTitle.indexOf("full name") !== -1 || (cleanTitle.indexOf("name") !== -1 && k < 3)) {
        nameIdx = k;
        break;
      }
    }
  }

  if (nameIdx !== -1) {
    var customQuestions = [
      {
        id: "custom_age",
        title: "Age",
        type: "NUMBER",
        helpText: "",
        choices: [],
        isQuestion: true,
        required: true,
        sectionNumber: null,
        questionImageData: null
      },
      {
        id: "custom_education",
        title: "Education",
        type: "TEXT",
        helpText: "",
        choices: [],
        isQuestion: true,
        required: true,
        sectionNumber: null,
        questionImageData: null
      },
      {
        id: "custom_contact",
        title: "Contact Number",
        type: "TEXT",
        helpText: "",
        choices: [],
        isQuestion: true,
        required: true,
        sectionNumber: null,
        questionImageData: null
      }
    ];
    for (var m = 0; m < customQuestions.length; m++) {
      finalQuestions.splice(nameIdx + 1 + m, 0, customQuestions[m]);
    }
  }

  finalQuestions.forEach(function (q, idx) {
    q.index = idx;
  });

  return {
    formTitle: formTitle,
    formDescription: formDescription,
    requiresEmailInput: requiresEmailInput,
    questions: finalQuestions
  };
}

// -------------------------------------------------------
//  SHEET HELPERS
// -------------------------------------------------------
function getCanonicalHeaderList(setNum) {
  var formPackage = getFormQuestions(setNum);
  var headers = ['Timestamp', 'ID', 'Supervisory Test'];
  // Only include Email Address for CFIT&J&C_1 (sequential Set 1)
  if (setNum === "1" && formPackage.requiresEmailInput) {
    headers.push('Email address');
  }
  formPackage.questions.forEach(function (q) {
    if (q.isQuestion) headers.push(q.title);
  });
  headers.push('Submission Status / Time Spent');
  return headers;
}

function ensureSheetHeaders(sheet, canonicalHeaders) {
  var lastCol = sheet.getLastColumn();
  var existingHeaders = lastCol > 0
    ? sheet.getRange(1, 1, 1, lastCol).getValues()[0]
    : [];

  var headersMatch = existingHeaders.length === canonicalHeaders.length &&
    canonicalHeaders.every(function (h, idx) { return existingHeaders[idx] === h; });

  if (!headersMatch) {
    if (lastCol > 0) sheet.getRange(1, 1, 1, lastCol).clearContent();
    sheet.getRange(1, 1, 1, canonicalHeaders.length).setValues([canonicalHeaders]);
  }
}

// -------------------------------------------------------
//  SUBMISSION HANDLER
// -------------------------------------------------------
function processDynamicSubmission(payload) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var targetConfig = getSetConfiguration(payload.setNum);
    var sheet = ss.getSheetByName(targetConfig.sheetName);
    if (!sheet) throw new Error('Sheet tab "' + targetConfig.sheetName + '" not found.');

    var canonicalHeaders = getCanonicalHeaderList(payload.setNum);
    ensureSheetHeaders(sheet, canonicalHeaders);

    var finishTime = new Date();
    var submissionType = (payload.isTimeout ? "Auto-Submitted (Timeout)" : "Manual Submission")
      + " - [Consumed: " + payload.elapsedTimeStr + "]";

    var rowData = [finishTime, payload.candidateId, IS_SUPERVISORY ? "Yes" : "No"]
      .concat(payload.answers)
      .concat([submissionType]);

    // Check if there is an existing row for this candidate ID in the sheet to prevent duplicates
    var lastRow = sheet.getLastRow();
    var idColIdx = canonicalHeaders.indexOf('ID');

    var existingRowIndex = -1;
    if (lastRow > 1 && idColIdx !== -1) {
      var idValues = sheet.getRange(2, idColIdx + 1, lastRow - 1, 1).getValues();
      for (var r = 0; r < idValues.length; r++) {
        if (String(idValues[r][0]).trim() === String(payload.candidateId).trim()) {
          existingRowIndex = r + 2; // offset for 1-based index and header row
          break;
        }
      }
    }

    var targetRow = (existingRowIndex !== -1) ? existingRowIndex : (lastRow + 1);
    var targetRange = sheet.getRange(targetRow, 1, 1, rowData.length);

    // ---------------------------------------------------------------
    // FIX: CFIT&J&C_2 answers for multi-select checkbox questions are
    // joined client-side with a hyphen (e.g. "3-4"). When written with
    // setValues()/appendRow() into a cell that still has "Automatic"
    // number formatting, Google Sheets silently reinterprets a
    // hyphenated numeric-looking string as a DATE (e.g. "4-Mar"),
    // collapsing both selected answers into what looks like one value.
    // Forcing those answer columns to plain text ("@") BEFORE writing
    // prevents this auto-conversion, scoped to CFIT&J&C_2 only.
    // ---------------------------------------------------------------
    if (String(payload.setNum) === "2") {
      // Answer columns sit after Timestamp, ID, Supervisory Test (col 4 onward)
      // and stop before the trailing Submission Status column.
      var answerColCount = rowData.length - 4;
      if (answerColCount > 0) {
        sheet.getRange(targetRow, 4, 1, answerColCount).setNumberFormat("@");
      }
    }

    targetRange.setValues([rowData]);

    return { success: true };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

// -------------------------------------------------------
//  EMPLOYMENT APPLICATION UPLOAD HANDLER
// -------------------------------------------------------
function uploadEmploymentApplication(payload) {
  try {
    var folderId = "1qtHjlIKXMQREqAzB-B_tmZ9oebpOzyNo";
    var folder = DriveApp.getFolderById(folderId);
    var bytes = Utilities.base64Decode(payload.base64Data);
    var blob = Utilities.newBlob(bytes, payload.mimeType, payload.fileName);
    var file = folder.createFile(blob);
    var fileUrl = file.getUrl();

    // Save metadata to EMPLOYMENT_APPLICATION_FORM sheet
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("EMPLOYMENT_APPLICATION_FORM");
    if (!sheet) {
      sheet = ss.insertSheet("EMPLOYMENT_APPLICATION_FORM");
      sheet.appendRow(["Timestamp", "ID", "Supervisory Test", "Document URL"]);
    } else {
      if (sheet.getLastColumn() === 0) {
        sheet.getRange(1, 1, 1, 4).setValues([["Timestamp", "ID", "Supervisory Test", "Document URL"]]);
      }
    }

    var timestamp = new Date();
    var isSupervisoryStr = payload.isSupervisory ? "Yes" : "No";
    var rowData = [timestamp, payload.candidateId, isSupervisoryStr, fileUrl];

    // Check if ID already exists to prevent duplicate entries
    var lastRow = sheet.getLastRow();
    var targetRow = lastRow + 1;
    if (lastRow > 1) {
      var idValues = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
      for (var i = 0; i < idValues.length; i++) {
        if (String(idValues[i][0]).trim() === String(payload.candidateId).trim()) {
          targetRow = i + 2;
          break;
        }
      }
    }

    sheet.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);

    return { success: true, url: fileUrl };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}