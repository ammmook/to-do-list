const API_URL = import.meta.env.VITE_GOOGLE_SHEET_API_URL;

/**
 * Google Apps Script CORS workaround:
 * All operations are sent as GET requests with URL parameters.
 * This avoids CORS preflight (OPTIONS) which Google Apps Script cannot handle.
 * For data payloads (add/update), we encode the data as a URL parameter.
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

export async function addTodo(text) {
  try {
    const params = new URLSearchParams({
      action: 'add',
      text: text,
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
    if (updates.text !== undefined) params.set('text', updates.text);
    if (updates.completed !== undefined) params.set('completed', updates.completed);
    
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
