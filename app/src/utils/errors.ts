export function getErrorMessage(error, fallback = "unknown error") {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (typeof error.message === "string" && error.message.trim()) return error.message;
  if (typeof error.error_description === "string" && error.error_description.trim()) return error.error_description;
  if (typeof error.details === "string" && error.details.trim()) return error.details;
  return fallback;
}