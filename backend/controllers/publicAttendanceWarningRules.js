const express = require("express");
const router = express.Router();
const db = require("../config/db");

const mapRuleRow = (row) => ({
  id: row.id,
  rule_code: row.rule_code,
  rule_name: row.rule_name,
  description: row.description,
  min_consecutive_alpha: Number(row.min_consecutive_alpha || 0),
  min_consecutive_late: Number(row.min_consecutive_late || 0),
  min_accumulated_alpha: Number(row.min_accumulated_alpha || 0),
  min_accumulated_late: Number(row.min_accumulated_late || 0),
  sanction_level: row.sanction_level,
  recommendation: row.recommendation,
  // Generate a human-friendly label automatically (e.g., 'sp4' -> 'SP4', 'evaluasi_hr' -> 'Evaluasi Hr')
  sanction_label: (function (lvl) {
    const raw = String(lvl || "").trim();
    if (!raw || raw.toLowerCase() === "none") return "Belum Ada SP";
    const spMatch = raw.match(/^\s*sp\s*[-_]?\s*(\d+)\s*$/i);
    if (spMatch) return `SP${spMatch[1]}`;
    // Replace delimiters and title-case words
    return raw.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  })(row.sanction_level),
  // Deterministic badge class based on value; no hardcoded whitelist so new levels auto-get a badge
  sanction_badge: (function (lvl) {
    const m = String(lvl || "").toLowerCase();
    if (!m || m === "none") return "badge-ghost";
    const palette = ["badge-info", "badge-warning", "badge-error", "badge-secondary", "badge-success", "badge-neutral", "badge-ghost"];
    let hash = 0;
    for (let i = 0; i < m.length; i++) hash = (hash << 5) - hash + m.charCodeAt(i);
    const idx = Math.abs(hash) % palette.length;
    return palette[idx];
  })(row.sanction_level),
  effective_date: row.effective_date,
  is_active: Number(row.is_active || 0) === 1,
  notes: row.notes,
});

// Public read-only endpoint for attendance warning rules (active only)
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT
         r.id,
         r.rule_code,
         r.rule_name,
         r.description,
         r.min_consecutive_alpha,
         r.min_consecutive_late,
         r.min_accumulated_alpha,
         r.min_accumulated_late,
         r.sanction_level,
         r.recommendation,
         r.effective_date,
         r.is_active,
         r.notes
       FROM attendance_warning_rules r
       WHERE r.is_active = 1
       ORDER BY r.min_accumulated_alpha ASC, r.min_consecutive_alpha ASC, r.id DESC`
    );

    return res.json({ message: "Aturan peringatan kehadiran (publik) berhasil dimuat", data: rows.map(mapRuleRow), total: rows.length });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
