/**
 * Auto-Priority Calculation
 *
 * Replaces manual priority selection with a deterministic calculation
 * based on the due date and current status.
 *
 * Equivalent Excel formula:
 * =IF(OR(DueDate="", Status="Done"), "", IF(DueDate-TODAY() > 14, "Low", IF(DueDate-TODAY() > 3, "Medium", "High")))
 *
 * WHY auto-calculated:
 * Manual priority is subjective and often forgotten. By deriving it from
 * the deadline, we guarantee consistency: tasks due soon are always "High",
 * regardless of whether the user remembered to update the field.
 */

/**
 * Calculates the priority of a task based on its due date and status.
 *
 * @param {string} dueDate - ISO date string (e.g. "2026-04-15") or empty string
 * @param {string} status  - One of "Not Started", "Pending", "Done"
 * @returns {string}       - "High", "Medium", "Low", or "" (no priority)
 */
export function calculateTaskPriority(dueDate, status) {
  // Completed tasks and tasks without a deadline have no priority
  const hasNoDueDate = !dueDate || dueDate.trim() === '';
  const isAlreadyDone = status === 'Done';

  if (hasNoDueDate || isAlreadyDone) {
    return '';
  }

  // Calculate the number of calendar days between today and the deadline
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadlineDate = new Date(dueDate);
  deadlineDate.setHours(0, 0, 0, 0);

  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const daysUntilDeadline = Math.ceil((deadlineDate - today) / millisecondsPerDay);

  // Thresholds mirror the Excel formula exactly
  if (daysUntilDeadline > 14) {
    return 'Low';
  }

  if (daysUntilDeadline > 3) {
    return 'Medium';
  }

  // 3 days or fewer (including overdue tasks) → urgent
  return 'High';
}
