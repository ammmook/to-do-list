const API_URL = import.meta.env.VITE_GOOGLE_SHEET_API_URL;

/**
 * Google Apps Script CORS workaround:
 * All operations use GET requests with URL parameters.
 *
 * This service handles two data types:
 *   1. Tasks — the main todo items
 *   2. Subjects — saved subject names per academic term
 */

// ─── Task API ────────────────────────────────────────────────────

export async function fetchTodos() {
  try {
    const url = `${API_URL}?action=getAll`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.data || [];
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw error;
  }
}

export async function addTodo(formData) {
  try {
    const params = new URLSearchParams({
      action: 'add',
      subject: formData.subject,
      task: formData.task,
      category: formData.category || '',
      deadline: formData.deadline || '',
      status: formData.status || 'Not Started',
      note: formData.note || '',
      academicYear: String(formData.academicYear || ''),
      semester: String(formData.semester || ''),
    });
    const url = `${API_URL}?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.data;
  } catch (error) {
    console.error('Error adding todo:', error);
    throw error;
  }
}

export async function updateTodo(id, updates) {
  try {
    const params = new URLSearchParams({
      action: 'update',
      id: id,
    });
    if (updates.subject !== undefined) params.set('subject', updates.subject);
    if (updates.task !== undefined) params.set('task', updates.task);
    if (updates.category !== undefined) params.set('category', updates.category);
    if (updates.deadline !== undefined) params.set('deadline', updates.deadline);
    if (updates.status !== undefined) params.set('status', updates.status);
    if (updates.note !== undefined) params.set('note', updates.note);

    const url = `${API_URL}?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.data;
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error;
  }
}

export async function deleteTodo(id) {
  try {
    const params = new URLSearchParams({
      action: 'delete',
      id: id,
    });
    const url = `${API_URL}?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data;
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
}

// ─── Subject API ─────────────────────────────────────────────────
// Subjects are stored in a separate "Subjects" sheet tab,
// scoped by academicYear + semester.

export async function fetchSavedSubjects() {
  try {
    const url = `${API_URL}?action=getSubjects`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.data || [];
  } catch (error) {
    console.error('Error fetching subjects:', error);
    throw error;
  }
}

export async function saveNewSubject(subjectName, academicYear, semester) {
  try {
    const params = new URLSearchParams({
      action: 'addSubject',
      name: subjectName,
      academicYear: String(academicYear),
      semester: String(semester),
    });
    const url = `${API_URL}?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.data;
  } catch (error) {
    console.error('Error saving subject:', error);
    throw error;
  }
}

export async function removeSubject(subjectId) {
  try {
    const params = new URLSearchParams({
      action: 'deleteSubject',
      id: subjectId,
    });
    const url = `${API_URL}?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data;
  } catch (error) {
    console.error('Error removing subject:', error);
    throw error;
  }
}
