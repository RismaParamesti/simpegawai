const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");

const normalizePercent = (value, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return parsed >= 1 ? parsed / 100 : parsed;
};

const getLatestPayrollSettings = async () => {
  const [rows] = await db.promise().query(
    "SELECT id, transport_per_day, meal_per_day, health_percentage, bpjs_percentage, tax, late_deduction_percentage, alpha_deduction_percentage FROM payroll_settings ORDER BY created_at DESC LIMIT 1"
  );

  return rows[0] || null;
};

const DEFAULT_PAYROLL_SETTINGS = {
  transport_per_day: 50000,
  meal_per_day: 25000,
  health_percentage: 0.01,
  bpjs_percentage: 0.01,
  tax: 0.03,
  late_deduction_percentage: 0.02,
  alpha_deduction_percentage: 1,
};

// Get current payroll settings (Finance/HR)
router.get(
  "/",
  verifyToken,
  verifyRole(["finance", "hr"]),
  async (req, res) => {
    try {
      const [rows] = await db.promise().query(
        "SELECT id, transport_per_day, meal_per_day, health_percentage, bpjs_percentage, tax, late_deduction_percentage, alpha_deduction_percentage, updated_by, updated_at, created_at FROM payroll_settings ORDER BY created_at DESC LIMIT 1"
      );
      // Exclude Commissioner positions from validation counts
      const [positionValidationRows] = await db.promise().query(
        `SELECT
            COUNT(*) AS total_positions,
            SUM(CASE WHEN base_salary IS NULL THEN 1 ELSE 0 END) AS missing_base_salary,
            SUM(CASE WHEN position_allowance IS NULL THEN 1 ELSE 0 END) AS missing_position_allowance
         FROM positions
         WHERE NOT (
           LOWER(COALESCE(name, '')) LIKE '%commissioner%'
           OR LOWER(COALESCE(level, '')) = 'commissioner'
         )`
      );
      const positionValidation = positionValidationRows[0] || {};
      const validation = {
        has_missing_payroll_settings: rows.length === 0,
        has_missing_position_components:
          Number(positionValidation.missing_base_salary || 0) > 0 ||
          Number(positionValidation.missing_position_allowance || 0) > 0,
        total_positions: Number(positionValidation.total_positions || 0),
        missing_base_salary_count: Number(positionValidation.missing_base_salary || 0),
        missing_position_allowance_count: Number(positionValidation.missing_position_allowance || 0),
      };

      if (rows.length === 0) {
        return res.status(200).json({
          ...DEFAULT_PAYROLL_SETTINGS,
          note: "Using defaults; no settings row found",
          validation,
        });
      }
      res.status(200).json({
        ...rows[0],
        validation,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Update payroll settings (Finance/HR) - Creates a new record
router.put(
  "/",
  verifyToken,
  verifyRole(["finance", "hr"]),
  async (req, res) => {
    try {
      // Debug: log roles and incoming payload to help investigate missing fields
      try {
        console.debug('[DEBUG] PUT /api/payroll-settings - user:', req.user?.id, 'roles:', req.user?.roles, 'body:', req.body);
      } catch (e) {
        console.debug('[DEBUG] PUT /api/payroll-settings - failed to stringify debug info');
      }
      const roles = new Set((req.user?.roles || []).map((role) => String(role || "").toLowerCase()));
      const canEditTax = roles.has("finance");
      const canEditOperational = roles.has("hr");

      if (!canEditTax && !canEditOperational) {
        return res.status(403).json({ message: "Access denied" });
      }

      const {
        transport_per_day,
        meal_per_day,
        health_percentage,
        bpjs_percentage,
        tax,
        late_deduction_percentage,
        alpha_deduction_percentage,
      } = req.body;

      const latestSettings = await getLatestPayrollSettings();
      const baseSettings = latestSettings || DEFAULT_PAYROLL_SETTINGS;

      const normalizedTransportPerDay = canEditOperational
        ? Number(transport_per_day ?? baseSettings.transport_per_day)
        : Number(baseSettings.transport_per_day);
      const normalizedMealPerDay = canEditOperational
        ? Number(meal_per_day ?? baseSettings.meal_per_day)
        : Number(baseSettings.meal_per_day);
      const normalizedHealthPercentage = canEditOperational
        ? normalizePercent(
            health_percentage,
            Number(baseSettings.health_percentage ?? DEFAULT_PAYROLL_SETTINGS.health_percentage)
          )
        : Number(baseSettings.health_percentage ?? DEFAULT_PAYROLL_SETTINGS.health_percentage);
      const normalizedBpjsPercentage = canEditOperational
        ? normalizePercent(
            bpjs_percentage,
            Number(baseSettings.bpjs_percentage ?? DEFAULT_PAYROLL_SETTINGS.bpjs_percentage)
          )
        : Number(baseSettings.bpjs_percentage ?? DEFAULT_PAYROLL_SETTINGS.bpjs_percentage);
      const normalizedLateDeductionPercentage = canEditOperational
        ? normalizePercent(
            late_deduction_percentage,
            Number(
              baseSettings.late_deduction_percentage ??
                DEFAULT_PAYROLL_SETTINGS.late_deduction_percentage
            )
          )
        : Number(
            baseSettings.late_deduction_percentage ??
              DEFAULT_PAYROLL_SETTINGS.late_deduction_percentage
          );
      const normalizedAlphaDeductionPercentage = canEditOperational
        ? normalizePercent(
            alpha_deduction_percentage,
            Number(
              baseSettings.alpha_deduction_percentage ??
                DEFAULT_PAYROLL_SETTINGS.alpha_deduction_percentage
            )
          )
        : Number(
            baseSettings.alpha_deduction_percentage ??
              DEFAULT_PAYROLL_SETTINGS.alpha_deduction_percentage
          );
      const normalizedTax = canEditTax
        ? normalizePercent(tax, Number(baseSettings.tax ?? DEFAULT_PAYROLL_SETTINGS.tax))
        : Number(baseSettings.tax ?? DEFAULT_PAYROLL_SETTINGS.tax);

      const updaterId = req.user.id;

      // Always INSERT new record instead of updating
      const [result] = await db.promise().query(
        `INSERT INTO payroll_settings (transport_per_day, meal_per_day, health_percentage, bpjs_percentage, tax, late_deduction_percentage, alpha_deduction_percentage, updated_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          normalizedTransportPerDay,
          normalizedMealPerDay,
          normalizedHealthPercentage,
          normalizedBpjsPercentage,
          normalizedTax,
          normalizedLateDeductionPercentage,
          normalizedAlphaDeductionPercentage,
          updaterId,
        ]
      );

      const [inserted] = await db
        .promise()
        .query(
          "SELECT id, transport_per_day, meal_per_day, health_percentage, bpjs_percentage, tax, late_deduction_percentage, alpha_deduction_percentage, updated_by, updated_at, created_at FROM payroll_settings WHERE id = ?",
          [result.insertId]
        );

      res.status(200).json({ message: "Settings saved as new version", settings: inserted[0] });
    } catch (err) {
      console.error("Error in PUT /api/payroll-settings:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

module.exports = router;
