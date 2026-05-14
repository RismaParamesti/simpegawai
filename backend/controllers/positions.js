const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const { logActivity, getIpAddress, getUserAgent } = require("../middleware/activityLogger");

// ============================
// GET all positions (admin/HR only)
// ============================
router.get("/", verifyToken, verifyRole(["admin", "hr"]), async (req, res) => {
  try {
    const [positions] = await db.promise().query(`
      SELECT 
        p.id,
        p.department_id,
        p.name,
        p.level,
        p.base_salary,
        p.position_allowance,
        p.status,
        p.created_at,
        p.updated_at,
        d.code as department_code,
        d.name as department_name,
        COUNT(DISTINCT e.id) as totalEmployees
      FROM positions p
      LEFT JOIN departments d ON p.department_id = d.id
      LEFT JOIN employees e ON p.id = e.position_id
      WHERE LOWER(COALESCE(p.level, '')) != 'commissioner'
      AND LOWER(COALESCE(p.name, '')) NOT LIKE '%commissioner%'
      GROUP BY p.id, p.department_id, p.name, p.level, p.base_salary, 
               p.position_allowance, p.status, p.created_at, p.updated_at,
               d.code, d.name
      ORDER BY p.name ASC
    `);

    res.json({ data: positions });
  } catch (error) {
    console.error("Error fetching positions:", error);
    res.status(500).json({ message: "Failed to fetch positions", error: error.message });
  }
});

// ============================
// GET positions by department (admin/HR only)
// ============================
router.get("/department/:departmentId", verifyToken, verifyRole(["admin", "hr"]), async (req, res) => {
  try {
    const { departmentId } = req.params;

    const [positions] = await db.promise().query(`
      SELECT 
        p.id,
        p.department_id,
        p.name,
        p.level,
        p.base_salary,
        p.position_allowance,
        p.status,
        p.created_at,
        p.updated_at,
        d.code as department_code,
        d.name as department_name,
        COUNT(DISTINCT e.id) as totalEmployees
      FROM positions p
      LEFT JOIN departments d ON p.department_id = d.id
      LEFT JOIN employees e ON p.id = e.position_id
      WHERE p.department_id = ?
      AND LOWER(COALESCE(p.level, '')) != 'commissioner'
      AND LOWER(COALESCE(p.name, '')) NOT LIKE '%commissioner%'
      GROUP BY p.id, p.department_id, p.name, p.level, p.base_salary, 
               p.position_allowance, p.status, p.created_at, p.updated_at,
               d.code, d.name
      ORDER BY p.name ASC
    `, [departmentId]);

    res.json({ data: positions });
  } catch (error) {
    console.error("Error fetching positions by department:", error);
    res.status(500).json({ message: "Failed to fetch positions", error: error.message });
  }
});

// ============================
// GET single position by ID
// ============================
router.get("/:id", verifyToken, verifyRole(["admin", "hr"]), async (req, res) => {
  try {
    const { id } = req.params;

    const [positions] = await db.promise().query(`
      SELECT 
        p.*,
        d.code as department_code,
        d.name as department_name,
        COUNT(DISTINCT e.id) as totalEmployees
      FROM positions p
      LEFT JOIN departments d ON p.department_id = d.id
      LEFT JOIN employees e ON p.id = e.position_id
      WHERE p.id = ?
      AND LOWER(COALESCE(p.level, '')) != 'commissioner'
      AND LOWER(COALESCE(p.name, '')) NOT LIKE '%commissioner%'
      GROUP BY p.id
    `, [id]);

    if (positions.length === 0) {
      return res.status(404).json({ message: "Position not found" });
    }

    res.json({ data: positions[0] });
  } catch (error) {
    console.error("Error fetching position:", error);
    res.status(500).json({ message: "Failed to fetch position", error: error.message });
  }
});

// ============================
// POST create new position (admin only)
// ============================
router.post("/", verifyToken, verifyRole(["admin"]), async (req, res) => {
  try {
    const { department_id, name, level, base_salary, position_allowance, status } = req.body;

    // Validation
    if (!department_id || !name || base_salary === undefined) {
      return res.status(400).json({ message: "Department ID, name, and base salary are required" });
    }

    // Check if department exists
    const [dept] = await db.promise().query(
      "SELECT id FROM departments WHERE id = ?",
      [department_id]
    );

    if (dept.length === 0) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Insert new position
    const [result] = await db.promise().query(
      `INSERT INTO positions 
       (department_id, name, level, base_salary, position_allowance, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [department_id, name, level || "staff", base_salary, position_allowance || null, status || "active"]
    );

    // Log activity
    await logActivity(req, "CREATE", "POSITIONS", `Created position: ${name}`, null, {
      department_id,
      name,
      level,
      base_salary,
      position_allowance,
      status,
    });

    res.status(201).json({
      message: "Position created successfully",
      data: {
        id: result.insertId,
        department_id,
        name,
        level: level || "staff",
        base_salary,
        position_allowance,
        status: status || "active",
        totalEmployees: 0,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  } catch (error) {
    console.error("Error creating position:", error);
    res.status(500).json({ message: "Failed to create position", error: error.message });
  }
});

// ============================
// PUT update position (admin only)
// ============================
router.put("/:id", verifyToken, verifyRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { department_id, name, level, base_salary, position_allowance, status } = req.body;

    // Validation
    if (!department_id || !name || base_salary === undefined) {
      return res.status(400).json({ message: "Department ID, name, and base salary are required" });
    }

    // Check if position exists
    const [existing] = await db.promise().query(
      "SELECT * FROM positions WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Position not found" });
    }

    const oldPos = existing[0];

    // Check if department exists
    const [dept] = await db.promise().query(
      "SELECT id FROM departments WHERE id = ?",
      [department_id]
    );

    if (dept.length === 0) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Update position
    await db.promise().query(
      `UPDATE positions 
       SET department_id = ?, name = ?, level = ?, base_salary = ?, position_allowance = ?, status = ? 
       WHERE id = ?`,
      [department_id, name, level || "staff", base_salary, position_allowance || null, status || "active", id]
    );

    // Log activity
    await logActivity(req, "UPDATE", "POSITIONS", `Updated position: ${name}`, oldPos, {
      department_id,
      name,
      level,
      base_salary,
      position_allowance,
      status,
    });

    res.json({
      message: "Position updated successfully",
      data: {
        id: parseInt(id),
        department_id,
        name,
        level: level || "staff",
        base_salary,
        position_allowance,
        status: status || "active",
        created_at: oldPos.created_at,
        updated_at: new Date(),
      },
    });
  } catch (error) {
    console.error("Error updating position:", error);
    res.status(500).json({ message: "Failed to update position", error: error.message });
  }
});

// ============================
// DELETE position (admin only)
// ============================
router.delete("/:id", verifyToken, verifyRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if position exists
    const [existing] = await db.promise().query(
      "SELECT * FROM positions WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Position not found" });
    }

    const pos = existing[0];

    // Check if position has employees
    const [employees] = await db.promise().query(
      "SELECT COUNT(*) as count FROM employees WHERE position_id = ?",
      [id]
    );

    if (employees[0].count > 0) {
      return res.status(400).json({
        message: "Cannot delete position with existing employees",
        hasEmployees: true,
      });
    }

    // Delete position
    await db.promise().query("DELETE FROM positions WHERE id = ?", [id]);

    // Log activity
    await logActivity(req, "DELETE", "POSITIONS", `Deleted position: ${pos.name}`, pos, null);

    res.json({ message: "Position deleted successfully" });
  } catch (error) {
    console.error("Error deleting position:", error);
    res.status(500).json({ message: "Failed to delete position", error: error.message });
  }
});

module.exports = router;
