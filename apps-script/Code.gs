/**
 * ACEL Registration - Google Apps Script API
 * ------------------------------------------
 * Acts as the backend between the React frontend (on Vercel) and a Google Sheet.
 *
 * Deploy:  Deploy > New deployment > Web app
 *          Execute as:     Me
 *          Who has access: Anyone
 *
 * Endpoints (the web app /exec URL):
 *   GET  ?action=list                     -> all records
 *   POST { action: "create", ... }        -> add a record
 *   POST { action: "update", id, ... }    -> update a record   (REST: PUT)
 *   POST { action: "delete", id }         -> delete a record   (REST: DELETE)
 *
 * Note: Apps Script only exposes doGet/doPost and cannot answer a CORS
 * preflight (OPTIONS) request, so update/delete are tunnelled through POST and
 * the frontend sends Content-Type: text/plain to keep the request "simple".
 * Responses from a published /exec URL already carry Access-Control-Allow-Origin: *.
 */

var SHEET_NAME = 'Registrations';
var HEADERS = [
  'ID',
  'Name',
  'Student ID',
  'Phone Number',
  'Created Date',
  'Created Time',
  'Last Updated'
];

// Column indexes (1-based) matching HEADERS above.
var COL = { ID: 1, NAME: 2, STUDENT_ID: 3, PHONE: 4, CREATED_DATE: 5, CREATED_TIME: 6, LAST_UPDATED: 7 };

/* ------------------------------------------------------------------ */
/* Entry points                                                        */
/* ------------------------------------------------------------------ */

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || 'list';

    if (action === 'list') {
      return jsonResponse({ success: true, data: getAllRecords() });
    }
    if (action === 'ping') {
      return jsonResponse({ success: true, message: 'API is running', sheet: SHEET_NAME });
    }

    return jsonResponse({ success: false, message: 'Unknown action: ' + action });
  } catch (error) {
    return jsonResponse({ success: false, message: error.message });
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();

  try {
    // Serialise writes so two submissions never claim the same ID.
    lock.waitLock(20000);

    var body = parseBody(e);
    var action = String(body.action || 'create').toLowerCase();

    switch (action) {
      case 'create':
        return jsonResponse(createRecord(body));
      case 'update':
      case 'put':
        return jsonResponse(updateRecord(body));
      case 'delete':
        return jsonResponse(deleteRecord(body));
      default:
        return jsonResponse({ success: false, message: 'Unknown action: ' + action });
    }
  } catch (error) {
    return jsonResponse({ success: false, message: error.message });
  } finally {
    try {
      lock.releaseLock();
    } catch (ignored) {}
  }
}

/* ------------------------------------------------------------------ */
/* Operations                                                          */
/* ------------------------------------------------------------------ */

/** CREATE - append a validated row and return the generated ID. */
function createRecord(body) {
  var clean = validatePayload(body);
  var sheet = getSheet();

  if (findRowByStudentId(sheet, clean.studentId, null) > 0) {
    return { success: false, message: 'Student ID ' + clean.studentId + ' is already registered' };
  }

  var now = new Date();
  var id = nextId(sheet);

  sheet.appendRow([
    id,
    clean.name,
    clean.studentId,
    "'" + clean.phone, // leading apostrophe keeps the leading 0 as text
    formatDate(now),
    formatTime(now),
    ''
  ]);

  return { success: true, message: 'Record added successfully', id: id };
}

/** READ - every row as a JSON object, newest first. */
function getAllRecords() {
  var sheet = getSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  var values = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  var records = [];

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    if (!row[COL.ID - 1] && !row[COL.NAME - 1]) continue; // skip blank rows

    records.push({
      id: Number(row[COL.ID - 1]) || row[COL.ID - 1],
      name: String(row[COL.NAME - 1] || ''),
      studentId: String(row[COL.STUDENT_ID - 1] || ''),
      phone: normalizePhoneOut(row[COL.PHONE - 1]),
      createdDate: cellToDate(row[COL.CREATED_DATE - 1]),
      createdTime: cellToTime(row[COL.CREATED_TIME - 1]),
      lastUpdated: cellToDateTime(row[COL.LAST_UPDATED - 1])
    });
  }

  // Newest first.
  records.sort(function (a, b) {
    return (Number(b.id) || 0) - (Number(a.id) || 0);
  });

  return records;
}

/** UPDATE - overwrite name / student ID / phone and stamp Last Updated. */
function updateRecord(body) {
  if (body.id === undefined || body.id === null || body.id === '') {
    return { success: false, message: 'Record ID is required' };
  }

  var clean = validatePayload(body);
  var sheet = getSheet();
  var row = findRowById(sheet, body.id);

  if (row < 0) {
    return { success: false, message: 'Record with ID ' + body.id + ' was not found' };
  }

  if (findRowByStudentId(sheet, clean.studentId, row) > 0) {
    return { success: false, message: 'Student ID ' + clean.studentId + ' belongs to another record' };
  }

  sheet.getRange(row, COL.NAME).setValue(clean.name);
  sheet.getRange(row, COL.STUDENT_ID).setValue(clean.studentId);
  sheet.getRange(row, COL.PHONE).setValue("'" + clean.phone);

  var now = new Date();
  sheet.getRange(row, COL.LAST_UPDATED).setValue(formatDate(now) + ' ' + formatTime(now));

  return { success: true, message: 'Record updated successfully', id: body.id };
}

/** DELETE - remove the matching row entirely. */
function deleteRecord(body) {
  if (body.id === undefined || body.id === null || body.id === '') {
    return { success: false, message: 'Record ID is required' };
  }

  var sheet = getSheet();
  var row = findRowById(sheet, body.id);

  if (row < 0) {
    return { success: false, message: 'Record with ID ' + body.id + ' was not found' };
  }

  sheet.deleteRow(row);
  return { success: true, message: 'Record deleted successfully', id: body.id };
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

function validatePayload(body) {
  var name = String(body.name || '').trim();
  var studentId = String(body.studentId || '').trim().toUpperCase();
  var phone = normalizePhoneIn(body.phone);

  if (!name) throw new Error('Name is required');
  if (name.length < 2 || name.length > 60) throw new Error('Name must be between 2 and 60 characters');

  if (!studentId) throw new Error('Student ID is required');
  if (!/^[A-Z0-9/\-_]{3,20}$/.test(studentId)) throw new Error('Student ID format is invalid');

  if (!phone) throw new Error('Phone number is required');
  if (!/^0(?:7[01245678]\d{7}|(?:1[1-9]|2[1-9]|3[1-9]|4[1-7]|5[1-8]|6[1-3]|8[1-8]|9[1-2])\d{7})$/.test(phone)) {
    throw new Error('Enter a valid Sri Lankan phone number');
  }

  return { name: name, studentId: studentId, phone: phone };
}

/** Accepts +94 / 0094 / 94 / 0 prefixes and stores everything as 0XXXXXXXXX. */
function normalizePhoneIn(value) {
  var digits = String(value === undefined || value === null ? '' : value).replace(/[\s\-()']/g, '');
  if (digits.indexOf('+94') === 0) return '0' + digits.substring(3);
  if (digits.indexOf('0094') === 0) return '0' + digits.substring(4);
  if (digits.indexOf('94') === 0 && digits.length === 11) return '0' + digits.substring(2);
  if (digits.length === 9 && digits.charAt(0) !== '0') return '0' + digits;
  return digits;
}

/** Re-add the leading zero if the sheet ever stored the phone as a number. */
function normalizePhoneOut(value) {
  var text = String(value === undefined || value === null ? '' : value).replace(/^'/, '').trim();
  if (!text) return '';
  if (text.length === 9 && text.charAt(0) !== '0') return '0' + text;
  return text;
}

/* ------------------------------------------------------------------ */
/* Sheet helpers                                                       */
/* ------------------------------------------------------------------ */

function getSheet() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error('Script is not bound to a spreadsheet. Open the sheet and use Extensions > Apps Script.');
  }

  var sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    writeHeaders(sheet);
  }

  return sheet;
}

function writeHeaders(sheet) {
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet
    .getRange(1, 1, 1, HEADERS.length)
    .setFontWeight('bold')
    .setBackground('#eef4ff')
    .setFontColor('#1c2e87');
  sheet.setFrozenRows(1);
  sheet.getRange(1, COL.PHONE, sheet.getMaxRows(), 1).setNumberFormat('@'); // phone column as text
  sheet.autoResizeColumns(1, HEADERS.length);
}

/** Highest existing ID + 1. */
function nextId(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return 1;

  var ids = sheet.getRange(2, COL.ID, lastRow - 1, 1).getValues();
  var max = 0;
  for (var i = 0; i < ids.length; i++) {
    var value = Number(ids[i][0]);
    if (!isNaN(value) && value > max) max = value;
  }
  return max + 1;
}

/** Row number for an ID, or -1. */
function findRowById(sheet, id) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;

  var target = String(id).trim();
  var ids = sheet.getRange(2, COL.ID, lastRow - 1, 1).getValues();

  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]).trim() === target) return i + 2;
  }
  return -1;
}

/** Row number of a duplicate student ID (ignoring `skipRow`), or -1. */
function findRowByStudentId(sheet, studentId, skipRow) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;

  var values = sheet.getRange(2, COL.STUDENT_ID, lastRow - 1, 1).getValues();

  for (var i = 0; i < values.length; i++) {
    var row = i + 2;
    if (skipRow && row === skipRow) continue;
    if (String(values[i][0]).trim().toUpperCase() === studentId) return row;
  }
  return -1;
}

/* ------------------------------------------------------------------ */
/* Formatting + transport                                              */
/* ------------------------------------------------------------------ */

function timezone() {
  return Session.getScriptTimeZone() || 'Asia/Colombo';
}

function formatDate(date) {
  return Utilities.formatDate(date, timezone(), 'yyyy-MM-dd');
}

function formatTime(date) {
  return Utilities.formatDate(date, timezone(), 'HH:mm');
}

function cellToDate(value) {
  if (value instanceof Date) return formatDate(value);
  return String(value === undefined || value === null ? '' : value).trim();
}

function cellToTime(value) {
  if (value instanceof Date) return formatTime(value);
  return String(value === undefined || value === null ? '' : value).trim();
}

function cellToDateTime(value) {
  if (value instanceof Date) return formatDate(value) + ' ' + formatTime(value);
  var text = String(value === undefined || value === null ? '' : value).trim();
  return text === '-' ? '' : text;
}

/** Apps Script gives us POST bodies as text; accept JSON or form-encoded. */
function parseBody(e) {
  if (e && e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (error) {
      // fall through to form parameters
    }
  }
  if (e && e.parameter) return e.parameter;
  return {};
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}

/* ------------------------------------------------------------------ */
/* One-time setup (run manually from the Apps Script editor)           */
/* ------------------------------------------------------------------ */

function setupSheet() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
  sheet.clear();
  writeHeaders(sheet);
  SpreadsheetApp.getUi().alert('Sheet "' + SHEET_NAME + '" is ready.');
}

/** Quick smoke test - run from the editor and check the execution log. */
function testApi() {
  Logger.log(createRecord({ name: 'Test User', studentId: 'TEST001', phone: '0771234567' }));
  Logger.log(JSON.stringify(getAllRecords()));
}
