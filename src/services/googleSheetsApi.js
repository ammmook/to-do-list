const API_URL = import.meta.env.VITE_GOOGLE_SHEET_API_URL;

/**
 * Google Apps Script API Service
 * 
 * Multi-User Data Ownership:
 * Every API request MUST now include the `ownerEmail` of the logged-in user.
 * This instructs the backend to filter data and bind new records to this exact email.
 */

// ─── User API ────────────────────────────────────────────────────

export async function checkUserAndRole(userEmail) {
  try {
    const params = new URLSearchParams({
      action: 'checkUser',
      email: userEmail
    });
    const url = `${API_URL}?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.data; // { email, isAdmin }
  } catch (error) {
    console.error('Error checking user role:', error);
    throw error;
  }
}

export async function fetchAllUsers(adminEmail) {
  try {
    const params = new URLSearchParams({
      action: 'getAllUsers',
      adminEmail: adminEmail
    });
    const url = `${API_URL}?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.data || [];
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
}

// ─── Task API ────────────────────────────────────────────────────

export async function fetchTodosForUser(userEmail) {
  try {
    const params = new URLSearchParams({
      action: 'getAll',
      ownerEmail: userEmail
    });
    const url = `${API_URL}?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.data || [];
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw error;
  }
}

export async function addTodoWithUserEmail(formData, userEmail) {
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
      ownerEmail: userEmail // Explicitly binding data to user
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

export async function updateTodoWithUserEmail(id, updates, userEmail) {
  try {
    const params = new URLSearchParams({
      action: 'update',
      id: id,
      ownerEmail: userEmail
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

export async function deleteTodoWithUserEmail(id, userEmail) {
  try {
    const params = new URLSearchParams({
      action: 'delete',
      id: id,
      ownerEmail: userEmail
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

export async function fetchSavedSubjectsForUser(userEmail) {
  try {
    const params = new URLSearchParams({
      action: 'getSubjects',
      ownerEmail: userEmail
    });
    const url = `${API_URL}?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.data || [];
  } catch (error) {
    console.error('Error fetching subjects:', error);
    throw error;
  }
}

export async function saveNewSubjectWithUserEmail(subjectName, academicYear, semester, userEmail) {
  try {
    const params = new URLSearchParams({
      action: 'addSubject',
      name: subjectName,
      academicYear: String(academicYear),
      semester: String(semester),
      ownerEmail: userEmail // Explicitly binding data to user
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

export async function removeSubjectWithUserEmail(subjectId, userEmail) {
  try {
    const params = new URLSearchParams({
      action: 'deleteSubject',
      id: subjectId,
      ownerEmail: userEmail
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
