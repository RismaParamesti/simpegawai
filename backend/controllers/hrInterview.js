// Endpoint untuk update hasil wawancara (edit, bukan tambah baru)
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const {
  findAcceptedApplication,
  rejectApplicationBecauseCandidateAccepted,
  rejectOtherActiveApplications,
} = require("../utils/recruitmentApplicationGuard");

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

// Ambil semua kandidat yang lolos interview (result: 'passed')
router.get("/interviews", async (req, res) => {
  // Tampilkan hanya kandidat yang lolos (i.result = 'passed')
  // dan job_openings status = 'closed' dan hiring_status = 'completed'
  try {
    let query = `SELECT i.*, a.job_opening_id, c.name AS name, c.email, j.title, j.base_position, j.position_id, p.name AS position_name, a.photo_file
      FROM interviews i
      JOIN applications a ON i.application_id = a.id
      JOIN candidates c ON a.candidate_id = c.id
      JOIN job_openings j ON a.job_opening_id = j.id
      JOIN positions p ON j.position_id = p.id
      WHERE i.result = 'passed' AND j.status = 'closed' AND j.hiring_status = 'completed'
        AND c.deleted_at IS NULL`;
    const [rows] = await db.promise().query(query);
    res.json(rows);
  } catch (err) {
    console.error("[ERROR GET /api/interviews]", err);
    res.status(500).json({ message: err.message });
  }
});

// Endpoint detail kandidat lolos interview berdasarkan id interview
router.get("/interviews/:id", async (req, res) => {
  const { id } = req.params;
  try {
    let query = `SELECT i.*, c.name AS name, c.email, c.phone, c.gender, c.birth_place, c.date_of_birth, c.marital_status, c.nationality, c.address, c.nik, c.npwp, c.education_level, c.university, c.major, c.graduation_year, c.gpa, j.title, j.base_position, j.position_id, p.name AS position_name, a.photo_file, a.status AS application_status, j.status AS job_status, j.hiring_status, i.result AS interview_result, i.rating, i.recommendation, i.interviewer_notes, i.scheduled_date
      FROM interviews i
      JOIN applications a ON i.application_id = a.id
      JOIN candidates c ON a.candidate_id = c.id
      JOIN job_openings j ON a.job_opening_id = j.id
      JOIN positions p ON j.position_id = p.id
      WHERE i.id = ? AND c.deleted_at IS NULL`;
    const [rows] = await db.promise().query(query, [id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Data kandidat tidak ditemukan" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("[ERROR GET /api/interviews/:id]", err);
    res.status(500).json({ message: err.message });
  }
});

// Accept all applications by job_opening_id
router.put("/admin/applications/accept-by-job", async (req, res) => {
  const { job_opening_id } = req.body;
  if (!job_opening_id)
    return res.status(400).json({ message: "job_opening_id wajib diisi" });
  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();

    const [applications] = await connection.query(
      `SELECT id, candidate_id
       FROM applications
       WHERE job_opening_id = ?
         AND status NOT IN ('diterima', 'accepted', 'ditolak', 'rejected', 'withdrawn', 'canceled_by_company')
       FOR UPDATE`,
      [job_opening_id],
    );

    for (const application of applications) {
      const acceptedApplication = await findAcceptedApplication(
        connection,
        application.candidate_id,
        application.id,
      );

      if (acceptedApplication) {
        await rejectApplicationBecauseCandidateAccepted(
          connection,
          application,
          acceptedApplication,
        );
        continue;
      }

      await connection.query(
        `UPDATE applications SET status = 'diterima', reviewed_at = NOW() WHERE id = ?`,
        [application.id],
      );
      await rejectOtherActiveApplications(
        connection,
        application.candidate_id,
        application.id,
        "Tidak lolos karena kandidat sudah lolos pada lowongan ini.",
      );
    }

    await connection.commit();
    res.json({ success: true });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
});

// Complete job opening (status: closed, hiring_status: completed)
router.put("/job-openings/:jobId/complete", async (req, res) => {
  const { jobId } = req.params;
  try {
    await db.promise().query(
      `UPDATE job_openings SET status = 'closed', hiring_status = 'completed' WHERE id = ?`,
      [jobId],
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update interviews: completed & pending result -> passed
router.put("/admin/interviews/update-result-by-job", async (req, res) => {
  const { job_opening_id } = req.body;
  if (!job_opening_id)
    return res.status(400).json({ message: "job_opening_id wajib diisi" });
  try {
    await db.promise().query(
      `UPDATE interviews SET result = 'passed' WHERE job_opening_id = ? AND status = 'completed' AND (result IS NULL OR result = 'pending')`,
      [job_opening_id],
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update hasil interview (edit data lama)
router.put("/admin/interviews/:id/result", async (req, res) => {
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
      [interviewer_notes, status, result, normalizedRating, recommendation, id],
    );
    if (rows.affectedRows === 0) {
      return res.status(404).json({ message: "Interview tidak ditemukan" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cancel interview (set status to canceled)
router.put("/admin/interviews/:id/cancel", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.promise().query(
      `UPDATE interviews SET status = 'canceled' WHERE id = ?`,
      [id],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Interview tidak ditemukan" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
