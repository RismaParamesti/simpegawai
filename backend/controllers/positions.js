const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const { logActivity, getIpAddress, getUserAgent } = require("../middleware/activityLogger");

const visiblePositionWhere = `
  LOWER(COALESCE(p.level, '')) != 'commissioner'
  AND LOWER(COALESCE(p.name, '')) NOT LIKE '%commissioner%'
`;

const isCommissionerPositionInput = (name = "", level = "") => {
  const normalizedName = String(name || "").toLowerCase().trim();
  const normalizedLevel = String(level || "").toLowerCase().trim();
  return normalizedName.includes("commissioner") || normalizedLevel === "commissioner";
};

const syncAtasanRoleForPositionEmployees = async (positionId, level) => {
  const isManagerLevel = String(level || "").toLowerCase().trim() === "manager";
  const [employees] = await db.promise().query(
    "SELECT user_id FROM employees WHERE position_id = ? AND user_id IS NOT NULL AND deleted_at IS NULL",
    [positionId],
  );

  for (const employee of employees) {
    const [roles] = await db.promise().query(
      `SELECT r.name
       FROM user_roles ur
       JOIN roles r ON r.id = ur.role_id
       WHERE ur.user_id = ?`,
      [employee.user_id],
    );

    const roleSet = new Set(roles.map((role) => role.name));
    roleSet.add("pegawai");

    if (isManagerLevel) {
      roleSet.add("atasan");
    } else {
      roleSet.delete("atasan");
    }

    await db.promise().query("DELETE FROM user_roles WHERE user_id = ?", [employee.user_id]);

    for (const roleName of roleSet) {
      const [roleRows] = await db.promise().query("SELECT id FROM roles WHERE name = ?", [roleName]);
      if (roleRows.length > 0) {
        await db.promise().query(
          "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)",
          [employee.user_id, roleRows[0].id],
        );
      }
    }
  }
};

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
      WHERE ${visiblePositionWhere}
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
      AND ${visiblePositionWhere}
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
// GET all visible positions for salary/allowance management
// ============================
router.get("/list/all", verifyToken, verifyRole(["admin", "hr", "finance"]), async (req, res) => {
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
        d.name as department_name,
        p.created_at,
        p.updated_at
      FROM positions p
      LEFT JOIN departments d ON p.department_id = d.id
      WHERE ${visiblePositionWhere}
      ORDER BY p.level DESC, p.name ASC
    `);

    res.json({
      message: "Positions retrieved successfully",
      data: positions,
    });
  } catch (error) {
    console.error("Error fetching positions:", error);
    res.status(500).json({ message: "Failed to fetch positions", error: error.message });
  }
});

// ============================
// UPDATE position salary/allowance
// ============================
router.put("/update/:id", verifyToken, verifyRole(["admin", "hr", "finance"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { base_salary, position_allowance } = req.body;

    const [positionCheck] = await db
      .promise()
      .query(
        `SELECT id FROM positions p WHERE p.id = ? AND ${visiblePositionWhere}`,
        [id],
      );

    if (positionCheck.length === 0) {
      return res.status(404).json({ message: "Position not found" });
    }

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

    await db.promise().query(
      `UPDATE positions SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

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
    console.error("Error updating position salary:", error);
    res.status(500).json({ message: "Failed to update position salary", error: error.message });
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
      AND ${visiblePositionWhere}
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
// POST create new position (admin/HR only)
// ============================
router.post("/", verifyToken, verifyRole(["admin", "hr"]), async (req, res) => {
  try {
    const { department_id, name, level, base_salary, position_allowance, status } = req.body;

    // Validation
    if (!department_id || !name) {
      return res.status(400).json({ message: "Department ID and name are required" });
    }

    if (isCommissionerPositionInput(name, level)) {
      return res.status(400).json({ message: "Commissioner position is not managed from this menu" });
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
      [
        department_id,
        name,
        level || "staff",
        base_salary !== undefined ? Number(base_salary) || 0 : 0,
        position_allowance !== undefined ? Number(position_allowance) || 0 : null,
        status || "active",
      ]
    );

    // Log activity
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
// PUT update position (admin/HR only)
// ============================
router.put("/:id", verifyToken, verifyRole(["admin", "hr"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { department_id, name, level, base_salary, position_allowance, status } = req.body;

    // Check if position exists
    const [existing] = await db.promise().query(
      "SELECT * FROM positions WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Position not found" });
    }

    const oldPos = existing[0];

    const nextName = name !== undefined ? name : oldPos.name;
    const nextLevel = level !== undefined ? level : oldPos.level;

    if (isCommissionerPositionInput(nextName, nextLevel)) {
      return res.status(400).json({ message: "Commissioner position is not managed from this menu" });
    }

    // Check if department exists
    if (department_id !== undefined) {
      const [dept] = await db.promise().query(
        "SELECT id FROM departments WHERE id = ?",
        [department_id]
      );

      if (dept.length === 0) {
        return res.status(404).json({ message: "Department not found" });
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
      values.push(level || "staff");
    }
    if (base_salary !== undefined) {
      updates.push("base_salary = ?");
      values.push(Number(base_salary) || 0);
    }
    if (position_allowance !== undefined) {
      updates.push("position_allowance = ?");
      values.push(Number(position_allowance) || 0);
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

    await db.promise().query(
      `UPDATE positions SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    if (level !== undefined && String(oldPos.level || "").toLowerCase().trim() !== String(nextLevel || "staff").toLowerCase().trim()) {
      await syncAtasanRoleForPositionEmployees(id, nextLevel || "staff");
    }

    // Log activity
    await logActivity({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.roles?.[0] || req.user.role,
      action: "UPDATE",
      module: "positions",
      description: `Updated position ID: ${id}`,
      oldValues: oldPos,
      newValues: { department_id, name, level, base_salary, position_allowance, status },
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
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
// DELETE position (admin/HR only)
// ============================
router.delete("/:id", verifyToken, verifyRole(["admin", "hr"]), async (req, res) => {
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
    await logActivity({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.roles?.[0] || req.user.role,
      action: "DELETE",
      module: "positions",
      description: `Deleted position: ${pos.name}`,
      oldValues: pos,
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
    });

    res.json({ message: "Position deleted successfully" });
  } catch (error) {
    console.error("Error deleting position:", error);
    res.status(500).json({ message: "Failed to delete position", error: error.message });
  }
});

module.exports = router;
