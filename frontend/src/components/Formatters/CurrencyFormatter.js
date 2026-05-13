/**
 * Format currency value to Indonesian Rupiah format
 * @param {number} value - The value to format
 * @returns {string} Formatted currency string (e.g., "Rp 1.500.000")
 */
export const formatCurrency = (value) =>
  `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

export default formatCurrency;
