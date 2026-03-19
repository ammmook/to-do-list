// Google Apps Script — paste this into your Google Sheet's Apps Script editor
// (Extensions > Apps Script)
//
// After pasting, click Deploy > New deployment > Web app
// - Execute as: Me
// - Who has access: Anyone
// Then copy the URL and paste it into your .env file as VITE_GOOGLE_SHEET_API_URL
//
// IMPORTANT: Your Google Sheet should have the first row as headers:
// id | text | completed | createdAt
// (or leave it empty — the script will create headers automatically)

const SHEET_NAME = 'Sheet1'; // Change this if your sheet tab has a different name

function doGet(e) {
  const action = e.parameter.action;

  switch (action) {
    case 'getAll':
      return getAllTodos();
    case 'add':
      return addTodoItem(e.parameter.text);
    case 'update':
      return updateTodoItem(e.parameter.id, e.parameter);
    case 'delete':
      return deleteTodoItem(e.parameter.id);
    default:
      return jsonResponse({ error: 'Unknown action: ' + action });
  }
}

function doPost(e) {
  // Also handle POST in case it's needed
  const body = JSON.parse(e.postData.contents);
  return doGet({ parameter: body });
}

function getAllTodos() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  
  if (sheet.getLastRow() <= 1) {
    // No data or only headers
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['id', 'text', 'completed', 'createdAt']);
    }
    return jsonResponse({ data: [] });
  }
  
  const data = sheet.getDataRange().getValues();
  const todos = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === '') continue; // skip empty rows
    todos.push({
      id: String(data[i][0]),
      text: String(data[i][1]),
      completed: data[i][2] === true || data[i][2] === 'TRUE' || data[i][2] === 'true',
      createdAt: String(data[i][3]),
    });
  }

  // Return newest first
  todos.reverse();

  return jsonResponse({ data: todos });
}

function addTodoItem(text) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const id = Utilities.getUuid();
  const createdAt = new Date().toISOString();

  // Ensure headers exist
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['id', 'text', 'completed', 'createdAt']);
  }

  sheet.appendRow([id, text, false, createdAt]);

  return jsonResponse({
    data: { id: id, text: text, completed: false, createdAt: createdAt },
  });
}

function updateTodoItem(id, params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      if (params.text !== undefined && params.text !== null) {
        sheet.getRange(i + 1, 2).setValue(params.text);
      }
      if (params.completed !== undefined && params.completed !== null) {
        var isCompleted = params.completed === true || params.completed === 'true';
        sheet.getRange(i + 1, 3).setValue(isCompleted);
      }

      return jsonResponse({
        data: {
          id: String(id),
          text: params.text !== undefined ? String(params.text) : String(data[i][1]),
          completed: params.completed !== undefined ? (params.completed === true || params.completed === 'true') : (data[i][2] === true || data[i][2] === 'TRUE'),
          createdAt: String(data[i][3]),
        },
      });
    }
  }

  return jsonResponse({ error: 'Todo not found' });
}

function deleteTodoItem(id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return jsonResponse({ success: true });
    }
  }

  return jsonResponse({ error: 'Todo not found' });
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
