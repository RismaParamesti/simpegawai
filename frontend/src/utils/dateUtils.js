export const toDateInputValue = (value) => {
  if (!value) return "";

  const valueString = String(value);
  const dateOnlyMatch = valueString.match(/^(\d{4}-\d{2}-\d{2})/);
  if (dateOnlyMatch) return dateOnlyMatch[1];

  const parsedDate = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return "";

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDateOnly = (value, fallback = "-") => {
  const dateKey = toDateInputValue(value);
  if (!dateKey) return fallback;

  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const getTodayDateKey = () => toDateInputValue(new Date());
