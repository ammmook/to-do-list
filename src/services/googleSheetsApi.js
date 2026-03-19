const API_URL = import.meta.env.VITE_GOOGLE_SHEET_API_URL;

/**
 * Google Apps Script CORS workaround:
 * All operations use GET requests with URL parameters.
 * Data model: id, subject, task, category, deadline, priority, status, note, createdAt
 */

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
      priority: formData.priority || 'Medium',
      status: formData.status || 'Not Started',
      note: formData.note || '',
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
    if (updates.priority !== undefined) params.set('priority', updates.priority);
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
