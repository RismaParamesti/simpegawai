// Endpoint untuk update hasil wawancara (edit, bukan tambah baru)
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Update hasil interview (edit data lama)
router.put('/admin/interviews/:id/result', async (req, res) => {
  const { id } = req.params;
  const { interviewer_notes, status, result, rating, recommendation } = req.body;
  try {
    const [rows] = await db.promise().query(
      `UPDATE interviews SET interviewer_notes = COALESCE(?, interviewer_notes), status = COALESCE(?, status), result = COALESCE(?, result), rating = COALESCE(?, rating), recommendation = COALESCE(?, recommendation) WHERE id = ?`,
      [interviewer_notes, status, result, rating, recommendation, id]
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
