// Endpoint untuk update hasil wawancara (edit, bukan tambah baru)
const express = require('express');
const router = express.Router();
const db = require('../config/db');

const ASSESSMENT_START = "[ASSESSMENT_CRITERIA]";
const ASSESSMENT_END = "[/ASSESSMENT_CRITERIA]";

const parseAssessmentSummary = (notes) => {
  const rawNotes = String(notes || "");
  const startIndex = rawNotes.indexOf(ASSESSMENT_START);
  const endIndex = rawNotes.indexOf(ASSESSMENT_END);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    return null;
  }

  const json = rawNotes
    .slice(startIndex + ASSESSMENT_START.length, endIndex)
    .trim();

  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const normalizeAverageRating = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.max(0, Math.min(100, Number(number.toFixed(2))));
};

const resolveAverageRating = ({ average_rating, rating, interviewer_notes }) => {
  const providedRating = normalizeAverageRating(average_rating ?? rating);
  if (providedRating !== null) return providedRating;

  const summary = parseAssessmentSummary(interviewer_notes);
  const assessmentRating = normalizeAverageRating(summary?.rating);
  if (assessmentRating !== null) return assessmentRating;

  return null;
};

// Update hasil interview (edit data lama)
router.put('/admin/interviews/:id/result', async (req, res) => {
  const { id } = req.params;
  const { interviewer_notes, status, result, rating, average_rating, recommendation } = req.body;
  const normalizedRating = resolveAverageRating({
    average_rating,
    rating,
    interviewer_notes,
  });
  try {
    const [rows] = await db.promise().query(
      `UPDATE interviews SET interviewer_notes = COALESCE(?, interviewer_notes), status = COALESCE(?, status), result = COALESCE(?, result), rating = COALESCE(?, rating), recommendation = COALESCE(?, recommendation) WHERE id = ?`,
      [interviewer_notes, status, result, normalizedRating, recommendation, id]
    );
    if (rows.affectedRows === 0) {
      return res.status(404).json({ message: 'Interview tidak ditemukan' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
