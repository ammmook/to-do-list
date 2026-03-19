/**
 * Academic Term Constants
 *
 * This module provides the available Year and Semester values
 * used by the TermSelector. Subjects are NOT pre-configured here;
 * users type them freely when creating a task.
 *
 * WHY separate from components:
 * These constants control what terms exist in the UI dropdowns.
 * Keeping them here makes it trivial to add a new academic year
 * without touching component code.
 */

export const AVAILABLE_ACADEMIC_YEARS = [2567, 2568, 2569];

export const AVAILABLE_SEMESTERS = [1, 2];
