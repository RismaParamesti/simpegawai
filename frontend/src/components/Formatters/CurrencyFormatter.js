/**
 * Format currency value to Indonesian Rupiah format
 * @param {number} value - The value to format
 * @returns {string} Formatted currency string (e.g., "Rp 1.500.000")
 */
export const formatCurrency = (value) =>
  `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

export const normalizeCurrencyInput = (value) => {
  if (value === null || value === undefined) return "";

  if (typeof value === "number") {
    return String(Math.trunc(value));
  }

  const raw = String(value).trim();
  if (!raw) return "";

  if (/^\d+[.,]\d{1,2}$/.test(raw)) {
    return raw.split(/[.,]/)[0].replace(/\D/g, "");
  }

  return raw.replace(/\D/g, "");
};

export const formatCurrencyInput = (value) => {
  const digits = normalizeCurrencyInput(value);
  if (!digits) return "";
  return Number(digits).toLocaleString("id-ID");
};

export default formatCurrency;
