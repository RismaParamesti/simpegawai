const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  logActivity,
  getIpAddress,
  getUserAgent,
} = require("../middleware/activityLogger");

const syncAtasanRoleByPosition = async (userId, positionId) => {
  if (!userId || !positionId) return;

  const [positionRows] = await db
    .promise()
    .query("SELECT level FROM positions WHERE id = ?", [positionId]);

  if (positionRows.length === 0) return;

  const isManagerLevel =
    String(positionRows[0].level || "").toLowerCase().trim() === "manager";

  const [roles] = await db.promise().query(
    `SELECT r.name
     FROM user_roles ur
     JOIN roles r ON r.id = ur.role_id
     WHERE ur.user_id = ?`,
    [userId],
  );

  const roleSet = new Set(roles.map((role) => role.name));
  roleSet.add("pegawai");

  if (isManagerLevel) {
    roleSet.add("atasan");
  } else {
    roleSet.delete("atasan");
  }

  await db.promise().query("DELETE FROM user_roles WHERE user_id = ?", [userId]);

  for (const roleName of roleSet) {
    const [roleRows] = await db
      .promise()
      .query("SELECT id FROM roles WHERE name = ?", [roleName]);

    if (roleRows.length > 0) {
      await db
        .promise()
        .query("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)", [
          userId,
          roleRows[0].id,
        ]);
    }
  }
};

// ============================
// MULTER CONFIG (Employee documents)
// ============================
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir = path.join(__dirname, "../uploads/employee_documents");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const documentFileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "application/pdf"];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  return cb(new Error("Only PDF/JPG/PNG are allowed for documents"));
};

const uploadDocuments = multer({
  storage: documentStorage,
  fileFilter: documentFileFilter,
});

// ============================
// GET all employees (admin/HR only)
// ============================
router.get("/", verifyToken, verifyRole(["admin", "hr"]), async (req, res) => {
  try {
    const [employees] = await db.promise().query(`
            SELECT 
                e.*,
                u.name, u.email, u.phone, u.photo, u.status,
                p.name as position_name, p.level,
                d.name as department_name,
                wh.shift_name, wh.check_in_time, wh.check_out_time
            FROM employees e
            LEFT JOIN users u ON e.user_id = u.id
            LEFT JOIN positions p ON e.position_id = p.id
            LEFT JOIN departments d ON p.department_id = d.id
            LEFT JOIN working_hours wh ON e.working_hours_id = wh.id
            WHERE e.deleted_at IS NULL
            ORDER BY e.created_at DESC
        `);

    res.json({ employees });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================
// GET DEPARTMENTS (public within authenticated scope)
// ============================
router.get(
  "/departments",
  verifyToken,
  async (req, res) => {
    try {
      console.log("[GET /departments] Starting request", { userId: req.user?.id, timestamp: new Date().toISOString() });
      const [departments] = await db.promise().query(`
                SELECT
                    d.id, d.code, d.name, d.description, d.status,
                    d.created_at, d.updated_at,
                    COUNT(DISTINCT e.id) as totalEmployees,
                    COUNT(DISTINCT p.id) as totalPositions
                FROM departments d
                LEFT JOIN positions p ON d.id = p.department_id
                    AND LOWER(COALESCE(p.level, '')) != 'commissioner'
                    AND LOWER(COALESCE(p.name, '')) NOT LIKE '%commissioner%'
                LEFT JOIN employees e ON p.id = e.position_id AND e.deleted_at IS NULL
                GROUP BY d.id, d.code, d.name, d.description, d.status, d.created_at, d.updated_at
                ORDER BY d.name ASC
            `);

      console.log(`[GET /departments] Success - returned ${departments.length} departments`);
      console.log("[GET /departments] First department object:", JSON.stringify(departments[0]));
      res.json({ data: departments });
    } catch (error) {
      console.error("[GET /departments] Error fetching departments:", error);
      res.status(500).json({ message: "Failed to fetch departments", error: error.message });
    }
  },
);

// ============================
// GET POSITIONS (for dropdowns)
// ============================
router.get(
  "/positions",
  verifyToken,
  async (req, res) => {
    try {
      const [positions] = await db.promise().query(`
                SELECT p.id, p.name, p.level, p.base_salary, p.position_allowance, p.status, p.department_id, d.name as department_name
                FROM positions p
                LEFT JOIN departments d ON p.department_id = d.id
                WHERE p.status = 'active'
                AND LOWER(COALESCE(p.level, '')) != 'commissioner'
                AND LOWER(COALESCE(p.name, '')) NOT LIKE '%commissioner%'
                ORDER BY p.name ASC
            `);

      res.json({ data: positions });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ============================
// GET single employee detail (admin/HR only)
// ============================
router.get(
  "/:id",
  verifyToken,
  verifyRole(["admin", "hr"]),
  async (req, res) => {
    const { id } = req.params;

    try {
      const [employees] = await db.promise().query(
        `
            SELECT 
                e.*,
                u.name, u.email, u.username, u.phone, u.photo, u.status,
                p.name as position_name, p.level, p.base_salary,
                d.name as department_name, d.code as department_code,
                wh.shift_name, wh.check_in_time, wh.check_out_time, wh.grace_period_minutes
            FROM employees e
            LEFT JOIN users u ON e.user_id = u.id
            LEFT JOIN positions p ON e.position_id = p.id
            LEFT JOIN departments d ON p.department_id = d.id
            LEFT JOIN working_hours wh ON e.working_hours_id = wh.id
            WHERE e.id = ? AND e.deleted_at IS NULL
        `,
        [id],
      );

      if (employees.length === 0) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.json({ employee: employees[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ============================
// PUT update employee data (admin/HR only)
// ============================
router.put(
  "/:id",
  verifyToken,
  verifyRole(["admin", "hr"]),
  uploadDocuments.fields([
    { name: "ktp_document", maxCount: 1 },
    { name: "diploma_document", maxCount: 1 },
    { name: "employment_contract_document", maxCount: 1 },
  ]),
  async (req, res) => {
    const { id } = req.params;
    const {
      full_name,
      gender,
      birth_place,
      date_of_birth,
      marital_status,
      nationality,
      address,
      phone,
      email,
      nik,
      npwp,
      bank_account,
      account_holder_name,
      bank_name,
      bpjs_number,
      position_id,
      join_date,
      basic_salary,
      employment_status,
      working_hours_id,
      username,
      status,
      user_status,
    } = req.body;

    try {
      // Cek apakah employee exists
      const [employeeCheck] = await db
        .promise()
        .query(
          "SELECT id, user_id FROM employees WHERE id = ? AND deleted_at IS NULL",
          [id],
        );

      if (employeeCheck.length === 0) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const employee = employeeCheck[0];

      // Validasi position_id jika diubah
      if (position_id) {
        const [positionCheck] = await db
          .promise()
          .query("SELECT id FROM positions WHERE id = ?", [position_id]);

        if (positionCheck.length === 0) {
          return res.status(400).json({ message: "Invalid position_id" });
        }
      }

      // Validasi working_hours_id jika diubah
      if (working_hours_id) {
        const [workingHoursCheck] = await db
          .promise()
          .query(
            "SELECT id FROM working_hours WHERE id = ? AND deleted_at IS NULL",
            [working_hours_id],
          );

        if (workingHoursCheck.length === 0) {
          return res.status(400).json({ message: "Invalid working_hours_id" });
        }
      }

      // Validasi NIK uniqueness (jika diubah)
      if (nik) {
        const [nikCheck] = await db
          .promise()
          .query(
            "SELECT id FROM employees WHERE nik = ? AND id != ? AND deleted_at IS NULL",
            [nik, id],
          );
        if (nikCheck.length > 0) {
          return res.status(400).json({ message: "NIK already exists" });
        }
      }

      // Validasi NPWP uniqueness (jika diubah)
      if (npwp) {
        const [npwpCheck] = await db
          .promise()
          .query(
            "SELECT id FROM employees WHERE npwp = ? AND id != ? AND deleted_at IS NULL",
            [npwp, id],
          );
        if (npwpCheck.length > 0) {
          return res.status(400).json({ message: "NPWP already exists" });
        }
      }

      // Validasi BPJS number uniqueness (jika diubah)
      if (bpjs_number) {
        const [bpjsCheck] = await db
          .promise()
          .query(
            "SELECT id FROM employees WHERE bpjs_number = ? AND id != ? AND deleted_at IS NULL",
            [bpjs_number, id],
          );
        if (bpjsCheck.length > 0) {
          return res
            .status(400)
            .json({ message: "BPJS number already exists" });
        }
      }

      // Build dynamic update query
      const updates = [];
      const values = [];

      if (full_name) {
        updates.push("full_name = ?");
        values.push(full_name);
      }
      if (position_id) {
        updates.push("position_id = ?");
        values.push(position_id);
      }
      if (join_date) {
        updates.push("join_date = ?");
        values.push(join_date);
      }
      if (basic_salary !== undefined) {
        updates.push("basic_salary = ?");
        values.push(basic_salary);
      }
      if (employment_status) {
        updates.push("employment_status = ?");
        values.push(employment_status);
      }
      if (working_hours_id) {
        updates.push("working_hours_id = ?");
        values.push(working_hours_id);
      }

      if (gender) {
        updates.push("gender = ?");
        values.push(gender);
      }
      if (birth_place) {
        updates.push("birth_place = ?");
        values.push(birth_place);
      }
      if (date_of_birth) {
        updates.push("date_of_birth = ?");
        values.push(date_of_birth);
      }
      if (marital_status) {
        updates.push("marital_status = ?");
        values.push(marital_status);
      }
      if (nationality) {
        updates.push("nationality = ?");
        values.push(nationality);
      }
      if (address) {
        updates.push("address = ?");
        values.push(address);
      }
      if (phone) {
        updates.push("phone = ?");
        values.push(phone);
      }
      if (email) {
        updates.push("email = ?");
        values.push(email);
      }
      if (nik) {
        updates.push("nik = ?");
        values.push(nik);
      }
      if (npwp) {
        updates.push("npwp = ?");
        values.push(npwp);
      }
      if (bank_account) {
        updates.push("bank_account = ?");
        values.push(bank_account);
      }
      if (account_holder_name) {
        updates.push("account_holder_name = ?");
        values.push(account_holder_name);
      }
      if (bank_name) {
        updates.push("bank_name = ?");
        values.push(bank_name);
      }
      if (bpjs_number) {
        updates.push("bpjs_number = ?");
        values.push(bpjs_number);
      }

      // Handle document uploads
      if (req.files && req.files.ktp_document) {
        updates.push("ktp_document = ?");
        values.push(
          `uploads/employee_documents/${req.files.ktp_document[0].filename}`,
        );
      }
      if (req.files && req.files.diploma_document) {
        updates.push("diploma_document = ?");
        values.push(
          `uploads/employee_documents/${req.files.diploma_document[0].filename}`,
        );
      }
      if (req.files && req.files.employment_contract_document) {
        updates.push("employment_contract_document = ?");
        values.push(
          `uploads/employee_documents/${req.files.employment_contract_document[0].filename}`,
        );
      }

      if (updates.length === 0) {
        return res.status(400).json({ message: "No fields to update" });
      }

      updates.push("updated_at = NOW()");
      values.push(id);

      const updateQuery = `UPDATE employees SET ${updates.join(
        ", ",
      )} WHERE id = ?`;

      await db.promise().query(updateQuery, values);

      // Sinkronkan field akun ke tabel users agar data yang tampil di tabel konsisten.
      if (employee.user_id) {
        const userUpdates = [];
        const userValues = [];

        if (full_name) {
          userUpdates.push("name = ?");
          userValues.push(full_name);
        }
        if (email) {
          userUpdates.push("email = ?");
          userValues.push(email);
        }
        if (phone) {
          userUpdates.push("phone = ?");
          userValues.push(phone);
        }
        if (username) {
          userUpdates.push("username = ?");
          userValues.push(username);
        }

        const normalizedUserStatus = String(
          user_status !== undefined ? user_status : status,
        )
          .toLowerCase()
          .trim();
        if (["active", "inactive", "pending"].includes(normalizedUserStatus)) {
          userUpdates.push("status = ?");
          userValues.push(normalizedUserStatus);
        }

        if (userUpdates.length > 0) {
          userUpdates.push("updated_at = NOW()");
          userValues.push(employee.user_id);
          await db
            .promise()
            .query(
              `UPDATE users SET ${userUpdates.join(", ")} WHERE id = ?`,
              userValues,
            );
        }
      }

      if (employee.user_id && position_id) {
        await syncAtasanRoleByPosition(employee.user_id, position_id);
      }

      // Log employee update
      await logActivity({
        userId: req.user.id,
        username: req.user.username,
        role: req.user.roles?.[0] || req.user.role,
        action: "UPDATE",
        module: "employees",
        description: `Updated employee data for ID: ${id}`,
        newValues: req.body,
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req),
      });

      res.json({ message: "Employee data updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ============================
// DELETE employee (admin/hr)
// ============================
router.delete(
  "/:id",
  verifyToken,
  verifyRole(["admin", "hr"]),
  async (req, res) => {
    const { id } = req.params;

    try {
      // Cek apakah employee exists
      const [employeeCheck] = await db
        .promise()
        .query(
          "SELECT id, user_id FROM employees WHERE id = ? AND deleted_at IS NULL",
          [id],
        );

      if (employeeCheck.length === 0) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const employee = employeeCheck[0];

      // Soft delete employee record
      await db
        .promise()
        .query(
          "UPDATE employees SET deleted_at = NOW(), updated_at = NOW() WHERE id = ?",
          [id],
        );

      // Nonaktifkan akun user agar tidak bisa login
      if (employee.user_id) {
        await db
          .promise()
          .query(
            "UPDATE users SET status = 'inactive', updated_at = NOW() WHERE id = ?",
            [employee.user_id],
          );
      }

      // Log employee deletion
      await logActivity({
        userId: req.user.id,
        username: req.user.username,
        role: req.user.roles?.[0] || req.user.role,
        action: "DELETE",
        module: "employees",
        description: `Deleted employee ID: ${id}`,
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req),
      });

      res.json({ message: "Employee deleted successfully" });
    } catch (error) {
      console.error(error);
      // Log failed employee deletion
      await logActivity({
        userId: req.user.id,
        username: req.user.username,
        role: req.user.roles?.[0] || req.user.role,
        action: "DELETE",
        module: "employees",
        description: `Failed to delete employee ID: ${req.params.id}`,
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req),
        status: "failed",
        errorMessage: error.message,
      });
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ============================
// GET LEAVE QUOTA (HR/Pegawai)
// ============================
router.get(
  "/:id/leave-quota",
  verifyToken,
  verifyRole(["hr", "pegawai"]),
  async (req, res) => {
    const { id } = req.params;

    try {
      // Jika pegawai, hanya bisa lihat quota sendiri
      if (req.user.role === "pegawai") {
        const [userEmployee] = await db
          .promise()
          .query(
            "SELECT id FROM employees WHERE user_id = ? AND deleted_at IS NULL",
            [req.user.id],
          );

        if (userEmployee.length === 0 || userEmployee[0].id !== parseInt(id)) {
          return res.status(403).json({
            message: "You can only view your own leave quota",
          });
        }
      }

      const [employees] = await db.promise().query(
        `SELECT id, employee_code, full_name, 
                        annual_leave_quota, remaining_leave_quota, quota_reset_date
                 FROM employees WHERE id = ? AND deleted_at IS NULL`,
        [id],
      );

      if (employees.length === 0) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.json({ quota: employees[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ============================
// RESET LEAVE QUOTA (HR only)
// ============================
router.put(
  "/:id/reset-quota",
  verifyToken,
  verifyRole(["hr"]),
  async (req, res) => {
    const { id } = req.params;
    const { annual_leave_quota } = req.body;

    try {
      const quotaValue = annual_leave_quota || 12;

      const [result] = await db.promise().query(
        `UPDATE employees 
                 SET annual_leave_quota = ?,
                     remaining_leave_quota = ?,
                     quota_reset_date = DATE_ADD(CURDATE(), INTERVAL 1 YEAR)
                 WHERE id = ? AND deleted_at IS NULL`,
        [quotaValue, quotaValue, id],
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Log leave quota reset
      await logActivity({
        userId: req.user.id,
        username: req.user.username,
        role: req.user.roles?.[0] || req.user.role,
        action: "UPDATE",
        module: "employees",
        description: `Reset leave quota for employee ID: ${id} to ${quotaValue} days`,
        newValues: {
          employee_id: id,
          annual_leave_quota: quotaValue,
          remaining_leave_quota: quotaValue,
        },
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req),
      });

      res.json({
        message: "Leave quota reset successfully",
        new_quota: quotaValue,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ============================
// GET ALL POSITIONS (Finance/HR - for salary management)
// ============================
router.get(
  "/positions/list/all",
  verifyToken,
  verifyRole(["hr", "finance"]),
  async (req, res) => {
    try {
      const [positions] = await db.promise().query(`
                SELECT 
                    p.id,
                    p.name,
                    p.level,
                    p.base_salary,
                    p.position_allowance,
                    p.status,
                    d.name as department_name,
                    p.created_at,
                    p.updated_at
                FROM positions p
                LEFT JOIN departments d ON p.department_id = d.id
                WHERE LOWER(COALESCE(p.level, '')) != 'commissioner'
                AND LOWER(COALESCE(p.name, '')) NOT LIKE '%commissioner%'
                ORDER BY p.level DESC, p.name ASC
            `);

      res.json({
        message: "Positions retrieved successfully",
        data: positions,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ============================
// UPDATE POSITION SALARY (Finance/HR - for salary management)
// ============================
router.put(
  "/positions/update/:id",
  verifyToken,
  verifyRole(["hr", "finance"]),
  async (req, res) => {
    const { id } = req.params;
    const { base_salary, position_allowance } = req.body;

    try {
      // Validasi position exists
      const [positionCheck] = await db
        .promise()
        .query("SELECT id FROM positions WHERE id = ?", [id]);

      if (positionCheck.length === 0) {
        return res.status(404).json({ message: "Position not found" });
      }

      // Build dynamic update query
      const updates = [];
      const values = [];

      if (base_salary !== undefined && base_salary !== null) {
        updates.push("base_salary = ?");
        values.push(Number(base_salary) || 0);
      }

      if (position_allowance !== undefined && position_allowance !== null) {
        updates.push("position_allowance = ?");
        values.push(Number(position_allowance) || 0);
      }

      if (updates.length === 0) {
        return res.status(400).json({ message: "No fields to update" });
      }

      updates.push("updated_at = NOW()");
      values.push(id);

      const updateQuery = `UPDATE positions SET ${updates.join(
        ", ",
      )} WHERE id = ?`;

      await db.promise().query(updateQuery, values);

      // Log position update
      await logActivity({
        userId: req.user.id,
        username: req.user.username,
        role: req.user.roles?.[0] || req.user.role,
        action: "UPDATE",
        module: "positions",
        description: `Updated position salary/allowance for ID: ${id}`,
        newValues: req.body,
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req),
      });

      res.json({ message: "Position salary updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ============================
// CREATE DEPARTMENT (admin/hr)
// ============================
router.post(
  "/departments",
  verifyToken,
  verifyRole(["admin", "hr"]),
  async (req, res) => {
    const { code, name, description, status } = req.body;

    if (!code || !name) {
      return res.status(400).json({ message: "code and name are required" });
    }

    try {
      // uniqueness check for code
      const [existing] = await db
        .promise()
        .query("SELECT id FROM departments WHERE code = ? OR name = ?", [code, name]);

      if (existing.length > 0) {
        return res.status(409).json({ message: "Department code or name already exists" });
      }

      const [result] = await db.promise().query(
        `INSERT INTO departments (code, name, description, status, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [code, name, description || null, status || "active"],
      );

      await logActivity({
        userId: req.user.id,
        username: req.user.username,
        role: req.user.roles?.[0] || req.user.role,
        action: "CREATE",
        module: "departments",
        description: `Created department: ${name}`,
        newValues: { code, name, description, status },
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req),
      });

      res.status(201).json({ message: "Department created", id: result.insertId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ============================
// UPDATE DEPARTMENT (admin/hr)
// ============================
router.put(
  "/departments/:id",
  verifyToken,
  verifyRole(["admin", "hr"]),
  async (req, res) => {
    const { id } = req.params;
    const { code, name, description, status } = req.body;

    try {
      const [existing] = await db
        .promise()
        .query("SELECT id FROM departments WHERE id = ?", [id]);

      if (existing.length === 0) {
        return res.status(404).json({ message: "Department not found" });
      }

      const updates = [];
      const values = [];

      if (code !== undefined) {
        updates.push("code = ?");
        values.push(code);
      }
      if (name !== undefined) {
        updates.push("name = ?");
        values.push(name);
      }
      if (description !== undefined) {
        updates.push("description = ?");
        values.push(description);
      }
      if (status !== undefined) {
        updates.push("status = ?");
        values.push(status);
      }

      if (updates.length === 0) {
        return res.status(400).json({ message: "No fields to update" });
      }

      updates.push("updated_at = NOW()");
      values.push(id);

      const updateQuery = `UPDATE departments SET ${updates.join(", ")} WHERE id = ?`;
      await db.promise().query(updateQuery, values);

      await logActivity({
        userId: req.user.id,
        username: req.user.username,
        role: req.user.roles?.[0] || req.user.role,
        action: "UPDATE",
        module: "departments",
        description: `Updated department ID: ${id}`,
        newValues: { code, name, description, status },
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req),
      });

      res.json({ message: "Department updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ============================
// DELETE DEPARTMENT (admin/hr)
// ============================
router.delete(
  "/departments/:id",
  verifyToken,
  verifyRole(["admin", "hr"]),
  async (req, res) => {
    const { id } = req.params;

    try {
      const [existing] = await db
        .promise()
        .query("SELECT id FROM departments WHERE id = ?", [id]);

      if (existing.length === 0) {
        return res.status(404).json({ message: "Department not found" });
      }

      // Check if department has positions
      const [positions] = await db
        .promise()
        .query("SELECT COUNT(*) as count FROM positions WHERE department_id = ?", [id]);

      if (positions[0].count > 0) {
        return res.status(400).json({ message: "Cannot delete department with existing positions" });
      }

      await db.promise().query("DELETE FROM departments WHERE id = ?", [id]);

      await logActivity({
        userId: req.user.id,
        username: req.user.username,
        role: req.user.roles?.[0] || req.user.role,
        action: "DELETE",
        module: "departments",
        description: `Deleted department ID: ${id}`,
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req),
      });

      res.json({ message: "Department deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ============================
// CREATE POSITION (admin/hr)
// ============================
router.post(
  "/positions",
  verifyToken,
  verifyRole(["admin", "hr"]),
  async (req, res) => {
    const { department_id, name, level, base_salary, position_allowance, status } = req.body;

    if (!department_id || !name) {
      return res.status(400).json({ message: "department_id and name are required" });
    }

    try {
      // validate department
      const [dept] = await db.promise().query("SELECT id FROM departments WHERE id = ?", [department_id]);
      if (dept.length === 0) {
        return res.status(400).json({ message: "Invalid department_id" });
      }

      const [result] = await db.promise().query(
        `INSERT INTO positions (department_id, name, level, base_salary, position_allowance, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [department_id, name, level || 'staff', base_salary || 0, position_allowance || null, status || 'active'],
      );

      await logActivity({
        userId: req.user.id,
        username: req.user.username,
        role: req.user.roles?.[0] || req.user.role,
        action: "CREATE",
        module: "positions",
        description: `Created position: ${name}`,
        newValues: { department_id, name, level, base_salary, position_allowance, status },
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req),
      });

      res.status(201).json({ message: "Position created", id: result.insertId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ============================
// UPDATE POSITION (admin/hr)
// ============================
router.put(
  "/positions/:id",
  verifyToken,
  verifyRole(["admin", "hr"]),
  async (req, res) => {
    const { id } = req.params;
    const { department_id, name, level, base_salary, position_allowance, status } = req.body;

    try {
      const [existing] = await db
        .promise()
        .query("SELECT id FROM positions WHERE id = ?", [id]);

      if (existing.length === 0) {
        return res.status(404).json({ message: "Position not found" });
      }

      if (department_id) {
        const [dept] = await db.promise().query("SELECT id FROM departments WHERE id = ?", [department_id]);
        if (dept.length === 0) {
          return res.status(400).json({ message: "Invalid department_id" });
        }
      }

      const updates = [];
      const values = [];

      if (department_id !== undefined) {
        updates.push("department_id = ?");
        values.push(department_id);
      }
      if (name !== undefined) {
        updates.push("name = ?");
        values.push(name);
      }
      if (level !== undefined) {
        updates.push("level = ?");
        values.push(level);
      }
      if (base_salary !== undefined) {
        updates.push("base_salary = ?");
        values.push(base_salary);
      }
      if (position_allowance !== undefined) {
        updates.push("position_allowance = ?");
        values.push(position_allowance);
      }
      if (status !== undefined) {
        updates.push("status = ?");
        values.push(status);
      }

      if (updates.length === 0) {
        return res.status(400).json({ message: "No fields to update" });
      }

      updates.push("updated_at = NOW()");
      values.push(id);

      const updateQuery = `UPDATE positions SET ${updates.join(", ")} WHERE id = ?`;
      await db.promise().query(updateQuery, values);

      await logActivity({
        userId: req.user.id,
        username: req.user.username,
        role: req.user.roles?.[0] || req.user.role,
        action: "UPDATE",
        module: "positions",
        description: `Updated position ID: ${id}`,
        newValues: { department_id, name, level, base_salary, position_allowance, status },
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req),
      });

      res.json({ message: "Position updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ============================
// DELETE POSITION (admin/hr)
// ============================
router.delete(
  "/positions/:id",
  verifyToken,
  verifyRole(["admin", "hr"]),
  async (req, res) => {
    const { id } = req.params;

    try {
      const [existing] = await db
        .promise()
        .query("SELECT id FROM positions WHERE id = ?", [id]);

      if (existing.length === 0) {
        return res.status(404).json({ message: "Position not found" });
      }

      // Check if position has employees
      const [employees] = await db
        .promise()
        .query("SELECT COUNT(*) as count FROM employees WHERE position_id = ? AND deleted_at IS NULL", [id]);

      if (employees[0].count > 0) {
        return res.status(400).json({ message: "Cannot delete position with existing employees" });
      }

      await db.promise().query("DELETE FROM positions WHERE id = ?", [id]);

      await logActivity({
        userId: req.user.id,
        username: req.user.username,
        role: req.user.roles?.[0] || req.user.role,
        action: "DELETE",
        module: "positions",
        description: `Deleted position ID: ${id}`,
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req),
      });

      res.json({ message: "Position deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

module.exports = router;
