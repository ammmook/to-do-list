// Google Apps Script — paste this into your Google Sheet's Apps Script editor
// (Extensions > Apps Script)
//
// After pasting, click Deploy > Manage deployments > Edit > New version > Deploy
// - Execute as: Me
// - Who has access: Anyone
//
// This script manages THREE sheet tabs:
//   1. "Users" — Stores user registration and isAdmin status
//   2. "Sheet1" — Tasks data
//   3. "Subjects" — Saved subject names per academic term
//

var TASKS_SHEET_NAME = 'Sheet1';
var SUBJECTS_SHEET_NAME = 'Subjects';
var USERS_SHEET_NAME = 'Users';

// ─── Column indices (0-based) for Users sheet ────────────────────────
var USER_COL = {
  ID: 0,
  EMAIL: 1,
  IS_ADMIN: 2,
  CREATED_AT: 3,
  LAST_LOGIN_AT: 4
};

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
  SEMESTER: 10,
  OWNER_EMAIL: 11
};

// ─── Column indices (0-based) for Subjects sheet ─────────────────
var SUBJECT_COL = {
  ID: 0,
  NAME: 1,
  ACADEMIC_YEAR: 2,
  SEMESTER: 3,
  OWNER_EMAIL: 4
};

// ─── Router ──────────────────────────────────────────────────────

function doGet(e) {
  var action = e.parameter.action;

  switch (action) {
    // User actions
    case 'checkUser':
      return checkOrRegisterUser(e.parameter.email);
    case 'getAllUsers':
      return getAllUsers(e.parameter.adminEmail);

    // Task actions
    case 'getAll':
      return getAllTasks(e.parameter.ownerEmail);
    case 'add':
      return addTask(e.parameter);
    case 'update':
      return updateTask(e.parameter.id, e.parameter);
    case 'delete':
      return deleteTask(e.parameter.id, e.parameter.ownerEmail);

    // Subject actions
    case 'getSubjects':
      return getAllSubjects(e.parameter.ownerEmail);
    case 'addSubject':
      return addSubject(e.parameter);
    case 'deleteSubject':
      return deleteSubject(e.parameter.id, e.parameter.ownerEmail);

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

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    sheet.appendRow(headers);
    return sheet;
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }

  return sheet;
}

function getUsersSheet() {
  return getOrCreateSheet(USERS_SHEET_NAME, [
    'id', 'email', 'isAdmin', 'createdAt', 'lastLoginAt'
  ]);
}

function getTasksSheet() {
  return getOrCreateSheet(TASKS_SHEET_NAME, [
    'id', 'subject', 'task', 'category', 'deadline',
    'priority', 'status', 'note', 'createdAt',
    'academicYear', 'semester', 'ownerEmail'
  ]);
}

function getSubjectsSheet() {
  return getOrCreateSheet(SUBJECTS_SHEET_NAME, [
    'id', 'name', 'academicYear', 'semester', 'ownerEmail'
  ]);
}

// ─── User Authentication & Roles ─────────────────────────────────

function checkOrRegisterUser(email) {
  if (!email) return jsonResponse({ error: 'Email required' });
  var emailLower = email.toLowerCase();
  var sheet = getUsersSheet();
  
  if (sheet.getLastRow() > 1) {
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
        var rowEmail = String(data[i][USER_COL.EMAIL] || '').toLowerCase();
        if (rowEmail === emailLower) {
            sheet.getRange(i + 1, USER_COL.LAST_LOGIN_AT + 1).setValue(new Date().toISOString());
            
            // Treat string 'true' or boolean true as true 
            var valAdmin = data[i][USER_COL.IS_ADMIN];
            var isAdmin = valAdmin === true || String(valAdmin).toLowerCase() === 'true';
            
            return jsonResponse({ data: { email: emailLower, isAdmin: isAdmin } });
        }
    }
  }
  
  var isFirstUser = sheet.getLastRow() === 1;
  var createdAt = new Date().toISOString();
  var newId = Utilities.getUuid();
  var makeAdmin = isFirstUser; // Make first user admin automatically for convenience
  sheet.appendRow([
     newId,
     emailLower,
     makeAdmin,
     createdAt,
     createdAt
  ]);
  
  return jsonResponse({ data: { email: emailLower, isAdmin: makeAdmin } });
}

function getAllUsers(adminEmail) {
  if (!adminEmail) return jsonResponse({ error: 'Admin email required' });
  var emailLower = adminEmail.toLowerCase();
  var sheet = getUsersSheet();
  
  if (sheet.getLastRow() <= 1) return jsonResponse({ data: [] });
  var data = sheet.getDataRange().getValues();
  
  var isAdmin = false;
  for (var i = 1; i < data.length; i++) {
     if (String(data[i][USER_COL.EMAIL] || '').toLowerCase() === emailLower) {
         var valAdmin = data[i][USER_COL.IS_ADMIN];
         isAdmin = valAdmin === true || String(valAdmin).toLowerCase() === 'true';
         break;
     }
  }
  
  if (!isAdmin) {
     return jsonResponse({ error: 'Unauthorized. Not an admin.' });
  }
  
  var users = [];
  for (var i = 1; i < data.length; i++) {
     if (data[i][USER_COL.EMAIL] === '') continue;
     var valAdminLoop = data[i][USER_COL.IS_ADMIN];
     users.push({
        id: String(data[i][USER_COL.ID]),
        email: String(data[i][USER_COL.EMAIL]),
        isAdmin: valAdminLoop === true || String(valAdminLoop).toLowerCase() === 'true',
        createdAt: String(data[i][USER_COL.CREATED_AT]),
        lastLoginAt: String(data[i][USER_COL.LAST_LOGIN_AT])
     });
  }
  
  return jsonResponse({ data: users });
}

// ─── Task CRUD ───────────────────────────────────────────────────

function getAllTasks(ownerEmail) {
  var sheet = getTasksSheet();

  if (sheet.getLastRow() <= 1) {
    return jsonResponse({ data: [] });
  }

  var data = sheet.getDataRange().getValues();
  var tasks = [];

  for (var i = 1; i < data.length; i++) {
    if (data[i][TASK_COL.ID] === '') continue;

    var rowEmail = String(data[i][TASK_COL.OWNER_EMAIL] || '');
    
    if (!ownerEmail || rowEmail.toLowerCase() !== ownerEmail.toLowerCase()) {
      continue;
    }

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
      ownerEmail: rowEmail
    });
  }

  tasks.reverse();
  return jsonResponse({ data: tasks });
}

function addTask(params) {
  if (!params.ownerEmail) {
    return jsonResponse({ error: 'ownerEmail is required' });
  }

  var sheet = getTasksSheet();
  var id = Utilities.getUuid();
  var createdAt = new Date().toISOString();

  sheet.appendRow([
    id,
    params.subject || '',
    params.task || '',
    params.category || '',
    params.deadline || '',
    '',                           
    params.status || 'Not Started',
    params.note || '',
    createdAt,
    params.academicYear || '',
    params.semester || '',
    params.ownerEmail.toLowerCase()
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
      semester: params.semester || '',
      ownerEmail: params.ownerEmail.toLowerCase()
    }
  });
}

function updateTask(id, params) {
  var sheet = getTasksSheet();
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][TASK_COL.ID]) === String(id)) {
      var rowEmail = String(data[i][TASK_COL.OWNER_EMAIL] || '');
      if (params.ownerEmail && rowEmail && rowEmail.toLowerCase() !== params.ownerEmail.toLowerCase()) {
         return jsonResponse({ error: 'Unauthorized to update this task' });
      }

      if (params.subject != null) sheet.getRange(i + 1, TASK_COL.SUBJECT + 1).setValue(params.subject);
      if (params.task != null) sheet.getRange(i + 1, TASK_COL.TASK + 1).setValue(params.task);
      if (params.category != null) sheet.getRange(i + 1, TASK_COL.CATEGORY + 1).setValue(params.category);
      if (params.deadline != null) sheet.getRange(i + 1, TASK_COL.DEADLINE + 1).setValue(params.deadline);
      if (params.status != null) sheet.getRange(i + 1, TASK_COL.STATUS + 1).setValue(params.status);
      if (params.note != null) sheet.getRange(i + 1, TASK_COL.NOTE + 1).setValue(params.note);

      return jsonResponse({ data: { id: id, success: true } });
    }
  }

  return jsonResponse({ error: 'Task not found' });
}

function deleteTask(id, requestedEmail) {
  var sheet = getTasksSheet();
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][TASK_COL.ID]) === String(id)) {
      var rowEmail = String(data[i][TASK_COL.OWNER_EMAIL] || '');
      if (requestedEmail && rowEmail && rowEmail.toLowerCase() !== requestedEmail.toLowerCase()) {
         return jsonResponse({ error: 'Unauthorized to delete this task' });
      }

      sheet.deleteRow(i + 1);
      return jsonResponse({ success: true });
    }
  }

  return jsonResponse({ error: 'Task not found' });
}

// ─── Subject CRUD ────────────────────────────────────────────────

function getAllSubjects(ownerEmail) {
  var sheet = getSubjectsSheet();

  if (sheet.getLastRow() <= 1) return jsonResponse({ data: [] });

  var data = sheet.getDataRange().getValues();
  var subjects = [];

  for (var i = 1; i < data.length; i++) {
    if (data[i][SUBJECT_COL.ID] === '') continue;

    var rowEmail = String(data[i][SUBJECT_COL.OWNER_EMAIL] || '');
    if (!ownerEmail || rowEmail.toLowerCase() !== ownerEmail.toLowerCase()) continue;

    subjects.push({
      id: String(data[i][SUBJECT_COL.ID]),
      name: String(data[i][SUBJECT_COL.NAME]),
      academicYear: String(data[i][SUBJECT_COL.ACADEMIC_YEAR] || ''),
      semester: String(data[i][SUBJECT_COL.SEMESTER] || ''),
      ownerEmail: rowEmail
    });
  }

  return jsonResponse({ data: subjects });
}

function addSubject(params) {
  if (!params.ownerEmail) return jsonResponse({ error: 'ownerEmail required' });

  var sheet = getSubjectsSheet();
  var id = Utilities.getUuid();

  sheet.appendRow([
    id,
    params.name || '',
    params.academicYear || '',
    params.semester || '',
    params.ownerEmail.toLowerCase()
  ]);

  return jsonResponse({
    data: { id: id, name: params.name || '', ownerEmail: params.ownerEmail.toLowerCase() }
  });
}

function deleteSubject(id, requestedEmail) {
  var sheet = getSubjectsSheet();
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][SUBJECT_COL.ID]) === String(id)) {
      var rowEmail = String(data[i][SUBJECT_COL.OWNER_EMAIL] || '');
      if (requestedEmail && rowEmail && rowEmail.toLowerCase() !== requestedEmail.toLowerCase()) {
         return jsonResponse({ error: 'Unauthorized' });
      }
      
      // Capture subject data before deleting
      var subjectName = String(data[i][SUBJECT_COL.NAME] || '');
      var acaYear = String(data[i][SUBJECT_COL.ACADEMIC_YEAR] || '');
      var acaSem = String(data[i][SUBJECT_COL.SEMESTER] || '');
      
      // Delete the subject
      sheet.deleteRow(i + 1);

      // Cascade delete tasks linking to this subject
      if (subjectName) {
        var tasksSheet = getTasksSheet();
        // Return early if no tasks exist
        if (tasksSheet.getLastRow() > 1) {
          var tasksData = tasksSheet.getDataRange().getValues();
          
          // Loop backwards to preserve indices when deleting rows
          for (var j = tasksData.length - 1; j >= 1; j--) {
            var tSubject = String(tasksData[j][TASK_COL.SUBJECT] || '');
            var tYear = String(tasksData[j][TASK_COL.ACADEMIC_YEAR] || '');
            var tSem = String(tasksData[j][TASK_COL.SEMESTER] || '');
            var tEmail = String(tasksData[j][TASK_COL.OWNER_EMAIL] || '');
            
            if (tSubject === subjectName && tYear === acaYear && tSem === acaSem && tEmail.toLowerCase() === requestedEmail.toLowerCase()) {
              tasksSheet.deleteRow(j + 1);
            }
          }
        }
      }

      return jsonResponse({ success: true });
    }
  }

  return jsonResponse({ error: 'Not found' });
}

// ─── Utility ─────────────────────────────────────────────────────

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
