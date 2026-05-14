const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const { logActivity, getIpAddress, getUserAgent } = require("../middleware/activityLogger");

// ============================
// GET all departments (admin/HR only)
// ============================
router.get("/", verifyToken, verifyRole(["admin", "hr"]), async (req, res) => {
  try {
    const [departments] = await db.promise().query(`
      SELECT 
        d.id,
        d.code,
        d.name,
        d.description,
        d.status,
        d.created_at,
        d.updated_at,
        COUNT(DISTINCT e.id) as totalEmployees,
        COUNT(DISTINCT p.id) as totalPositions
      FROM departments d
      LEFT JOIN positions p ON d.id = p.department_id
      LEFT JOIN employees e ON p.id = e.position_id AND e.deleted_at IS NULL
      GROUP BY d.id, d.code, d.name, d.description, d.status, d.created_at, d.updated_at
      ORDER BY d.name ASC
    `);

    res.json({ data: departments });
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ message: "Failed to fetch departments", error: error.message });
  }
});

// ============================
// GET single department by ID
// ============================
router.get("/:id", verifyToken, verifyRole(["admin", "hr"]), async (req, res) => {
  try {
    const { id } = req.params;

    const [departments] = await db.promise().query(`
      SELECT 
        d.*,
        COUNT(DISTINCT e.id) as totalEmployees,
        COUNT(DISTINCT p.id) as totalPositions
      FROM departments d
      LEFT JOIN positions p ON d.id = p.department_id
      LEFT JOIN employees e ON p.id = e.position_id AND e.deleted_at IS NULL
      WHERE d.id = ?
      GROUP BY d.id
    `, [id]);

    if (departments.length === 0) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.json({ data: departments[0] });
  } catch (error) {
    console.error("Error fetching department:", error);
    res.status(500).json({ message: "Failed to fetch department", error: error.message });
  }
});

// ============================
// POST create new department (admin only)
// ============================
router.post("/", verifyToken, verifyRole(["admin"]), async (req, res) => {
  try {
    const { code, name, description, status } = req.body;

    // Validation
    if (!code || !name) {
      return res.status(400).json({ message: "Code and name are required" });
    }

    // Check if code already exists
    const [existing] = await db.promise().query(
      "SELECT id FROM departments WHERE code = ?",
      [code]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Department code already exists" });
    }

    // Insert new department
    const [result] = await db.promise().query(
      "INSERT INTO departments (code, name, description, status) VALUES (?, ?, ?, ?)",
      [code, name, description || null, status || "active"]
    );

    // Log activity
    await logActivity(req, "CREATE", "DEPARTMENTS", `Created department: ${name}`, null, {
      code,
      name,
      description,
      status,
    });

    res.status(201).json({
      message: "Department created successfully",
      data: {
        id: result.insertId,
        code,
        name,
        description,
        status: status || "active",
        totalEmployees: 0,
        totalPositions: 0,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  } catch (error) {
    console.error("Error creating department:", error);
    res.status(500).json({ message: "Failed to create department", error: error.message });
  }
});

// ============================
// PUT update department (admin only)
// ============================
router.put("/:id", verifyToken, verifyRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description, status } = req.body;

    // Validation
    if (!code || !name) {
      return res.status(400).json({ message: "Code and name are required" });
    }

    // Check if department exists
    const [existing] = await db.promise().query(
      "SELECT * FROM departments WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Department not found" });
    }

    const oldDept = existing[0];

    // Check if new code conflicts with other departments
    const [codeConflict] = await db.promise().query(
      "SELECT id FROM departments WHERE code = ? AND id != ?",
      [code, id]
    );

    if (codeConflict.length > 0) {
      return res.status(409).json({ message: "Department code already exists" });
    }

    // Update department
    await db.promise().query(
      "UPDATE departments SET code = ?, name = ?, description = ?, status = ? WHERE id = ?",
      [code, name, description || null, status || "active", id]
    );

    // Log activity
    await logActivity(req, "UPDATE", "DEPARTMENTS", `Updated department: ${name}`, oldDept, {
      code,
      name,
      description,
      status,
    });

    res.json({
      message: "Department updated successfully",
      data: {
        id: parseInt(id),
        code,
        name,
        description,
        status: status || "active",
        created_at: oldDept.created_at,
        updated_at: new Date(),
      },
    });
  } catch (error) {
    console.error("Error updating department:", error);
    res.status(500).json({ message: "Failed to update department", error: error.message });
  }
});

// ============================
// DELETE department (admin only)
// ============================
router.delete("/:id", verifyToken, verifyRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if department exists
    const [existing] = await db.promise().query(
      "SELECT * FROM departments WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Department not found" });
    }

    const dept = existing[0];

    // Check if department has positions
    const [positions] = await db.promise().query(
      "SELECT COUNT(*) as count FROM positions WHERE department_id = ?",
      [id]
    );

    if (positions[0].count > 0) {
      return res.status(400).json({
        message: "Cannot delete department with existing positions",
        hasPositions: true,
      });
    }

    // Delete department
    await db.promise().query("DELETE FROM departments WHERE id = ?", [id]);

    // Log activity
    await logActivity(req, "DELETE", "DEPARTMENTS", `Deleted department: ${dept.name}`, dept, null);

    res.json({ message: "Department deleted successfully" });
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({ message: "Failed to delete department", error: error.message });
  }
});

module.exports = router;
