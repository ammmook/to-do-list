// Google Apps Script — paste this into your Google Sheet's Apps Script editor
// (Extensions > Apps Script)
//
// After pasting, click Deploy > Manage deployments > Edit > New version > Deploy
// - Execute as: Me
// - Who has access: Anyone
//
// This script manages TWO sheet tabs:
//   1. "Sheet1" — Tasks data
//   2. "Subjects" — Saved subject names per academic term
//
// The "Subjects" tab will be auto-created on first use.

var TASKS_SHEET_NAME = 'Sheet1';
var SUBJECTS_SHEET_NAME = 'Subjects';

// ─── Column indices (0-based) for Tasks sheet ────────────────────
var TASK_COL = {
  ID: 0,
  SUBJECT: 1,
  TASK: 2,
  CATEGORY: 3,
  DEADLINE: 4,
  PRIORITY: 5,
  STATUS: 6,
  NOTE: 7,
  CREATED_AT: 8,
  ACADEMIC_YEAR: 9,
  SEMESTER: 10
};

// ─── Column indices (0-based) for Subjects sheet ─────────────────
var SUBJECT_COL = {
  ID: 0,
  NAME: 1,
  ACADEMIC_YEAR: 2,
  SEMESTER: 3
};

// ─── Router ──────────────────────────────────────────────────────

function doGet(e) {
  var action = e.parameter.action;

  switch (action) {
    // Task actions
    case 'getAll':
      return getAllTasks();
    case 'add':
      return addTask(e.parameter);
    case 'update':
      return updateTask(e.parameter.id, e.parameter);
    case 'delete':
      return deleteTask(e.parameter.id);

    // Subject actions
    case 'getSubjects':
      return getAllSubjects();
    case 'addSubject':
      return addSubject(e.parameter);
    case 'deleteSubject':
      return deleteSubject(e.parameter.id);

    default:
      return jsonResponse({ error: 'Unknown action: ' + action });
  }
}

function doPost(e) {
  var body = JSON.parse(e.postData.contents);
  return doGet({ parameter: body });
}

// ─── Sheet Helpers ───────────────────────────────────────────────

function getOrCreateSheet(sheetName, headers) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName);

  // Auto-create the sheet tab if it doesn't exist yet
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    sheet.appendRow(headers);
    return sheet;
  }

  // Ensure headers if the sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }

  return sheet;
}

function getTasksSheet() {
  return getOrCreateSheet(TASKS_SHEET_NAME, [
    'id', 'subject', 'task', 'category', 'deadline',
    'priority', 'status', 'note', 'createdAt',
    'academicYear', 'semester'
  ]);
}

function getSubjectsSheet() {
  return getOrCreateSheet(SUBJECTS_SHEET_NAME, [
    'id', 'name', 'academicYear', 'semester'
  ]);
}

// ─── Task CRUD ───────────────────────────────────────────────────

function getAllTasks() {
  var sheet = getTasksSheet();

  if (sheet.getLastRow() <= 1) {
    return jsonResponse({ data: [] });
  }

  var data = sheet.getDataRange().getValues();
  var tasks = [];

  for (var i = 1; i < data.length; i++) {
    if (data[i][TASK_COL.ID] === '') continue;
    tasks.push({
      id: String(data[i][TASK_COL.ID]),
      subject: String(data[i][TASK_COL.SUBJECT]),
      task: String(data[i][TASK_COL.TASK]),
      category: String(data[i][TASK_COL.CATEGORY]),
      deadline: String(data[i][TASK_COL.DEADLINE]),
      priority: String(data[i][TASK_COL.PRIORITY]),
      status: String(data[i][TASK_COL.STATUS]),
      note: String(data[i][TASK_COL.NOTE]),
      createdAt: String(data[i][TASK_COL.CREATED_AT]),
      academicYear: String(data[i][TASK_COL.ACADEMIC_YEAR] || ''),
      semester: String(data[i][TASK_COL.SEMESTER] || ''),
    });
  }

  tasks.reverse();
  return jsonResponse({ data: tasks });
}

function addTask(params) {
  var sheet = getTasksSheet();

  var id = Utilities.getUuid();
  var createdAt = new Date().toISOString();

  sheet.appendRow([
    id,
    params.subject || '',
    params.task || '',
    params.category || '',
    params.deadline || '',
    '',                           // priority — auto-calculated on client
    params.status || 'Not Started',
    params.note || '',
    createdAt,
    params.academicYear || '',
    params.semester || ''
  ]);

  return jsonResponse({
    data: {
      id: id,
      subject: params.subject || '',
      task: params.task || '',
      category: params.category || '',
      deadline: params.deadline || '',
      priority: '',
      status: params.status || 'Not Started',
      note: params.note || '',
      createdAt: createdAt,
      academicYear: params.academicYear || '',
      semester: params.semester || ''
    }
  });
}

function updateTask(id, params) {
  var sheet = getTasksSheet();
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][TASK_COL.ID]) === String(id)) {
      if (params.subject != null) sheet.getRange(i + 1, TASK_COL.SUBJECT + 1).setValue(params.subject);
      if (params.task != null) sheet.getRange(i + 1, TASK_COL.TASK + 1).setValue(params.task);
      if (params.category != null) sheet.getRange(i + 1, TASK_COL.CATEGORY + 1).setValue(params.category);
      if (params.deadline != null) sheet.getRange(i + 1, TASK_COL.DEADLINE + 1).setValue(params.deadline);
      if (params.status != null) sheet.getRange(i + 1, TASK_COL.STATUS + 1).setValue(params.status);
      if (params.note != null) sheet.getRange(i + 1, TASK_COL.NOTE + 1).setValue(params.note);

      return jsonResponse({
        data: {
          id: String(id),
          subject: params.subject != null ? String(params.subject) : String(data[i][TASK_COL.SUBJECT]),
          task: params.task != null ? String(params.task) : String(data[i][TASK_COL.TASK]),
          category: params.category != null ? String(params.category) : String(data[i][TASK_COL.CATEGORY]),
          deadline: params.deadline != null ? String(params.deadline) : String(data[i][TASK_COL.DEADLINE]),
          priority: String(data[i][TASK_COL.PRIORITY]),
          status: params.status != null ? String(params.status) : String(data[i][TASK_COL.STATUS]),
          note: params.note != null ? String(params.note) : String(data[i][TASK_COL.NOTE]),
          createdAt: String(data[i][TASK_COL.CREATED_AT]),
          academicYear: String(data[i][TASK_COL.ACADEMIC_YEAR] || ''),
          semester: String(data[i][TASK_COL.SEMESTER] || '')
        }
      });
    }
  }

  return jsonResponse({ error: 'Task not found' });
}

function deleteTask(id) {
  var sheet = getTasksSheet();
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][TASK_COL.ID]) === String(id)) {
      sheet.deleteRow(i + 1);
      return jsonResponse({ success: true });
    }
  }

  return jsonResponse({ error: 'Task not found' });
}

// ─── Subject CRUD ────────────────────────────────────────────────
// Subjects are stored in a separate "Subjects" sheet tab.
// Each subject is scoped to a specific academicYear + semester.

function getAllSubjects() {
  var sheet = getSubjectsSheet();

  if (sheet.getLastRow() <= 1) {
    return jsonResponse({ data: [] });
  }

  var data = sheet.getDataRange().getValues();
  var subjects = [];

  for (var i = 1; i < data.length; i++) {
    if (data[i][SUBJECT_COL.ID] === '') continue;
    subjects.push({
      id: String(data[i][SUBJECT_COL.ID]),
      name: String(data[i][SUBJECT_COL.NAME]),
      academicYear: String(data[i][SUBJECT_COL.ACADEMIC_YEAR] || ''),
      semester: String(data[i][SUBJECT_COL.SEMESTER] || ''),
    });
  }

  return jsonResponse({ data: subjects });
}

function addSubject(params) {
  var sheet = getSubjectsSheet();

  var id = Utilities.getUuid();

  sheet.appendRow([
    id,
    params.name || '',
    params.academicYear || '',
    params.semester || ''
  ]);

  return jsonResponse({
    data: {
      id: id,
      name: params.name || '',
      academicYear: params.academicYear || '',
      semester: params.semester || ''
    }
  });
}

function deleteSubject(id) {
  var sheet = getSubjectsSheet();
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][SUBJECT_COL.ID]) === String(id)) {
      sheet.deleteRow(i + 1);
      return jsonResponse({ success: true });
    }
  }

  return jsonResponse({ error: 'Subject not found' });
}

// ─── Utility ─────────────────────────────────────────────────────

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
