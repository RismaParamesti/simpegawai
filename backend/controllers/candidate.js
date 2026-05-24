const express = require("express");
const router = express.Router();
const db = require("../config/db");
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

// ============================
// GET SINGLE APPLICATION DETAIL (HR)
// ============================
router.get(
  "/admin/applications/:id",
  verifyToken,
  verifyRole(["hr"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const hasCoverLetterFileColumn = await applicationsTableHasCoverLetterFile();
      const coverLetterSelect = hasCoverLetterFileColumn
        ? "a.cover_letter_file AS cover_letter_file"
        : "a.cover_letter AS cover_letter_file";

      const query = `
        SELECT a.*, 
            jo.title AS job_title, jo.description, jo.requirements, jo.responsibilities, jo.salary_range_min, jo.salary_range_max, jo.quota, jo.deadline, jo.location, jo.employment_type,
            p.name AS position_name, p.level,
            d.name AS department_name,
            i.scheduled_date, i.meeting_link, i.location AS interview_location,
            i.interview_type, i.rating, i.recommendation, i.interviewer_notes,
            i.result AS interview_result, i.status AS interview_status,
            c.name as candidate_name, c.email as candidate_email, c.phone, c.gender, c.birth_place, c.date_of_birth, c.marital_status, c.nationality, c.address, c.nik, c.npwp, c.education_level, c.university, c.major, c.graduation_year, c.linkedin, c.portfolio, c.expected_salary,
            ${coverLetterSelect}
        FROM applications a
        JOIN job_openings jo ON a.job_opening_id = jo.id
        JOIN positions p ON jo.position_id = p.id
        JOIN departments d ON p.department_id = d.id
        LEFT JOIN interviews i ON a.id = i.application_id
        JOIN candidates c ON a.candidate_id = c.id
        WHERE a.id = ?
      `;

      const [applications] = await db.promise().query(query, [id]);

      if (applications.length === 0) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Tambahkan field has_interview untuk aplikasi detail
      if (applications.length > 0) {
        const app = applications[0];
        const [interviews] = await db.promise().query(
          'SELECT COUNT(*) as cnt FROM interviews WHERE application_id = ?',
          [app.id]
        );
        app.has_interview = interviews[0].cnt > 0;
        res.json({ application: app });
      } else {
        res.status(404).json({ message: "Application not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Server error",
        error: error.message,
        code: error.code,
      });
    }
  },
);

// ============================
// GET INTERVIEW COMPLETED, DISQUALIFIED & APPLICATIONS CANCELED BY COMPANY (HR/Admin)
// ============================
router.get(
  "/admin/interviews/history-combined",
  verifyToken,
  verifyRole(["hr"]),
  async (req, res) => {
    try {
      // Ambil interview status completed, disqualified, cancelled, dan canceled_by_company
      const [interviews] = await db.promise().query(`
        SELECT i.*, 
               c.name AS candidate_name, c.email AS candidate_email,
               a.status AS application_status, a.job_opening_id,
               jo.title AS job_title, jo.location AS job_location,
               p.name AS position_name,
               e.full_name AS interviewer_name
        FROM interviews i
        LEFT JOIN candidates c ON i.candidate_id = c.id
        LEFT JOIN applications a ON i.application_id = a.id
        LEFT JOIN job_openings jo ON a.job_opening_id = jo.id
        LEFT JOIN positions p ON jo.position_id = p.id
        LEFT JOIN employees e ON i.interviewer_id = e.id
        WHERE i.status IN ('completed', 'disqualified', 'cancelled', 'canceled_by_company', '')
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
// UPDATE INTERVIEW (HR/Admin)
// ============================
router.put(
  "/admin/interviews/:id",
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
        interviewer_id
      } = req.body;

      // Cek interview
      const [interview] = await db
        .promise()
        .query("SELECT * FROM interviews WHERE id = ?", [id]);
      if (interview.length === 0) {
        return res.status(404).json({ message: "Interview not found" });
      }

      // Update interview
      await db.promise().query(
        `UPDATE interviews SET
          interview_type = COALESCE(?, interview_type),
          scheduled_date = COALESCE(?, scheduled_date),
          duration_minutes = COALESCE(?, duration_minutes),
          meeting_link = COALESCE(?, meeting_link),
          location = COALESCE(?, location),
          interviewer_id = COALESCE(?, interviewer_id),
          status = 'rescheduled',
          updated_at = NOW()
         WHERE id = ?`,
        [
          interview_type,
          scheduled_date,
          duration_minutes,
          meeting_link,
          location,
          interviewer_id,
          id,
        ]
      );

      res.json({ message: "Interview updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);
// ============================
// GET LOLOS DOKUMEN + APLIKASI YANG PERNAH INTERVIEW CANCELED (HR/Admin)
// ============================
router.get(
  "/admin/interviews/canceled-applications",
  verifyToken,
  verifyRole(["hr"]),
  async (req, res) => {
    try {
      const { status } = req.query;
      let query = `
        SELECT a.*, 
            jo.title AS job_title, jo.description, jo.requirements, jo.responsibilities, jo.salary_range_min, jo.salary_range_max, jo.quota, jo.deadline, jo.location, jo.employment_type,
            p.name AS position_name, p.level,
            d.name AS department_name,
            c.name as candidate_name, c.email as candidate_email
        FROM applications a
        JOIN job_openings jo ON a.job_opening_id = jo.id
        JOIN positions p ON jo.position_id = p.id
        JOIN departments d ON p.department_id = d.id
        JOIN candidates c ON a.candidate_id = c.id
        WHERE 1=1
      `;
      const params = [];
      if (status === "lolos_dokumen") {
        // Ambil juga aplikasi yang application_id-nya pernah punya interview status canceled/cancelled/canceled_by_company
        query += ` AND (a.status = ? OR a.id IN (SELECT DISTINCT application_id FROM interviews WHERE status IN ('canceled', 'cancelled')))`;
        params.push(status);
      } else if (status) {
        query += ` AND a.status = ?`;
        params.push(status);
      }
      query += ` ORDER BY a.updated_at DESC`;
      const [applications] = await db.promise().query(query, params);
      res.json({ applications });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);
// ============================
// CANCEL ALL APPLICATIONS BY JOB (HR/Admin)
// ============================
router.put(
  "/admin/applications/cancel-by-job",
  verifyToken,
  verifyRole(["hr"]),
  async (req, res) => {
    try {
      const { job_opening_id } = req.body;
      if (!job_opening_id) {
        return res.status(400).json({ message: "job_opening_id wajib diisi" });
      }

      // Update semua aplikasi pada job_opening_id ini
      const [result] = await db.promise().query(
        `UPDATE applications SET status = 'canceled_by_company', admin_notes = 'Lowongan dibatalkan oleh perusahaan', reviewed_at = NOW() WHERE job_opening_id = ? AND status NOT IN ('withdrawn', 'accepted', 'rejected')`,
        [job_opening_id]
      );

      // Update semua interview yang terkait lowongan ini menjadi canceled_by_company
      await db.promise().query(
        `UPDATE interviews i
         JOIN applications a ON i.application_id = a.id
         SET i.status = 'canceled_by_company'
         WHERE a.job_opening_id = ?`,
        [job_opening_id]
      );

      res.json({ message: `Semua aplikasi pada lowongan ini telah dibatalkan oleh perusahaan.`, affectedRows: result.affectedRows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ============================
// GET ALL INTERVIEWS (HR/Admin)
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

// Riwayat (completed/cancelled)
router.get(
  "/interviews/history",
  verifyToken,
  verifyRole(["hr"]),
  async (req, res) => {
    try {
      const [rows] = await db.promise().query(`
        SELECT i.*, 
               c.name AS candidate_name, c.email AS candidate_email,
               a.status AS application_status, a.job_opening_id,
               jo.title AS job_title, jo.location AS job_location,
               p.name AS position_name,
               e.full_name AS interviewer_name
        FROM interviews i
        LEFT JOIN candidates c ON i.candidate_id = c.id
        LEFT JOIN applications a ON i.application_id = a.id
        LEFT JOIN job_openings jo ON a.job_opening_id = jo.id
        LEFT JOIN positions p ON jo.position_id = p.id
        LEFT JOIN employees e ON i.interviewer_id = e.id
        WHERE 
          (i.status = 'completed')
          OR
          (i.status = 'cancelled' AND a.status = 'canceled_by_company')
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
// MULTER CONFIG (Candidate documents) - Organized by candidate & application
// ============================

// Helper function to generate safe folder name dari candidate name
const generateSafeFolderName = (name) => {
  if (!name) return "candidate_unknown";
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_") // Replace spaces with underscore
    .replace(/[^a-z0-9_]/g, "") // Remove special characters
    .substring(0, 50); // Truncate to 50 chars max
};

// Helper function to migrate candidate folder jika nama berubah
const migrateCandidateFolderIfNeeded = async (userId, newName) => {
  try {
    // Get current candidate folder name dari database
    const [currentData] = await db.promise().query(
      `SELECT a.cv_file FROM applications a
             JOIN candidates c ON a.candidate_id = c.id
             WHERE c.user_id = ?
             LIMIT 1`,
      [userId],
    );

    if (currentData.length === 0) {
      // Tidak ada aplikasi yang ada, jadi tidak perlu migrate
      return;
    }

    // Extract current folder name dari path
    const currentPath = currentData[0].cv_file;
    if (!currentPath) return;

    const pathParts = currentPath.split("/");
    const oldFolderName = pathParts[2]; // uploads/candidate_documents/{folderName}/...
    const newFolderName = generateSafeFolderName(newName);

    if (oldFolderName === newFolderName) {
      // Nama folder sudah sama, tidak perlu migrate
      return;
    }

    // Mulai migration
    const uploadsBaseDir = path.join(
      __dirname,
      "../uploads/candidate_documents",
    );
    const oldFolderPath = path.join(uploadsBaseDir, oldFolderName);
    const newFolderPath = path.join(uploadsBaseDir, newFolderName);

    // Check apakah folder lama ada
    if (!fs.existsSync(oldFolderPath)) {
      console.warn(`Old folder tidak ditemukan: ${oldFolderPath}`);
      return;
    }

    // Jika folder baru sudah ada, merge dengan hati-hati
    if (fs.existsSync(newFolderPath)) {
      // Copy files dari old ke new (overwrite files)
      const copyDir = (src, dest) => {
        const files = fs.readdirSync(src);
        files.forEach((file) => {
          const srcFile = path.join(src, file);
          const destFile = path.join(dest, file);
          if (fs.lstatSync(srcFile).isDirectory()) {
            if (!fs.existsSync(destFile)) {
              fs.mkdirSync(destFile, { recursive: true });
            }
            copyDir(srcFile, destFile);
          } else {
            fs.copyFileSync(srcFile, destFile);
          }
        });
      };
      copyDir(oldFolderPath, newFolderPath);
    } else {
      // Rename folder
      fs.renameSync(oldFolderPath, newFolderPath);
    }

    // Update semua paths di database untuk candidate ini
    const [allApplications] = await db.promise().query(
      `SELECT a.id, a.cv_file, a.portfolio_file, a.ijazah_file, 
                    a.transcript_file, a.certificate_file, a.ktp_file, 
                    a.photo_file, a.design_portfolio_file, a.marketing_campaign_file
             FROM applications a
             JOIN candidates c ON a.candidate_id = c.id
             WHERE c.user_id = ?`,
      [userId],
    );

    // Update paths untuk setiap aplikasi
    for (const app of allApplications) {
      const updates = {};
      const fieldsToUpdate = [
        "cv_file",
        "portfolio_file",
        "ijazah_file",
        "transcript_file",
        "certificate_file",
        "ktp_file",
        "photo_file",
        "design_portfolio_file",
        "marketing_campaign_file",
      ];

      fieldsToUpdate.forEach((field) => {
        if (app[field]) {
          // Replace old folder name dengan new folder name dalam path
          updates[field] = app[field].replace(
            `candidate_documents/${oldFolderName}/`,
            `candidate_documents/${newFolderName}/`,
          );
        }
      });

      // Update database
      if (Object.keys(updates).length > 0) {
        const setClause = Object.keys(updates)
          .map((key) => `${key} = ?`)
          .join(", ");
        const values = Object.values(updates);
        values.push(app.id);

        await db
          .promise()
          .query(`UPDATE applications SET ${setClause} WHERE id = ?`, values);
      }
    }

    // Update routes photo jika ada di users table
    const [userWithPhoto] = await db
      .promise()
      .query(`SELECT photo FROM users WHERE id = ?`, [userId]);

    if (userWithPhoto.length > 0 && userWithPhoto[0].photo) {
      const oldPhotoPath = userWithPhoto[0].photo;
      if (oldPhotoPath.includes(`/${oldFolderName}/`)) {
        const newPhotoPath = oldPhotoPath.replace(
          `candidate_documents/${oldFolderName}/`,
          `candidate_documents/${newFolderName}/`,
        );
        await db
          .promise()
          .query(`UPDATE users SET photo = ? WHERE id = ?`, [
            newPhotoPath,
            userId,
          ]);
      }
    }

    console.log(
      `Successfully migrated folder from ${oldFolderName} to ${newFolderName}`,
    );
  } catch (error) {
    console.error("Error during folder migration:", error);
    // Jangan throw error, just log - jangan interrupt profile update
  }
};

// Helper function to get application folder name
const getApplicationFolderName = (positionName, date) => {
  const safePosition = (positionName || "lamaran")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "")
    .substring(0, 30);

  const dateStr = date
    ? new Date(date).toLocaleDateString("id-ID").replace(/\//g, "")
    : new Date().toLocaleDateString("id-ID").replace(/\//g, "");
  return `Lamaran${safePosition.charAt(0).toUpperCase() + safePosition.slice(1)}_${dateStr}`;
};

// MULTER FOR PROFILE PHOTO (candidates/profile)
const profilePhotoStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      // Get candidate info
      const [candidate] = await db.promise().query(
        `SELECT c.id, u.name FROM candidates c 
                 JOIN users u ON c.user_id = u.id 
                 WHERE c.user_id = ?`,
        [req.user.id],
      );

      if (!candidate || candidate.length === 0) {
        return cb(new Error("Candidate not found"));
      }

      const candidateName = generateSafeFolderName(candidate[0].name);
      const targetDir = path.join(
        __dirname,
        "../uploads/candidate_documents",
        candidateName,
        "profile_photo",
      );

      fs.mkdirSync(targetDir, { recursive: true });
      req.candidatePath = `${candidateName}/profile_photo`;
      cb(null, targetDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `profile${ext}`);
  },
});

// MULTER FOR APPLICATION DOCUMENTS
const applicationDocsStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      // Get candidate info
      const [candidate] = await db.promise().query(
        `SELECT c.id, u.name FROM candidates c 
                 JOIN users u ON c.user_id = u.id 
                 WHERE c.user_id = ?`,
        [req.user.id],
      );

      if (!candidate || candidate.length === 0) {
        return cb(new Error("Candidate not found"));
      }

      // Get job opening info untuk position name
      const jobId = req.body.job_opening_id;
      const [job] = await db.promise().query(
        `SELECT jo.id, p.name as position_name FROM job_openings jo
                 LEFT JOIN positions p ON jo.position_id = p.id
                 WHERE jo.id = ?`,
        [jobId],
      );

      const candidateName = generateSafeFolderName(candidate[0].name);
      const positionName =
        job && job.length > 0 ? job[0].position_name : "lamaran";
      const appFolderName = getApplicationFolderName(positionName, new Date());

      const targetDir = path.join(
        __dirname,
        "../uploads/candidate_documents",
        candidateName,
        appFolderName,
      );

      fs.mkdirSync(targetDir, { recursive: true });
      req.candidatePath = `${candidateName}/${appFolderName}`;
      cb(null, targetDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const candidateFileFilter = (req, file, cb) => {
  // Izinkan berbagai format file
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
    "application/x-zip-compressed",
  ];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  return cb(new Error("File type not allowed"));
};

const uploadProfilePhoto = multer({
  storage: profilePhotoStorage,
  fileFilter: candidateFileFilter,
});

const uploadApplicationDocs = multer({
  storage: applicationDocsStorage,
  fileFilter: candidateFileFilter,
});

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

const APPLICATION_FILE_FIELD_ALIASES = {
  cv: "cv_file",
  resume: "cv_file",
  ktp: "ktp_file",
  photo: "photo_file",
  ijazah: "ijazah_file",
  transcript: "transcript_file",
  certificate: "certificate_file",
  experience_letter: "experience_letter_file",
  reference_letter: "reference_letter_file",
  skck: "skck_file",
  portfolio: "portfolio_file",
  cover_letter: "cover_letter_file",
  github: "github_link",
  design: "design_link",
  youtube: "youtube_link",
  marketing_portfolio: "marketing_portfolio_link",
  campaign: "campaign_link",
  design_portfolio_file: "design_link",
  marketing_campaign_file: "campaign_link",
};

const APPLICATION_FILE_FIELDS = new Set([
  "cv_file",
  "ktp_file",
  "photo_file",
  "ijazah_file",
  "transcript_file",
  "certificate_file",
  "experience_letter_file",
  "reference_letter_file",
  "skck_file",
  "portfolio_file",
  "other_document",
  "cover_letter_file",
  "github_link",
  "design_link",
  "youtube_link",
  "marketing_portfolio_link",
  "campaign_link",
]);

const normalizeApplicationFieldName = (fieldName) => {
  if (!fieldName) return fieldName;
  return APPLICATION_FILE_FIELD_ALIASES[fieldName] || fieldName;
};

// ============================
// GET CANDIDATE PROFILE (Own data)
// ============================
router.get(
  "/profile",
  verifyToken,
  verifyRole(["kandidat"]),
  async (req, res) => {
    try {
      const [candidates] = await db
        .promise()
        .query("SELECT * FROM candidates WHERE user_id = ?", [req.user.id]);

      if (candidates.length === 0) {
        return res.status(404).json({ message: "Candidate profile not found" });
      }

      // Format date_of_birth ke YYYY-MM-DD jika ada
      const candidate = { ...candidates[0] };
      if (candidate.date_of_birth) {
        const d = new Date(candidate.date_of_birth);
        // Handle jika sudah string YYYY-MM-DD
        if (typeof candidate.date_of_birth === 'string' && candidate.date_of_birth.length === 10 && candidate.date_of_birth[4] === '-') {
          candidate.date_of_birth = candidate.date_of_birth;
        } else if (!isNaN(d.getTime())) {
          // Format ke YYYY-MM-DD
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          candidate.date_of_birth = `${d.getFullYear()}-${month}-${day}`;
        }
      }
      res.json({ candidate });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);


// ============================
// CANCEL INTERVIEW (HR/Admin)
// ============================
router.put(
  "/admin/interviews/:id/cancel",
  verifyToken,
  verifyRole(["hr"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      // Cek interview
      const [interview] = await db
        .promise()
        .query("SELECT * FROM interviews WHERE id = ?", [id]);
      if (interview.length === 0) {
        return res.status(404).json({ message: "Interview not found" });
      }
      // Update status interview menjadi canceled
      await db.promise().query(
        `UPDATE interviews SET status = 'canceled', updated_at = NOW() WHERE id = ?`,
        [id]
      );

      // Update status aplikasi terkait menjadi 'lolos_dokumen'
      const appId = interview[0].application_id;
      if (appId) {
        await db.promise().query(
          `UPDATE applications SET status = 'lolos_dokumen', reviewed_at = NOW() WHERE id = ?`,
          [appId]
        );
      }
      res.json({ message: "Interview cancelled successfully, application status set to lolos_dokumen" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);


// ============================
// ============================
// UPDATE CANDIDATE PROFILE - Full profile dengan semua fields
// ============================
router.put(
  "/profile",
  verifyToken,
  verifyRole(["kandidat"]),
  async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        gender,
        birth_place,
        date_of_birth,
        marital_status,
        nationality,
        address,
        nik,
        npwp,
        education_level,
        university,
        major,
        graduation_year,
        linkedin,
        portfolio,
        expected_salary,
      } = req.body;

      // Get candidate by user_id
      const [candidate] = await db
        .promise()
        .query("SELECT id FROM candidates WHERE user_id = ?", [req.user.id]);

      if (candidate.length === 0) {
        return res.status(404).json({ message: "Candidate profile not found" });
      }

      const candidateId = candidate[0].id;

      // Update candidate profile
      await db.promise().query(
        `UPDATE candidates SET
                    name = COALESCE(?, name),
                    email = COALESCE(?, email),
                    phone = COALESCE(?, phone),
                    gender = COALESCE(?, gender),
                    birth_place = COALESCE(?, birth_place),
                    date_of_birth = COALESCE(?, date_of_birth),
                    marital_status = COALESCE(?, marital_status),
                    nationality = COALESCE(?, nationality),
                    address = COALESCE(?, address),
                    nik = COALESCE(?, nik),
                    npwp = COALESCE(?, npwp),
                    education_level = COALESCE(?, education_level),
                    university = COALESCE(?, university),
                    major = COALESCE(?, major),
                    graduation_year = COALESCE(?, graduation_year),
                    linkedin = COALESCE(?, linkedin),
                    portfolio = COALESCE(?, portfolio),
                    expected_salary = COALESCE(?, expected_salary),
                    updated_at = NOW()
                WHERE id = ?`,
        [
          name,
          email,
          phone,
          gender,
          birth_place,
          date_of_birth,
          marital_status,
          nationality,
          address,
          nik,
          npwp,
          education_level,
          university,
          major,
          graduation_year,
          linkedin,
          portfolio,
          expected_salary,
          candidateId,
        ],
      );

      // If name was updated, migrate candidate folder if needed
      if (name) {
        try {
          await migrateCandidateFolderIfNeeded(req.user.id, name);
        } catch (migrationError) {
          // Log migration error but don't fail the profile update
          console.error("Folder migration error:", migrationError);
        }
      }

      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error(error);

      const duplicateNik =
        error?.code === "ER_DUP_ENTRY" &&
        /\bnik\b/i.test(`${error?.sqlMessage || ""} ${error?.message || ""}`);

      if (duplicateNik) {
        return res.status(409).json({
          message: "nik sudah terpakai",
          errors: {
            nik: ["nik sudah terpakai"],
          },
          code: error.code,
        });
      }

      res.status(500).json({ message: "Server error" });
    }
  },
);

// ============================
// UPLOAD PROFILE PHOTO
// ============================
router.post(
  "/upload-photo",
  verifyToken,
  verifyRole(["kandidat"]),
  uploadProfilePhoto.single("photo"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Get candidate by user_id
      const [candidate] = await db
        .promise()
        .query("SELECT id, user_id FROM candidates WHERE user_id = ?", [
          req.user.id,
        ]);

      if (candidate.length === 0) {
        return res.status(404).json({ message: "Candidate profile not found" });
      }

      const candidateId = candidate[0].id;
      const photoPath = `uploads/candidate_documents/${req.candidatePath}/${req.file.filename}`;

      // Update user photo field
      await db
        .promise()
        .query("UPDATE users SET photo = ? WHERE id = ?", [
          photoPath,
          req.user.id,
        ]);

      res.json({
        message: "Profile photo uploaded successfully",
        photo: photoPath,
        filename: req.file.filename,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ============================
// APPLY TO JOB (Candidate) - With file uploads
// ============================
router.post(
  "/apply",
  verifyToken,
  verifyRole(["kandidat"]),
  uploadApplicationDocs.any(),
  async (req, res) => {
    try {
      const { job_opening_id } = req.body;

      if (!job_opening_id) {
        return res.status(400).json({ message: "job_opening_id is required" });
      }

      // Get candidate by user_id
      const [candidate] = await db
        .promise()
        .query("SELECT id FROM candidates WHERE user_id = ?", [req.user.id]);

      if (candidate.length === 0) {
        return res.status(404).json({ message: "Candidate profile not found" });
      }

      const candidateId = candidate[0].id;

      // Check if job opening exists and is open + get position details
      const [job] = await db.promise().query(
        `SELECT jo.*, p.name as position_name FROM job_openings jo
                 LEFT JOIN positions p ON jo.position_id = p.id
                 WHERE jo.id = ? AND jo.status = 'open'`,
        [job_opening_id],
      );

      if (job.length === 0) {
        return res
          .status(404)
          .json({ message: "Job opening not found or closed" });
      }

      const jobData = job[0];

      // Check deadline
      if (jobData.deadline && new Date(jobData.deadline) < new Date()) {
        return res
          .status(400)
          .json({ message: "Application deadline has passed" });
      }

      // Check if already applied
      const [existing] = await db
        .promise()
        .query(
          "SELECT id FROM applications WHERE job_opening_id = ? AND candidate_id = ?",
          [job_opening_id, candidateId],
        );

      if (existing.length > 0) {
        return res
          .status(409)
          .json({ message: "You have already applied to this job" });
      }

      const hasCoverLetterFileColumn = await applicationsTableHasCoverLetterFile();
      const coverLetterColumnName = hasCoverLetterFileColumn
        ? "cover_letter_file"
        : "cover_letter";

      // Get required documents untuk posisi ini
      const documentRequirements = getRequiredDocuments(jobData.position_name);

      // Helper function to build file path
      const buildFilePath = (fieldName) => {
        const normalizedField = normalizeApplicationFieldName(fieldName);
        if (!req.files || req.files.length === 0) {
          return null;
        }
        const matchedFile = req.files.find(
          (file) => normalizeApplicationFieldName(file.fieldname) === normalizedField,
        );
        if (matchedFile) {
          return `uploads/candidate_documents/${req.candidatePath}/${matchedFile.filename}`;
        }
        return null;
      };

      // Validate uploaded documents
      const uploadedFiles = {};
      const filePaths = {};

      // Build paths untuk semua file fields (dokumen yang di-upload)
      const fileFields = [
        "cv_file",
        "ktp_file",
        "photo_file",
        "ijazah_file",
        "transcript_file",
        "certificate_file",
        "experience_letter_file",
        "reference_letter_file",
        "skck_file",
        "portfolio_file",
        "other_document",
        "cover_letter_file",
      ];

      fileFields.forEach((field) => {
        const filePath = buildFilePath(field);
        if (filePath) {
          uploadedFiles[field] = filePath;
          filePaths[field] = filePath;
        }
      });

      const unexpectedFields = (req.files || [])
        .map((file) => file.fieldname)
        .filter((fieldName) => !APPLICATION_FILE_FIELDS.has(normalizeApplicationFieldName(fieldName)));

      if (unexpectedFields.length > 0) {
        // Bersihkan file yang sempat tersimpan supaya request tidak gagal diam-diam.
        for (const file of req.files || []) {
          try {
            if (file.path && fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          } catch (cleanupError) {
            console.warn("Failed to cleanup unexpected upload:", cleanupError.message);
          }
        }

        return res.status(400).json({
          message: "Unexpected upload field",
          unexpectedFields,
        });
      }

      // Handle URL fields
      const urlFields = [
        "github_link",
        "design_link",
        "youtube_link",
        "marketing_portfolio_link",
        "campaign_link",
      ];
      urlFields.forEach((field) => {
        if (req.body[field]) {
          uploadedFiles[field] = req.body[field];
          filePaths[field] = req.body[field];
        }
      });

      // Validation
      const validation = validateDocuments(
        jobData.position_name,
        uploadedFiles,
      );

      if (!validation.isValid) {
        // Return error dengan informasi dokumen yang diperlukan
        return res.status(400).json({
          message: "Missing required documents",
          missingDocuments: validation.missingDocuments.map((docType) => ({
            fieldName: docType,
            label: DOCUMENT_FIELD_METADATA[docType]?.label || docType,
            description: DOCUMENT_FIELD_METADATA[docType]?.description || "",
          })),
          requiredCount: validation.requiredCount,
          uploadedCount: validation.uploadedCount,
        });
      }

      const applicationColumns = [
        "job_opening_id",
        "candidate_id",
        coverLetterColumnName,
        "cv_file",
        "ktp_file",
        "photo_file",
        "ijazah_file",
        "transcript_file",
        "certificate_file",
        "experience_letter_file",
        "reference_letter_file",
        "skck_file",
        "portfolio_file",
        "other_document",
        "github_link",
        "design_link",
        "youtube_link",
        "marketing_portfolio_link",
        "campaign_link",
      ];
      const applicationValues = [
        job_opening_id,
        candidateId,
        filePaths.cover_letter_file || null,
        filePaths.cv_file || null,
        filePaths.ktp_file || null,
        filePaths.photo_file || null,
        filePaths.ijazah_file || null,
        filePaths.transcript_file || null,
        filePaths.certificate_file || null,
        filePaths.experience_letter_file || null,
        filePaths.reference_letter_file || null,
        filePaths.skck_file || null,
        filePaths.portfolio_file || null,
        filePaths.other_document || null,
        filePaths.github_link || null,
        filePaths.design_link || null,
        filePaths.youtube_link || null,
        filePaths.marketing_portfolio_link || null,
        filePaths.campaign_link || null,
      ];

      const [result] = await db.promise().query(
        `INSERT INTO applications (${applicationColumns.join(", ")}, status, submitted_at)
         VALUES (${applicationColumns.map(() => "?").join(", ")}, 'submitted', NOW())`,
        applicationValues,
      );

      // Update application count
      await db
        .promise()
        .query(
          "UPDATE candidates SET application_count = application_count + 1 WHERE id = ?",
          [candidateId],
        );

      res.status(201).json({
        message: "Application submitted successfully",
        application_id: result.insertId,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ============================
// GET MY APPLICATIONS (Candidate)
// ============================
router.get(
  "/applications",
  verifyToken,
  verifyRole(["kandidat"]),
  async (req, res) => {
    try {
      // Get candidate by user_id
      const [candidate] = await db
        .promise()
        .query("SELECT id FROM candidates WHERE user_id = ?", [req.user.id]);

      if (candidate.length === 0) {
        return res.status(404).json({ message: "Candidate profile not found" });
      }

      const candidateId = candidate[0].id;

      const hasCoverLetterFileColumn = await applicationsTableHasCoverLetterFile();
      const coverLetterSelect = hasCoverLetterFileColumn
        ? "a.cover_letter_file AS cover_letter_file"
        : "a.cover_letter AS cover_letter_file";

      const query = `
             SELECT a.*, jo.title AS job_title, jo.location, jo.employment_type,
               p.name AS position_name, p.level,
               d.name AS department_name,
               i.id AS interview_id,
               i.interview_type,
               i.scheduled_date,
               i.meeting_link,
               i.location AS interview_location,
               i.duration_minutes,
               CASE WHEN jo.hiring_status = 'completed' THEN i.result ELSE 'pending' END AS interview_result,
               i.status AS interview_status,
             c.name, c.email, c.phone, c.gender, c.birth_place, c.date_of_birth, c.marital_status, c.nationality, c.address, c.nik, c.npwp, c.education_level, c.university, c.major, c.graduation_year, c.linkedin, c.portfolio, c.expected_salary,
             ${coverLetterSelect}
             FROM applications a
             JOIN job_openings jo ON a.job_opening_id = jo.id
             JOIN positions p ON jo.position_id = p.id
             JOIN departments d ON p.department_id = d.id
             LEFT JOIN interviews i ON a.id = i.application_id
             JOIN candidates c ON a.candidate_id = c.id
             WHERE a.candidate_id = ?
             ORDER BY a.submitted_at DESC
         `;

      const [applications] = await db.promise().query(query, [candidateId]);

      // Helper function to map database status to frontend status
      // Before the job reaches the interview phase, keep shortlist/reject outcomes hidden.
      const mapStatusToFrontend = (dbStatus, hiringStatus, hasRealInterview) => {
        const isPublished = hiringStatus === 'interview' || hiringStatus === 'completed';
        if (!isPublished && ['shortlisted', 'interview_scheduled', 'interviewed', 'accepted', 'rejected', 'canceled_by_company'].includes(dbStatus)) {
          return 'screening';
        }

        const statusMap = {
          'submitted': 'submitted',
          'reviewing': 'screening',
          'shortlisted': 'lolos_dokumen',
          'interview_scheduled': 'wawancara',
          'interviewed': hasRealInterview ? 'wawancara' : 'lolos_dokumen', // Fallback ke lolos_dokumen jika tidak ada interview data
          'accepted': 'diterima',
          'rejected': 'ditolak',
          'withdrawn': 'withdrawn',
          'canceled_by_company': 'ditolak',
        };
        return statusMap[dbStatus] || dbStatus;
      };

      // Helper function to determine last_stage for timeline (accept raw dbStatus)
      const determineLastStage = (dbStatus, hiringStatus, hasRealInterview) => {
        const isPublished = hiringStatus === 'interview' || hiringStatus === 'completed';
        if (!isPublished && ['shortlisted', 'interview_scheduled', 'interviewed', 'accepted', 'rejected', 'canceled_by_company'].includes(dbStatus)) {
          return 'screening';
        }

        if (dbStatus === 'rejected') {
          return hasRealInterview ? 'wawancara' : 'screening';
        }

        if (dbStatus === 'interviewed') {
          return hasRealInterview ? 'wawancara' : 'lolos_dokumen';
        }

        if (dbStatus === 'interview_scheduled') {
          return 'wawancara';
        }

        if (dbStatus === 'shortlisted') {
          return 'lolos_dokumen';
        }

        if (dbStatus === 'reviewing') {
          return 'screening';
        }

        return mapStatusToFrontend(dbStatus, hasRealInterview);
      };

      // Attach interview rows and compute fields for each application
      for (const app of applications) {
        const jobIdForApp = app.job_opening_id;
        // Fetch hiring_status for the job and interviews normally, then mask fields in JS if job not completed
        const [jobRows] = await db.promise().query(
          `SELECT hiring_status FROM job_openings WHERE id = ?`,
          [jobIdForApp],
        );
        const hiringStatus = jobRows && jobRows[0] ? jobRows[0].hiring_status : null;
        const isPublished = hiringStatus === 'interview' || hiringStatus === 'completed';
        const [interviewRows] = await db.promise().query(
          'SELECT * FROM interviews WHERE application_id = ? ORDER BY scheduled_date DESC, id DESC',
          [app.id],
        );
        // If the job isn't completed, hide result/rating/interviewer_notes from candidate view
        if (hiringStatus !== 'completed') {
          interviewRows.forEach((ir) => {
            ir.result = ir.result || 'pending';
            ir.rating = null;
            ir.interviewer_notes = null;
          });
        }
        app.interviews = interviewRows;
        const hasRealInterview = interviewRows.length > 0;
        app.has_interview = hasRealInterview;
        app.hiring_status = hiringStatus;
        app.is_published = isPublished;

        // keep raw DB status for debugging
        app.db_status = app.status;

        // Map status ke format frontend (dengan mempertimbangkan real interview data)
        app.status = mapStatusToFrontend(app.status, hiringStatus, hasRealInterview);

        // Tentukan last_stage untuk timeline berdasarkan raw db_status
        app.last_stage = determineLastStage(app.db_status, hiringStatus, hasRealInterview);
      }
      res.json({ applications, total: applications.length });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ============================
// GET SINGLE APPLICATION STATUS (Candidate)
// ============================
router.get(
  "/applications/:id",
  verifyToken,
  verifyRole(["kandidat"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Get candidate by user_id
      const [candidate] = await db
        .promise()
        .query("SELECT id FROM candidates WHERE user_id = ?", [req.user.id]);

      if (candidate.length === 0) {
        return res.status(404).json({ message: "Candidate profile not found" });
      }

      const candidateId = candidate[0].id;

      const hasCoverLetterFileColumn = await applicationsTableHasCoverLetterFile();
      const coverLetterSelect = hasCoverLetterFileColumn
        ? "a.cover_letter_file AS cover_letter_file"
        : "a.cover_letter AS cover_letter_file";

      const query = `
                 SELECT a.*, 
                     jo.title AS job_title, jo.description, jo.requirements, jo.responsibilities, jo.salary_range_min, jo.salary_range_max, jo.quota, jo.deadline, jo.location, jo.employment_type,
                     p.name AS position_name, p.level,
                     d.name AS department_name,
                     i.scheduled_date, i.meeting_link, i.location AS interview_location,
                     i.interview_type, i.result AS interview_result, i.status AS interview_status,
                     c.name, c.email, c.phone, c.gender, c.birth_place, c.date_of_birth, c.marital_status, c.nationality, c.address, c.nik, c.npwp, c.education_level, c.university, c.major, c.graduation_year, c.linkedin, c.portfolio, c.expected_salary,
                     ${coverLetterSelect}
            FROM applications a
            JOIN job_openings jo ON a.job_opening_id = jo.id
            JOIN positions p ON jo.position_id = p.id
            JOIN departments d ON p.department_id = d.id
            LEFT JOIN interviews i ON a.id = i.application_id
            JOIN candidates c ON a.candidate_id = c.id
            WHERE a.id = ? AND a.candidate_id = ?
        `;

      const [applications] = await db.promise().query(query, [id, candidateId]);

      if (applications.length === 0) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Helper function to map database status to frontend status
      const mapStatusToFrontend = (dbStatus, hiringStatus, hasRealInterview) => {
        const isPublished = hiringStatus === 'interview' || hiringStatus === 'completed';
        if (!isPublished && ['shortlisted', 'interview_scheduled', 'interviewed', 'accepted', 'rejected', 'canceled_by_company'].includes(dbStatus)) {
          return 'screening';
        }

        const statusMap = {
          'submitted': 'submitted',
          'reviewing': 'screening',
          'shortlisted': 'lolos_dokumen',
          'interview_scheduled': 'wawancara',
          'interviewed': hasRealInterview ? 'wawancara' : 'lolos_dokumen', // Fallback ke lolos_dokumen jika tidak ada interview data
          'accepted': 'diterima',
          'rejected': 'ditolak',
          'withdrawn': 'withdrawn',
          'canceled_by_company': 'ditolak',
        };
        return statusMap[dbStatus] || dbStatus;
      };

      // Helper function to determine last_stage for timeline (accept raw dbStatus)
      const determineLastStage = (dbStatus, hiringStatus, hasRealInterview) => {
        const isPublished = hiringStatus === 'interview' || hiringStatus === 'completed';
        if (!isPublished && ['shortlisted', 'interview_scheduled', 'interviewed', 'accepted', 'rejected', 'canceled_by_company'].includes(dbStatus)) {
          return 'screening';
        }

        if (dbStatus === 'rejected') {
          return hasRealInterview ? 'wawancara' : 'screening';
        }

        if (dbStatus === 'interviewed') {
          return hasRealInterview ? 'wawancara' : 'lolos_dokumen';
        }

        if (dbStatus === 'interview_scheduled') {
          return 'wawancara';
        }

        if (dbStatus === 'shortlisted') {
          return 'lolos_dokumen';
        }

        if (dbStatus === 'reviewing') {
          return 'screening';
        }

        return mapStatusToFrontend(dbStatus, hasRealInterview);
      };

      // Tambahkan interview rows, has_interview, status frontend, dan last_stage untuk aplikasi detail
      if (applications.length > 0) {
        const app = applications[0];
        const [interviewRows] = await db.promise().query(
          'SELECT * FROM interviews WHERE application_id = ? ORDER BY scheduled_date DESC, id DESC',
          [app.id]
        );
        app.interviews = interviewRows;
        const hasRealInterview = interviewRows.length > 0;
        app.has_interview = hasRealInterview;
        const [jobRows] = await db.promise().query(
          'SELECT hiring_status FROM job_openings WHERE id = ?',
          [app.job_opening_id],
        );
        const hiringStatus = jobRows && jobRows[0] ? jobRows[0].hiring_status : null;
        const isPublished = hiringStatus === 'interview' || hiringStatus === 'completed';
        app.hiring_status = hiringStatus;
        app.is_published = isPublished;

        // Keep raw DB status
        app.db_status = app.status;

        // Map status ke format frontend (dengan mempertimbangkan real interview data)
        app.status = mapStatusToFrontend(app.status, hiringStatus, hasRealInterview);

        // Tentukan last_stage untuk timeline berdasarkan raw db_status
        app.last_stage = determineLastStage(app.db_status, hiringStatus, hasRealInterview);

        res.json({ application: app });
      } else {
        res.status(404).json({ message: "Application not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ============================
// WITHDRAW APPLICATION (Candidate)
// ============================
router.put(
  "/applications/:id/withdraw",
  verifyToken,
  verifyRole(["kandidat"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Get candidate by user_id
      const [candidate] = await db
        .promise()
        .query("SELECT id FROM candidates WHERE user_id = ?", [req.user.id]);

      if (candidate.length === 0) {
        return res.status(404).json({ message: "Candidate profile not found" });
      }

      const candidateId = candidate[0].id;

      const [application] = await db
        .promise()
        .query("SELECT * FROM applications WHERE id = ? AND candidate_id = ?", [
          id,
          candidateId,
        ]);

      if (application.length === 0) {
        return res.status(404).json({ message: "Application not found" });
      }

      if (
        ["accepted", "rejected", "withdrawn"].includes(application[0].status)
      ) {
        return res
          .status(400)
          .json({ message: "Cannot withdraw this application" });
      }

      const { withdraw_reason } = req.body;
      await db
        .promise()
        .query(
          "UPDATE applications SET status = 'withdrawn', withdrawn_at = NOW(), withdraw_reason = ? WHERE id = ?",
          [withdraw_reason || null, id]
        );

      res.json({ message: "Application withdrawn successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ========================================
// HR/ADMIN ENDPOINTS
// ========================================

// ============================
// GET ALL APPLICATIONS (HR/Admin)
// ============================
router.get(
  "/admin/applications",
  verifyToken,
  verifyRole(["hr"]),
  async (req, res) => {
    try {
      const { status, job_opening_id } = req.query;

      const hasCoverLetterFileColumn = await applicationsTableHasCoverLetterFile();
      const coverLetterSelect = hasCoverLetterFileColumn
        ? "a.cover_letter_file AS cover_letter_file"
        : "a.cover_letter AS cover_letter_file";

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
  a.marketing_portfolio_link,
  a.campaign_link,

  jo.title AS job_title,
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
// UPDATE APPLICATION STATUS (HR/Admin)
// ============================
router.put(
  "/admin/applications/:id/status",
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

      res.json({ message: `Application status updated to ${status}` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ============================
// SCHEDULE INTERVIEW (HR/Admin)
// ============================
router.post(
  "/admin/applications/:id/schedule-interview",
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
          application[0].candidate_id, // ambil candidate_id dari aplikasi
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
// UPDATE INTERVIEW RESULT (HR/Admin)
// ============================
router.put(
  "/admin/interviews/:id/result",
  verifyToken,
  verifyRole(["hr"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { interviewer_notes, status } = req.body;

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
                status = COALESCE(?, status)
             WHERE id = ?`,
        [interviewer_notes, status, id],
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
// GET ALL CANDIDATES (HR/Admin)
// ============================
router.get(
  "/admin/candidates",
  verifyToken,
  verifyRole(["hr"]),
  async (req, res) => {
    try {
      const { status } = req.query;

      let query = "SELECT * FROM candidates";
      const params = [];

      if (status) {
        query += " WHERE status = ?";
        params.push(status);
      }

      query += " ORDER BY created_at DESC";

      const [candidates] = await db.promise().query(query, params);

      res.json({ candidates, total: candidates.length });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ============================
// GET SINGLE CANDIDATE (HR/Admin)
// ============================
router.get(
  "/admin/candidates/:id",
  verifyToken,
  verifyRole(["hr"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const [candidates] = await db
        .promise()
        .query("SELECT * FROM candidates WHERE id = ?", [id]);

      if (candidates.length === 0) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      // Get applications for this candidate
      const [applications] = await db.promise().query(
        `SELECT a.*, jo.title AS job_title, p.name AS position_name
             FROM applications a
             JOIN job_openings jo ON a.job_opening_id = jo.id
             JOIN positions p ON jo.position_id = p.id
             WHERE a.candidate_id = ?
             ORDER BY a.submitted_at DESC`,
        [id],
      );

      res.json({ candidate: candidates[0], applications });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ============================
// CONVERT CANDIDATE TO EMPLOYEE (HR/Admin)
// ============================
router.post(
  "/admin/candidates/:id/convert",
  verifyToken,
  verifyRole(["hr"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        username,
        password,
        position_id,
        join_date,
        basic_salary,
        employment_status,
        working_hours_id,
      } = req.body;

      if (!username || !password || !position_id || !join_date) {
        return res.status(400).json({
          message:
            "username, password, position_id, and join_date are required",
        });
      }

      // Get candidate data
      const [candidates] = await db
        .promise()
        .query("SELECT * FROM candidates WHERE id = ?", [id]);

      if (candidates.length === 0) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      const candidate = candidates[0];

      // Check accepted applications
      const [acceptedApp] = await db
        .promise()
        .query(
          "SELECT id FROM applications WHERE candidate_id = ? AND status = 'accepted'",
          [id],
        );

      if (acceptedApp.length === 0) {
        return res.status(400).json({
          message: "Candidate must have at least one accepted application",
        });
      }

      // Check if username or email already exists
      const [existingUser] = await db
        .promise()
        .query("SELECT id FROM users WHERE username = ? OR email = ?", [
          username,
          candidate.email,
        ]);

      if (existingUser.length > 0) {
        return res.status(409).json({
          message: "Username or email already exists",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate employee code
      const [lastEmployee] = await db
        .promise()
        .query("SELECT employee_code FROM employees ORDER BY id DESC LIMIT 1");

      let newEmployeeCode = "EMP001";
      if (lastEmployee.length > 0 && lastEmployee[0].employee_code) {
        const lastCode = lastEmployee[0].employee_code;
        const numPart = parseInt(lastCode.replace("EMP", "")) + 1;
        newEmployeeCode = `EMP${String(numPart).padStart(3, "0")}`;
      }

      // Create user
      const [userResult] = await db.promise().query(
        `INSERT INTO users (name, email, username, password, phone, status, created_at)
             VALUES (?, ?, ?, ?, ?, 'active', NOW())`,
        [
          candidate.name,
          candidate.email,
          username,
          hashedPassword,
          candidate.phone,
        ],
      );

      const userId = userResult.insertId;

      // Assign pegawai role
      const [roleData] = await db
        .promise()
        .query("SELECT id FROM roles WHERE name = 'pegawai'");

      if (roleData.length > 0) {
        await db
          .promise()
          .query("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)", [
            userId,
            roleData[0].id,
          ]);
      }

      // Create employee from candidate data
      const [employeeResult] = await db.promise().query(
        `INSERT INTO employees (
                user_id, employee_code, full_name, gender, birth_place, date_of_birth,
                marital_status, nationality, address, phone, email, nik, npwp,
                bank_account, account_holder_name, bank_name, bpjs_number,
                ktp_document, diploma_document, position_id, join_date,
                basic_salary, employment_status, working_hours_id, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          userId,
          newEmployeeCode,
          candidate.name,
          candidate.gender,
          candidate.birth_place,
          candidate.date_of_birth,
          candidate.marital_status,
          candidate.nationality,
          candidate.address,
          candidate.phone,
          candidate.email,
          candidate.nik,
          candidate.npwp,
          candidate.bank_account,
          candidate.account_holder_name,
          candidate.bank_name,
          candidate.bpjs_number,
          candidate.ktp_document,
          candidate.diploma_document,
          position_id,
          join_date,
          basic_salary || candidate.expected_salary,
          employment_status || "permanent",
          working_hours_id || 1,
        ],
      );

      // Mark candidate as converted
      await db
        .promise()
        .query("UPDATE candidates SET status = 'inactive' WHERE id = ?", [id]);

      res.status(201).json({
        message: "Candidate converted to employee successfully",
        user_id: userId,
        employee_id: employeeResult.insertId,
        employee_code: newEmployeeCode,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

module.exports = router;

