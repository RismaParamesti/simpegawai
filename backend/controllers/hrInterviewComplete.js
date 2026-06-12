// Express router for HR interview completion endpoints
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const {
  findAcceptedApplication,
  rejectApplicationBecauseCandidateAccepted,
  rejectOtherActiveApplications,
} = require('../utils/recruitmentApplicationGuard');

// Accept all applications by job_opening_id
router.put('/admin/applications/accept-by-job', async (req, res) => {
  const { job_opening_id } = req.body;
  if (!job_opening_id) return res.status(400).json({ message: 'job_opening_id wajib diisi' });
  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();

    const [applications] = await connection.query(
      `SELECT id, candidate_id
       FROM applications
       WHERE job_opening_id = ?
         AND status NOT IN ('diterima', 'accepted', 'ditolak', 'rejected', 'withdrawn', 'canceled_by_company')
       FOR UPDATE`,
      [job_opening_id]
    );

    for (const application of applications) {
      const acceptedApplication = await findAcceptedApplication(
        connection,
        application.candidate_id,
        application.id
      );

      if (acceptedApplication) {
        await rejectApplicationBecauseCandidateAccepted(
          connection,
          application,
          acceptedApplication
        );
        continue;
      }

      await connection.query(
        `UPDATE applications SET status = 'diterima', reviewed_at = NOW() WHERE id = ?`,
        [application.id]
      );
      await rejectOtherActiveApplications(
        connection,
        application.candidate_id,
        application.id,
        'Tidak lolos karena kandidat sudah lolos pada lowongan ini.'
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
router.put('/job-openings/:jobId/complete', async (req, res) => {
  const { jobId } = req.params;
  try {
    await db.promise().query(
      `UPDATE job_openings SET status = 'closed', hiring_status = 'completed' WHERE id = ?`,
      [jobId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Move job opening from shortlisting to interview
router.put('/job-openings/:jobId/advance-to-interview', async (req, res) => {
  const { jobId } = req.params;
  try {
    await db.promise().query(
      `UPDATE job_openings SET hiring_status = 'interview' WHERE id = ?`,
      [jobId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update interviews: completed & pending result -> passed
router.put('/admin/interviews/update-result-by-job', async (req, res) => {
  const { job_opening_id } = req.body;
  if (!job_opening_id) return res.status(400).json({ message: 'job_opening_id wajib diisi' });
  try {
    await db.promise().query(
      `UPDATE interviews SET result = 'passed' WHERE job_opening_id = ? AND status = 'completed' AND (result IS NULL OR result = 'pending')`,
      [job_opening_id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
