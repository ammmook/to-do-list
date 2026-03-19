// Google Apps Script — paste this into your Google Sheet's Apps Script editor
// (Extensions > Apps Script)
//
// After pasting, click Deploy > Manage deployments > Edit > New version > Deploy
// - Execute as: Me
// - Who has access: Anyone
//
// IMPORTANT: Your Google Sheet should have these column headers in row 1:
// id | subject | task | category | deadline | priority | status | note | createdAt
// (or leave it empty — the script will create headers automatically)

const SHEET_NAME = 'Sheet1'; // Change this if your sheet tab has a different name

function doGet(e) {
  var action = e.parameter.action;

  switch (action) {
    case 'getAll':
      return getAllTasks();
    case 'add':
      return addTask(e.parameter);
    case 'update':
      return updateTask(e.parameter.id, e.parameter);
    case 'delete':
      return deleteTask(e.parameter.id);
    default:
      return jsonResponse({ error: 'Unknown action: ' + action });
  }
}

function doPost(e) {
  var body = JSON.parse(e.postData.contents);
  return doGet({ parameter: body });
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['id', 'subject', 'task', 'category', 'deadline', 'priority', 'status', 'note', 'createdAt']);
  }
}

function getAllTasks() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  ensureHeaders(sheet);

  if (sheet.getLastRow() <= 1) {
    return jsonResponse({ data: [] });
  }

  var data = sheet.getDataRange().getValues();
  var tasks = [];

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === '') continue;
    tasks.push({
      id: String(data[i][0]),
      subject: String(data[i][1]),
      task: String(data[i][2]),
      category: String(data[i][3]),
      deadline: String(data[i][4]),
      priority: String(data[i][5]),
      status: String(data[i][6]),
      note: String(data[i][7]),
      createdAt: String(data[i][8]),
    });
  }

  tasks.reverse();
  return jsonResponse({ data: tasks });
}

function addTask(params) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  ensureHeaders(sheet);

  var id = Utilities.getUuid();
  var createdAt = new Date().toISOString();

  sheet.appendRow([
    id,
    params.subject || '',
    params.task || '',
    params.category || '',
    params.deadline || '',
    params.priority || 'Medium',
    params.status || 'Not Started',
    params.note || '',
    createdAt
  ]);

  return jsonResponse({
    data: {
      id: id,
      subject: params.subject || '',
      task: params.task || '',
      category: params.category || '',
      deadline: params.deadline || '',
      priority: params.priority || 'Medium',
      status: params.status || 'Not Started',
      note: params.note || '',
      createdAt: createdAt
    }
  });
}

function updateTask(id, params) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var data = sheet.getDataRange().getValues();

  // Column mapping: 0=id, 1=subject, 2=task, 3=category, 4=deadline, 5=priority, 6=status, 7=note, 8=createdAt
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      if (params.subject !== undefined && params.subject !== null) sheet.getRange(i + 1, 2).setValue(params.subject);
      if (params.task !== undefined && params.task !== null) sheet.getRange(i + 1, 3).setValue(params.task);
      if (params.category !== undefined && params.category !== null) sheet.getRange(i + 1, 4).setValue(params.category);
      if (params.deadline !== undefined && params.deadline !== null) sheet.getRange(i + 1, 5).setValue(params.deadline);
      if (params.priority !== undefined && params.priority !== null) sheet.getRange(i + 1, 6).setValue(params.priority);
      if (params.status !== undefined && params.status !== null) sheet.getRange(i + 1, 7).setValue(params.status);
      if (params.note !== undefined && params.note !== null) sheet.getRange(i + 1, 8).setValue(params.note);

      return jsonResponse({
        data: {
          id: String(id),
          subject: params.subject !== undefined ? String(params.subject) : String(data[i][1]),
          task: params.task !== undefined ? String(params.task) : String(data[i][2]),
          category: params.category !== undefined ? String(params.category) : String(data[i][3]),
          deadline: params.deadline !== undefined ? String(params.deadline) : String(data[i][4]),
          priority: params.priority !== undefined ? String(params.priority) : String(data[i][5]),
          status: params.status !== undefined ? String(params.status) : String(data[i][6]),
          note: params.note !== undefined ? String(params.note) : String(data[i][7]),
          createdAt: String(data[i][8])
        }
      });
    }
  }

  return jsonResponse({ error: 'Task not found' });
}

function deleteTask(id) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return jsonResponse({ success: true });
    }
  }

  return jsonResponse({ error: 'Task not found' });
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
