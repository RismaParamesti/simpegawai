const express = require("express");
const router = express.Router();
const db = require("../config/db");

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
const bcrypt = require("bcryptjs");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  getRequiredDocuments,
  validateDocuments,
  DOCUMENT_FIELD_METADATA,
} = require("../utils/documentRequirements");
const {
  ACCEPTED_APPLICATION_STATUSES,
  findAcceptedApplication,
  rejectApplicationBecauseCandidateAccepted,
  rejectOtherActiveApplications,
} = require("../utils/recruitmentApplicationGuard");

let applicationsTableHasCoverLetterFilePromise = null;
const applicationsTableHasCoverLetterFile = async () => {
  if (!applicationsTableHasCoverLetterFilePromise) {
    applicationsTableHasCoverLetterFilePromise = db
      .promise()
      .query(
        `SELECT COUNT(*) AS cnt
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'applications'
           AND COLUMN_NAME = 'cover_letter_file'`,
      )
      .then(([rows]) => rows[0].cnt > 0)
      .catch((error) => {
        console.warn(
          "Failed to inspect applications.cover_letter_file column:",
          error.message,
        );
        return false;
      });
  }

  return applicationsTableHasCoverLetterFilePromise;
};

// ============================
// GET INTERVIEW COMPLETED, DISQUALIFIED & APPLICATIONS CANCELED BY COMPANY (HR)
// ============================
router.get(
  "/interviews/history-combined",
  verifyToken,
  verifyRole(["hr"]),
  async (req, res) => {
    try {
      const includeActive = String(req.query.include_active || "").toLowerCase() === "true";
      const historyStatuses = includeActive
        ? "('scheduled', 'rescheduled', 'completed', 'disqualified', 'cancelled', 'canceled_by_company', '')"
        : "('completed', 'disqualified', 'cancelled', 'canceled_by_company', '')";

      // Ambil interview status completed, disqualified, cancelled, dan canceled_by_company
      const [interviews] = await db.promise().query(`
        SELECT i.*, 
               c.name AS candidate_name, c.email AS candidate_email,
               a.status AS application_status, a.job_opening_id,
               jo.title AS job_title, jo.location AS job_location,
               jo.hiring_status AS job_hiring_status,
               jo.assessment_criteria,
               p.name AS position_name,
               e.full_name AS interviewer_name
        FROM interviews i
        LEFT JOIN candidates c ON i.candidate_id = c.id
        LEFT JOIN applications a ON i.application_id = a.id
        LEFT JOIN job_openings jo ON a.job_opening_id = jo.id
        LEFT JOIN positions p ON jo.position_id = p.id
        LEFT JOIN employees e ON i.interviewer_id = e.id
        WHERE i.status IN ${historyStatuses}
        ORDER BY i.scheduled_date DESC
      `);

      res.json({
        history: interviews,
        total: interviews.length,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ============================
// GET ALL INTERVIEWS (HR)
// ============================
// Jadwal aktif (scheduled/rescheduled)
router.get(
  "/interviews",
  verifyToken,
  verifyRole(["hr"]),
  async (req, res) => {
    try {
      const [rows] = await db.promise().query(`
        SELECT i.*, 
               c.name AS candidate_name, c.email AS candidate_email,
               a.status AS application_status, a.job_opening_id,
               jo.title AS job_title, jo.location AS job_location,
               jo.hiring_status AS job_hiring_status,
               jo.assessment_criteria,
               p.name AS position_name,
               e.full_name AS interviewer_name
        FROM interviews i
        LEFT JOIN candidates c ON i.candidate_id = c.id
        LEFT JOIN applications a ON i.application_id = a.id
        LEFT JOIN job_openings jo ON a.job_opening_id = jo.id
        LEFT JOIN positions p ON jo.position_id = p.id
        LEFT JOIN employees e ON i.interviewer_id = e.id
        WHERE i.status IN ('scheduled', 'rescheduled')
        ORDER BY i.scheduled_date DESC
      `);
      res.json({ interviews: rows, total: rows.length });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ============================
// GET ALL APPLICATIONS (HR)
// ============================
router.get(
  "/applications",
  verifyToken,
  verifyRole(["hr"]),
  async (req, res) => {
    try {
      const { status, job_opening_id } = req.query;
      const hasCoverLetterFileColumn = await applicationsTableHasCoverLetterFile();
      const coverLetterSelect = hasCoverLetterFileColumn
        ? "a.cover_letter_file AS cover_letter_file"
        : "CAST(a.cover_letter AS CHAR) AS cover_letter_file";

      let query = `
            SELECT  
  a.id AS application_id,
  a.job_opening_id,
  a.candidate_id,
  a.status,
  a.admin_notes,
  a.submitted_at,
  a.reviewed_at,

  c.id AS candidate_id,
  c.name,
  c.email,
  c.phone,
  c.gender,
  c.birth_place,
  c.date_of_birth,
  c.marital_status,
  c.nationality,
  c.address,
  c.nik,
  c.npwp,
  c.education_level,
  c.university,
  c.major,
  c.graduation_year,
  c.linkedin,
  c.portfolio,
  c.expected_salary,

  ${coverLetterSelect},
  a.cv_file,
  a.ktp_file,
  a.photo_file,
  a.ijazah_file,
  a.transcript_file,
  a.certificate_file,
  a.experience_letter_file,
  a.reference_letter_file,
  a.skck_file,
  a.portfolio_file,
  a.github_link,
  a.design_link,
  a.youtube_link,
  a.campaign_link,

  jo.title AS job_title,
  jo.status AS job_status,
  jo.hiring_status AS job_hiring_status,
  jo.base_position,
  p.name AS position_name,
  e.full_name AS reviewer_name

FROM applications a
JOIN candidates c ON a.candidate_id = c.id
JOIN job_openings jo ON a.job_opening_id = jo.id
JOIN positions p ON jo.position_id = p.id
LEFT JOIN employees e ON a.reviewed_by = e.id
        `;

      const conditions = [];
      const params = [];

      if (status) {
        conditions.push("a.status = ?");
        params.push(status);
      }

      if (job_opening_id) {
        conditions.push("a.job_opening_id = ?");
        params.push(job_opening_id);
      }

      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }

      query += " ORDER BY a.submitted_at DESC";

      const [applications] = await db.promise().query(query, params);

      res.json({ applications, total: applications.length });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ============================
// UPDATE APPLICATION STATUS (HR)
// ============================
router.put(
  "/applications/:id/status",
  verifyToken,
  verifyRole(["hr"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      let { status, admin_notes } = req.body;

      // Sesuaikan dengan enum di tabel applications
      const validStatuses = [
        "submitted",
        "screening",
        "lolos_dokumen",
        "wawancara",
        "diterima",
        "ditolak",
      ];

      // Jika admin_notes diisi dan status kosong/null, set status jadi 'ditolak' (sesuai enum DB)
      if ((!status || status === "") && admin_notes && admin_notes.trim() !== "") {
        status = "ditolak";
      }

      if (!status || !validStatuses.includes(status)) {
        console.log("[DEBUG] Invalid status:", status);
        return res.status(400).json({ message: "Invalid status" });
      }

      // Pastikan id integer
      const appId = parseInt(id, 10);
      if (isNaN(appId)) {
        return res.status(400).json({ message: "Invalid application id" });
      }

      // Cek aplikasi yang tersedia
      const [allApps] = await db.promise().query("SELECT id FROM applications");
      if (!allApps || allApps.length === 0) {
        return res.status(404).json({ message: "No applications in database" });
      }

      // Query aplikasi dengan id
      const [application] = await db
        .promise()
        .query("SELECT * FROM applications WHERE id = ?", [appId]);

      if (application.length === 0) {
        return res.status(404).json({
          message: `Application not found for id ${appId}. Available ids: [${allApps.map((a) => a.id).join(", ")}]`,
        });
      }

      const currentApplication = application[0];
      const acceptedApplication = await findAcceptedApplication(
        db.promise(),
        currentApplication.candidate_id,
        currentApplication.id,
      );

      if (acceptedApplication && !ACCEPTED_APPLICATION_STATUSES.includes(status)) {
        const notes = await rejectApplicationBecauseCandidateAccepted(
          db.promise(),
          currentApplication,
          acceptedApplication,
        );

        if (status === "ditolak") {
          return res.json({
            message:
              "Kandidat sudah lolos pada lowongan lain. Lamaran ini otomatis digugurkan.",
            admin_notes: notes,
          });
        }

        return res.status(409).json({
          message:
            "Kandidat sudah lolos pada lowongan lain. Lamaran ini otomatis digugurkan.",
          admin_notes: notes,
        });
      }

      if (acceptedApplication && ACCEPTED_APPLICATION_STATUSES.includes(status)) {
        const notes = await rejectApplicationBecauseCandidateAccepted(
          db.promise(),
          currentApplication,
          acceptedApplication,
        );

        return res.status(409).json({
          message:
            "Kandidat sudah memiliki lowongan yang lolos. Lamaran ini tidak bisa diterima lagi dan otomatis digugurkan.",
          admin_notes: notes,
        });
      }

      // Get employee_id
      const [employee] = await db
        .promise()
        .query("SELECT id FROM employees WHERE user_id = ?", [req.user.id]);

      const reviewerId = employee.length > 0 ? employee[0].id : null;

      await db.promise().query(
        `UPDATE applications 
             SET status = ?, admin_notes = ?, reviewed_by = ?, reviewed_at = NOW()
             WHERE id = ?`,
        [status, admin_notes || null, reviewerId, id],
      );

      if (ACCEPTED_APPLICATION_STATUSES.includes(status)) {
        await rejectOtherActiveApplications(
          db.promise(),
          currentApplication.candidate_id,
          currentApplication.id,
          `Tidak lolos karena kandidat sudah lolos pada lowongan lain.`,
        );
      }

      res.json({ message: `Application status updated to ${status}` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ============================
// SCHEDULE INTERVIEW (HR)
// ============================
router.post(
  "/applications/:id/schedule-interview",
  verifyToken,
  verifyRole(["hr"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        interview_type,
        scheduled_date,
        duration_minutes,
        meeting_link,
        location,
      } = req.body;

      if (!scheduled_date) {
        return res.status(400).json({ message: "scheduled_date is required" });
      }

      const [application] = await db
        .promise()
        .query("SELECT * FROM applications WHERE id = ?", [id]);

      if (application.length === 0) {
        return res.status(404).json({ message: "Application not found" });
      }

      const currentApplication = application[0];
      const acceptedApplication = await findAcceptedApplication(
        db.promise(),
        currentApplication.candidate_id,
        currentApplication.id,
      );

      if (acceptedApplication) {
        const notes = await rejectApplicationBecauseCandidateAccepted(
          db.promise(),
          currentApplication,
          acceptedApplication,
        );

        return res.status(409).json({
          message:
            "Kandidat sudah lolos pada lowongan lain. Lamaran ini otomatis digugurkan dan tidak bisa dijadwalkan wawancara.",
          admin_notes: notes,
        });
      }

      // Get employee_id as interviewer
      const [employee] = await db
        .promise()
        .query("SELECT id FROM employees WHERE user_id = ?", [req.user.id]);

      const interviewerId = employee.length > 0 ? employee[0].id : null;

      // Pastikan status selalu diisi 'scheduled' jika tidak ada input status
      const status = 'scheduled';
      const [result] = await db.promise().query(
        `INSERT INTO interviews (
                application_id, candidate_id, interview_type, scheduled_date, duration_minutes,
                meeting_link, location, interviewer_id, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          id,
          currentApplication.candidate_id, // ambil candidate_id dari aplikasi
          interview_type || "video",
          scheduled_date,
          duration_minutes || 60,
          meeting_link,
          location,
          interviewerId,
          status,
        ],
      );

      // Update application status
      await db
        .promise()
        .query(
          "UPDATE applications SET status = 'interview_scheduled' WHERE id = ?",
          [id],
        );

      res.status(201).json({
        message: "Interview scheduled successfully",
        interview_id: result.insertId,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ============================
// PUBLISH INTERVIEW RESULTS FOR A JOB OPENING (HR)
// ============================
router.post(
  "/job-openings/:id/publish-interviews",
  verifyToken,
  verifyRole(["hr"]),
  async (req, res) => {
    const connection = await db.promise().getConnection();

    try {
      const jobOpeningId = parseInt(req.params.id, 10);
      if (isNaN(jobOpeningId)) {
        return res.status(400).json({ message: "Invalid job opening id" });
      }

      await connection.beginTransaction();

      const [jobs] = await connection.query(
        "SELECT id FROM job_openings WHERE id = ? FOR UPDATE",
        [jobOpeningId],
      );
      if (jobs.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: "Job opening not found" });
      }

      const [interviews] = await connection.query(
        `SELECT i.id, i.application_id, i.result, i.recommendation
         FROM interviews i
         JOIN applications a ON a.id = i.application_id
         WHERE a.job_opening_id = ? AND i.status = 'completed'`,
        [jobOpeningId],
      );

      if (interviews.length === 0) {
        await connection.rollback();
        return res.status(400).json({
          message: "Belum ada hasil interview yang dapat dipublish",
        });
      }

      for (const interview of interviews) {
        let applicationStatus =
          interview.result === "passed"
            ? "diterima"
            : ["failed", "no_show"].includes(interview.result)
              ? "ditolak"
              : null;

        if (!applicationStatus) continue;

        const [applicationRows] = await connection.query(
          "SELECT id, candidate_id FROM applications WHERE id = ? FOR UPDATE",
          [interview.application_id],
        );
        const application = applicationRows[0];
        if (!application) continue;

        if (applicationStatus === "diterima") {
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
        }

        await connection.query(
          `UPDATE applications
           SET status = ?, reviewed_at = NOW()
           WHERE id = ?`,
          [applicationStatus, interview.application_id],
        );

        if (applicationStatus === "diterima") {
          await rejectOtherActiveApplications(
            connection,
            application.candidate_id,
            application.id,
            `Tidak lolos karena kandidat sudah lolos pada lowongan ini.`,
          );
        }
      }

      await connection.query(
        `UPDATE job_openings
         SET status = 'closed', hiring_status = 'completed'
         WHERE id = ?`,
        [jobOpeningId],
      );

      await connection.commit();
      res.json({
        success: true,
        message: "Hasil interview berhasil dipublish",
      });
    } catch (error) {
      await connection.rollback();
      console.error(error);
      res.status(500).json({ message: "Server error" });
    } finally {
      connection.release();
    }
  },
);

// ============================
// UPDATE INTERVIEW RESULT (HR)
// ============================
router.put(
  "/interviews/:id/result",
  verifyToken,
  verifyRole(["hr"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { interviewer_notes, rating, average_rating, result, status, recommendation } = req.body;
      const normalizedRating = resolveAverageRating({
        average_rating,
        rating,
        interviewer_notes,
      });

      const [interview] = await db
        .promise()
        .query("SELECT * FROM interviews WHERE id = ?", [id]);

      if (interview.length === 0) {
        return res.status(404).json({ message: "Interview not found" });
      }

      // Pastikan status default 'completed' jika tidak ada input status
      await db.promise().query(
        `UPDATE interviews SET
                interviewer_notes = COALESCE(?, interviewer_notes),
          rating = COALESCE(?, rating),
                result = COALESCE(?, result),
                status = COALESCE(?, status, 'completed'),
                recommendation = COALESCE(?, recommendation)
             WHERE id = ?`,
        [interviewer_notes, normalizedRating, result, status, recommendation, id],
      );

      // Tidak perlu update status aplikasi saat hasil interview disimpan

      res.json({ message: "Interview result updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ============================
// GET LOLOS DOKUMEN + APLIKASI YANG PERNAH INTERVIEW CANCELED (HR)
// ============================
router.get(
  "/interviews/canceled-applications",
  verifyToken,
  verifyRole(["hr"]),
  async (req, res) => {
    try {
      const query = `
        SELECT DISTINCT 
          i.application_id,
          a.candidate_id,
          c.name AS candidate_name,
          c.email AS candidate_email,
          jo.id AS job_opening_id,
          jo.title AS job_title,
          i.status AS interview_status,
          i.updated_at AS canceled_at
        FROM interviews i
        JOIN applications a ON i.application_id = a.id
        JOIN candidates c ON a.candidate_id = c.id
        JOIN job_openings jo ON a.job_opening_id = jo.id
        WHERE i.status IN ('canceled')
        ORDER BY i.updated_at DESC
      `;

      const [rows] = await db.promise().query(query);

      res.json({
        success: true,
        total: rows.length,
        applications: rows,
      });
    } catch (error) {
      console.error("[ERROR canceled-applications]:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);
module.exports = router;

