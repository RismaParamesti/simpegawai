const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");

const toSanctionLabel = (value) => {
  const raw = String(value || "").trim();
  if (!raw || raw.toLowerCase() === "none") return "Belum Ada SP";
  const spMatch = raw.match(/^\s*sp\s*[-_]?\s*(\d+)\s*$/i);
  if (spMatch) return `SP${spMatch[1]}`;
  return raw.replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

const toSanctionBadge = (value) => {
  const normalized = String(value || "").toLowerCase();
  if (!normalized || normalized === "none") return "badge-ghost";

  const palette = ["badge-info", "badge-warning", "badge-error", "badge-secondary", "badge-success", "badge-neutral", "badge-ghost"];
  let hash = 0;
  for (let i = 0; i < normalized.length; i += 1) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
  }

  return palette[Math.abs(hash) % palette.length];
};

const toDateOnly = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeLevel = (value) => {
  const raw = String(value || "").toLowerCase().trim();
  if (!raw) return null;
  if (raw === "none" || raw === "0" || raw === "-") return "none";

  if (/^\d+$/.test(raw)) {
    const num = Number.parseInt(raw, 10);
    return Number.isFinite(num) && num > 0 ? `sp${num}` : null;
  }

  const spMatch = raw.match(/^sp\s*[-_]?\s*(\d+)$/i);
  if (spMatch) {
    return `sp${Number.parseInt(spMatch[1], 10)}`;
  }

  const slug = raw
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return slug || null;
};

const parseInteger = (value, fallback = 0) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const buildRuleCode = async (effectiveDate) => {
  const referenceDate = new Date(effectiveDate || new Date());
  const year = referenceDate.getFullYear();

  const [rows] = await db.promise().query(
    `SELECT COUNT(*) AS total
     FROM attendance_warning_rules
     WHERE YEAR(effective_date) = ?`,
    [year],
  );

  const nextNumber = Number(rows[0]?.total || 0) + 1;
  const serial = String(nextNumber).padStart(3, "0");
  return `AWR-${year}-${serial}`;
};

const mapRuleRow = (row) => ({
  ...row,
  min_consecutive_late: Number(row.min_consecutive_late || 0),
  min_accumulated_late: Number(row.min_accumulated_late || 0),
  sanction_level: normalizeLevel(row.sanction_level) || "none",
  sanction_label: toSanctionLabel(row.sanction_level),
  sanction_badge: toSanctionBadge(row.sanction_level),
  is_active: Number(row.is_active || 0) === 1,
});

router.get("/", verifyToken, verifyRole(["hr"]), async (req, res) => {
  try {
    const { search, sanction_level, is_active } = req.query;

    let query = `SELECT
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
        r.notes,
        r.created_by_user_id,
        r.updated_by_user_id,
        r.created_at,
        r.updated_at,
        creator.name AS created_by_name,
        updater.name AS updated_by_name
      FROM attendance_warning_rules r
      LEFT JOIN users creator ON creator.id = r.created_by_user_id
      LEFT JOIN users updater ON updater.id = r.updated_by_user_id
      WHERE 1 = 1`;
    const params = [];

    if (search) {
      query += " AND (r.rule_code LIKE ? OR r.rule_name LIKE ? OR r.description LIKE ? OR r.recommendation LIKE ? OR r.min_consecutive_late LIKE ? OR r.min_accumulated_late LIKE ?)";
      const likeValue = `%${String(search).trim()}%`;
      params.push(likeValue, likeValue, likeValue, likeValue, likeValue, likeValue);
    }

    if (sanction_level) {
      query += " AND r.sanction_level = ?";
      params.push(normalizeLevel(sanction_level) || String(sanction_level).toLowerCase().trim());
    }

    if (is_active !== undefined && is_active !== "") {
      query += " AND r.is_active = ?";
      params.push(Number(is_active) ? 1 : 0);
    }

    query += " ORDER BY r.min_accumulated_alpha ASC, r.min_consecutive_alpha ASC, r.id DESC";

    const [rows] = await db.promise().query(query, params);

    return res.json({
      message: "Aturan peringatan kehadiran berhasil dimuat",
      total: rows.length,
      data: rows.map(mapRuleRow),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", verifyToken, verifyRole(["hr"]), async (req, res) => {
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
          r.notes,
          r.created_by_user_id,
          r.updated_by_user_id,
          r.created_at,
          r.updated_at,
          creator.name AS created_by_name,
          updater.name AS updated_by_name
       FROM attendance_warning_rules r
       LEFT JOIN users creator ON creator.id = r.created_by_user_id
       LEFT JOIN users updater ON updater.id = r.updated_by_user_id
       WHERE r.id = ?
       LIMIT 1`,
      [req.params.id],
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Aturan tidak ditemukan" });
    }

    return res.json({ data: mapRuleRow(rows[0]) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/", verifyToken, verifyRole(["hr"]), async (req, res) => {
  try {
    const ruleName = String(req.body.rule_name || "").trim();
    const description = String(req.body.description || "").trim() || null;
    const recommendation = String(req.body.recommendation || "").trim() || null;
    const notes = String(req.body.notes || "").trim() || null;
    const sanctionLevel = normalizeLevel(req.body.sanction_level);
    const minConsecutiveAlpha = parseInteger(req.body.min_consecutive_alpha, 0);
    const minConsecutiveLate = parseInteger(req.body.min_consecutive_late, 0);
    const minAccumulatedAlpha = parseInteger(req.body.min_accumulated_alpha, 0);
    const minAccumulatedLate = parseInteger(req.body.min_accumulated_late, 0);
    const effectiveDate = toDateOnly(req.body.effective_date || new Date());
    const isActive = Number(req.body.is_active) === 0 ? 0 : 1;

    if (!ruleName) {
      return res.status(400).json({ message: "rule_name wajib diisi" });
    }

    if (!sanctionLevel) {
      return res.status(400).json({ message: "sanction_level wajib diisi" });
    }

    if (!effectiveDate) {
      return res.status(400).json({ message: "effective_date tidak valid" });
    }

    const ruleCode = String(req.body.rule_code || "").trim() || (await buildRuleCode(effectiveDate));

    const [result] = await db.promise().query(
      `INSERT INTO attendance_warning_rules (
          rule_code,
          rule_name,
          description,
          min_consecutive_alpha,
          min_consecutive_late,
          min_accumulated_alpha,
          min_accumulated_late,
          sanction_level,
          recommendation,
          effective_date,
          is_active,
          notes,
          created_by_user_id,
          updated_by_user_id,
          created_at,
          updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        ruleCode,
        ruleName,
        description,
        minConsecutiveAlpha,
        minConsecutiveLate,
        minAccumulatedAlpha,
        minAccumulatedLate,
        sanctionLevel,
        recommendation,
        effectiveDate,
        isActive,
        notes,
        req.user.id,
        req.user.id,
      ],
    );

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
          r.notes,
          r.created_by_user_id,
          r.updated_by_user_id,
          r.created_at,
          r.updated_at,
          creator.name AS created_by_name,
          updater.name AS updated_by_name
       FROM attendance_warning_rules r
       LEFT JOIN users creator ON creator.id = r.created_by_user_id
       LEFT JOIN users updater ON updater.id = r.updated_by_user_id
       WHERE r.id = ?
       LIMIT 1`,
      [result.insertId],
    );

    return res.status(201).json({
      message: "Aturan peringatan kehadiran berhasil dibuat",
      data: mapRuleRow(rows[0]),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
});

router.put("/:id", verifyToken, verifyRole(["hr"]), async (req, res) => {
  try {
    const ruleName = String(req.body.rule_name || "").trim();
    const description = String(req.body.description || "").trim() || null;
    const recommendation = String(req.body.recommendation || "").trim() || null;
    const notes = String(req.body.notes || "").trim() || null;
    const sanctionLevel = req.body.sanction_level === undefined
      ? null
      : normalizeLevel(req.body.sanction_level);
    const minConsecutiveAlpha = req.body.min_consecutive_alpha === undefined ? null : parseInteger(req.body.min_consecutive_alpha, 0);
    const minConsecutiveLate = req.body.min_consecutive_late === undefined ? null : parseInteger(req.body.min_consecutive_late, 0);
    const minAccumulatedAlpha = req.body.min_accumulated_alpha === undefined ? null : parseInteger(req.body.min_accumulated_alpha, 0);
    const minAccumulatedLate = req.body.min_accumulated_late === undefined ? null : parseInteger(req.body.min_accumulated_late, 0);
    const effectiveDate = req.body.effective_date ? toDateOnly(req.body.effective_date) : null;
    const isActive = req.body.is_active === undefined ? null : Number(req.body.is_active) ? 1 : 0;

    if (!ruleName) {
      return res.status(400).json({ message: "rule_name wajib diisi" });
    }

    const [existingRows] = await db.promise().query(
      `SELECT id FROM attendance_warning_rules WHERE id = ? LIMIT 1`,
      [req.params.id],
    );

    if (!existingRows.length) {
      return res.status(404).json({ message: "Aturan tidak ditemukan" });
    }

    await db.promise().query(
      `UPDATE attendance_warning_rules
       SET
         rule_name = ?,
         description = ?,
         min_consecutive_alpha = COALESCE(?, min_consecutive_alpha),
         min_consecutive_late = COALESCE(?, min_consecutive_late),
         min_accumulated_alpha = COALESCE(?, min_accumulated_alpha),
         min_accumulated_late = COALESCE(?, min_accumulated_late),
         sanction_level = COALESCE(?, sanction_level),
         recommendation = ?,
         effective_date = COALESCE(?, effective_date),
         is_active = COALESCE(?, is_active),
         notes = ?,
         updated_by_user_id = ?,
         updated_at = NOW()
       WHERE id = ?`,
      [
        ruleName,
        description,
        minConsecutiveAlpha,
        minConsecutiveLate,
        minAccumulatedAlpha,
        minAccumulatedLate,
        sanctionLevel,
        recommendation,
        effectiveDate,
        isActive,
        notes,
        req.user.id,
        req.params.id,
      ],
    );

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
          r.notes,
          r.created_by_user_id,
          r.updated_by_user_id,
          r.created_at,
          r.updated_at,
          creator.name AS created_by_name,
          updater.name AS updated_by_name
       FROM attendance_warning_rules r
       LEFT JOIN users creator ON creator.id = r.created_by_user_id
       LEFT JOIN users updater ON updater.id = r.updated_by_user_id
       WHERE r.id = ?
       LIMIT 1`,
      [req.params.id],
    );

    return res.json({
      message: "Aturan peringatan kehadiran berhasil diperbarui",
      data: mapRuleRow(rows[0]),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
});

router.delete("/:id", verifyToken, verifyRole(["hr"]), async (req, res) => {
  try {
    const [result] = await db.promise().query(
      `DELETE FROM attendance_warning_rules WHERE id = ?`,
      [req.params.id],
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Aturan tidak ditemukan" });
    }

    return res.json({ message: "Aturan peringatan kehadiran berhasil dihapus" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
});

module.exports = router;