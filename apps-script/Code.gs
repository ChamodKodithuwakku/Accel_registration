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
 *
 * IMPORTANT: after changing the columns below, run setupSheet() once from the
 * editor. It rewrites the header row (and clears existing data).
 */

var SHEET_NAME = 'Registrations';
var HEADERS = [
  'ID',
  'First Name',
  'Last Name',
  'NIC',
  'Email',
  'Mobile Number',
  'Organization',
  'Visitor Category',
  'Interest Areas',
  'Heard From',
  'Consent',
  'Created Date',
  'Created Time',
  'Last Updated'
];

// Column indexes (1-based) matching HEADERS above.
var COL = {
  ID: 1,
  FIRST_NAME: 2,
  LAST_NAME: 3,
  NIC: 4,
  EMAIL: 5,
  PHONE: 6,
  ORGANIZATION: 7,
  CATEGORY: 8,
  INTERESTS: 9,
  HEARD_FROM: 10,
  CONSENT: 11,
  CREATED_DATE: 12,
  CREATED_TIME: 13,
  LAST_UPDATED: 14
};

var VALID_CATEGORIES = ['Student', 'SME', 'Industry', 'Other'];
var VALID_INTERESTS = ['Sustainability', 'Digital Transformation', 'Innovation', 'Entrepreneurship'];

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

  // NIC is the natural unique key for a person.
  if (findRowByNic(sheet, clean.nic, null) > 0) {
    return { success: false, message: 'NIC ' + clean.nic + ' is already registered' };
  }

  var now = new Date();
  var id = nextId(sheet);

  sheet.appendRow([
    id,
    clean.firstName,
    clean.lastName,
    clean.nic,
    clean.email,
    "'" + clean.phone, // leading apostrophe keeps the leading 0 as text
    clean.organization,
    clean.visitorCategory,
    clean.interestAreas.join(', '),
    clean.heardFrom,
    clean.consent ? 'Yes' : 'No',
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
    if (!row[COL.ID - 1] && !row[COL.FIRST_NAME - 1]) continue; // skip blank rows

    var firstName = String(row[COL.FIRST_NAME - 1] || '');
    var lastName = String(row[COL.LAST_NAME - 1] || '');

    records.push({
      id: Number(row[COL.ID - 1]) || row[COL.ID - 1],
      firstName: firstName,
      lastName: lastName,
      fullName: (firstName + ' ' + lastName).trim(),
      nic: String(row[COL.NIC - 1] || ''),
      email: String(row[COL.EMAIL - 1] || ''),
      phone: normalizePhoneOut(row[COL.PHONE - 1]),
      organization: String(row[COL.ORGANIZATION - 1] || ''),
      visitorCategory: String(row[COL.CATEGORY - 1] || ''),
      interestAreas: splitList(row[COL.INTERESTS - 1]),
      heardFrom: String(row[COL.HEARD_FROM - 1] || ''),
      consent: String(row[COL.CONSENT - 1] || '').trim().toLowerCase() === 'yes',
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

/** UPDATE - overwrite the editable fields and stamp Last Updated. */
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

  if (findRowByNic(sheet, clean.nic, row) > 0) {
    return { success: false, message: 'NIC ' + clean.nic + ' belongs to another record' };
  }

  sheet.getRange(row, COL.FIRST_NAME).setValue(clean.firstName);
  sheet.getRange(row, COL.LAST_NAME).setValue(clean.lastName);
  sheet.getRange(row, COL.NIC).setValue(clean.nic);
  sheet.getRange(row, COL.EMAIL).setValue(clean.email);
  sheet.getRange(row, COL.PHONE).setValue("'" + clean.phone);
  sheet.getRange(row, COL.ORGANIZATION).setValue(clean.organization);
  sheet.getRange(row, COL.CATEGORY).setValue(clean.visitorCategory);
  sheet.getRange(row, COL.INTERESTS).setValue(clean.interestAreas.join(', '));
  sheet.getRange(row, COL.HEARD_FROM).setValue(clean.heardFrom);
  sheet.getRange(row, COL.CONSENT).setValue(clean.consent ? 'Yes' : 'No');

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
  var firstName = String(body.firstName || '').trim();
  var lastName = String(body.lastName || '').trim();
  var nic = String(body.nic || '').replace(/\s/g, '').toUpperCase();
  var email = String(body.email || '').trim();
  var phone = normalizePhoneIn(body.phone);
  var organization = String(body.organization || '').trim();
  var visitorCategory = String(body.visitorCategory || '').trim();
  var heardFrom = String(body.heardFrom || '').trim();

  // Required
  if (!firstName) throw new Error('First name is required');
  if (firstName.length > 40) throw new Error('First name must be under 40 characters');
  if (!lastName) throw new Error('Last name is required');
  if (lastName.length > 40) throw new Error('Last name must be under 40 characters');

  if (!nic) throw new Error('NIC number is required');
  if (!/^\d{9}[VX]$/.test(nic) && !/^\d{12}$/.test(nic)) {
    throw new Error('Enter a valid NIC (123456789V or 200012345678)');
  }

  if (!phone) throw new Error('Mobile number is required');
  if (!/^0(?:7[01245678]\d{7}|(?:1[1-9]|2[1-9]|3[1-9]|4[1-7]|5[1-8]|6[1-3]|8[1-8]|9[1-2])\d{7})$/.test(phone)) {
    throw new Error('Enter a valid Sri Lankan phone number');
  }

  if (!visitorCategory) throw new Error('Visitor category is required');
  if (VALID_CATEGORIES.indexOf(visitorCategory) === -1) {
    throw new Error('Unknown visitor category: ' + visitorCategory);
  }

  var interestAreas = toList(body.interestAreas).filter(function (item) {
    return VALID_INTERESTS.indexOf(item) !== -1;
  });
  if (interestAreas.length === 0) throw new Error('Select at least one interest area');

  // Optional
  if (email && !/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email)) {
    throw new Error('Enter a valid email address');
  }
  if (organization.length > 80) throw new Error('Organization must be under 80 characters');
  if (heardFrom.length > 120) throw new Error('Heard From must be under 120 characters');

  return {
    firstName: firstName,
    lastName: lastName,
    nic: nic,
    email: email,
    phone: phone,
    organization: organization,
    visitorCategory: visitorCategory,
    interestAreas: interestAreas,
    heardFrom: heardFrom,
    consent: body.consent === true || String(body.consent).toLowerCase() === 'true'
  };
}

/** Accept an array or a comma separated string. */
function toList(value) {
  if (Object.prototype.toString.call(value) === '[object Array]') {
    return value.map(function (item) {
      return String(item).trim();
    });
  }
  return splitList(value);
}

function splitList(value) {
  var text = String(value === undefined || value === null ? '' : value).trim();
  if (!text) return [];
  return text
    .split(',')
    .map(function (item) {
      return item.trim();
    })
    .filter(function (item) {
      return item.length > 0;
    });
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
  // Phone and NIC as text so leading zeros and trailing V survive.
  sheet.getRange(1, COL.PHONE, sheet.getMaxRows(), 1).setNumberFormat('@');
  sheet.getRange(1, COL.NIC, sheet.getMaxRows(), 1).setNumberFormat('@');
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

/** Row number of a duplicate NIC (ignoring `skipRow`), or -1. */
function findRowByNic(sheet, nic, skipRow) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;

  var values = sheet.getRange(2, COL.NIC, lastRow - 1, 1).getValues();

  for (var i = 0; i < values.length; i++) {
    var row = i + 2;
    if (skipRow && row === skipRow) continue;
    if (String(values[i][0]).replace(/\s/g, '').toUpperCase() === nic) return row;
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

/**
 * Rewrites ONLY the header row to match HEADERS, keeping every data row.
 *
 * Use this when the columns changed but the sheet already holds registrations -
 * setupSheet() would wipe them. Safe to run repeatedly.
 */
function updateHeaders() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    throw new Error('Sheet "' + SHEET_NAME + '" was not found. Run setupSheet() instead.');
  }

  // Widen the sheet first if it has fewer columns than the schema needs.
  var missing = HEADERS.length - sheet.getMaxColumns();
  if (missing > 0) sheet.insertColumnsAfter(sheet.getMaxColumns(), missing);

  writeHeaders(sheet);

  var rows = Math.max(0, sheet.getLastRow() - 1);
  SpreadsheetApp.getUi().alert(
    'Header row updated to ' + HEADERS.length + ' columns. ' + rows + ' data row(s) left untouched.'
  );
}

/** Rebuilds the sheet with the current HEADERS. WARNING: clears existing data. */
function setupSheet() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
  sheet.clear();
  writeHeaders(sheet);
  SpreadsheetApp.getUi().alert('Sheet "' + SHEET_NAME + '" is ready with ' + HEADERS.length + ' columns.');
}

/** Quick smoke test - run from the editor and check the execution log. */
function testApi() {
  Logger.log(
    createRecord({
      firstName: 'Test',
      lastName: 'User',
      nic: '200012345678',
      email: 'test@example.com',
      phone: '0771234567',
      organization: 'ACEL',
      visitorCategory: 'Student',
      interestAreas: ['Innovation', 'Sustainability'],
      heardFrom: 'Facebook',
      consent: true
    })
  );
  Logger.log(JSON.stringify(getAllRecords()));
}
