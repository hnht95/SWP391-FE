/**
 * Date formatting utilities for consistent date display across the application
 */

/**
 * Format date to "DD MMM YYYY" format (e.g., "26 Oct 2025")
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date): string => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "";

  const day = dateObj.getDate();
  const month = dateObj.toLocaleString("en-US", { month: "short" });
  const year = dateObj.getFullYear();

  return `${day} ${month} ${year}`;
};

/**
 * Format date to "DD MMM YYYY, HH:MM" format (e.g., "26 Oct 2025, 14:30")
 * @param date - Date string or Date object
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: string | Date): string => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "";

  const day = dateObj.getDate();
  const month = dateObj.toLocaleString("en-US", { month: "short" });
  const year = dateObj.getFullYear();
  const hours = dateObj.getHours().toString().padStart(2, "0");
  const minutes = dateObj.getMinutes().toString().padStart(2, "0");

  return `${day} ${month} ${year}, ${hours}:${minutes}`;
};

/**
 * Format date range to "DD MMM YYYY - DD MMM YYYY"
 * @param startDate - Start date string or Date object
 * @param endDate - End date string or Date object
 * @returns Formatted date range string
 */
export const formatDateRange = (
  startDate: string | Date,
  endDate: string | Date
): string => {
  const start = formatDate(startDate);
  const end = formatDate(endDate);

  if (!start || !end) return "";

  return `${start} - ${end}`;
};

/**
 * Format date for input[type="date"] value (YYYY-MM-DD)
 * @param date - Date string or Date object
 * @returns ISO date string (YYYY-MM-DD)
 */
export const formatDateForInput = (date: string | Date): string => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "";

  return dateObj.toISOString().split("T")[0];
};

/**
 * Format date for input[type="datetime-local"] value (YYYY-MM-DDTHH:mm)
 * @param date - Date string or Date object
 * @returns ISO datetime string (YYYY-MM-DDTHH:mm)
 */
export const formatDateTimeForInput = (date: string | Date): string => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "";

  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
  const day = dateObj.getDate().toString().padStart(2, "0");
  const hours = dateObj.getHours().toString().padStart(2, "0");
  const minutes = dateObj.getMinutes().toString().padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
