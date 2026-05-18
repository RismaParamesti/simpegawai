const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const { resolveManagerScope } = require("../utils/managerScope");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Holidays = require("date-holidays");
const { logActivity, getIpAddress, getUserAgent } = require("../middleware/activityLogger");

const STANDARD_CHECK_IN_TIME = "08:00:00";
const STANDARD_CHECK_OUT_TIME = "17:00:00";
const LATE_TOLERANCE_MINUTES = 60;
const holidayCalendar = new Holidays("ID");

const MANAGER_POSITION_NAMES = [
    "operations manager",
    "marketing & sales manager",
    "finance, accounting & tax manager",
    "hr manager",
    "head of operations",
];

const ALPHA_SANCTION_LEVEL = {
    NONE: "none",
};

const normalizeSanctionLevel = (value) => {
    const raw = String(value || "").toLowerCase().trim();
    if (!raw) return null;
    if (raw === "none" || raw === "0" || raw === "-") return "none";

    if (/^\d+$/.test(raw)) {
        const num = Number.parseInt(raw, 10);
        return Number.isFinite(num) && num > 0 ? `sp${num}` : null;
    }

    const spMatch = raw.match(/^sp\s*[-_]?\s*(\d+)$/i);
    if (spMatch) {
        return `sp${Number.parseInt(spMatch[1], 10)}`;
    }

    const slug = raw
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");

    return slug || null;
};

function timeStringToSeconds(timeStr) {
    if (!timeStr) return 0;
    const [h, m, s] = timeStr.split(":").map(Number);
    return (Number(h) || 0) * 3600 + (Number(m) || 0) * 60 + (Number(s) || 0);
}

function secondsToHoursDecimal(seconds) {
    return Math.round((Number(seconds) / 3600) * 100) / 100;
}

const formatTimeLabel = (timeStr) => {
    if (!timeStr) return "";
    const parts = String(timeStr).split(":");
    return `${String(parts[0] || "0").padStart(2, "0")}:${String(parts[1] || "0").padStart(2, "0")}`;
};

const getWorkingHoursWindow = (workingHours = {}) => {
    const checkInTime = workingHours.check_in_time || STANDARD_CHECK_IN_TIME;
    const checkOutTime = workingHours.check_out_time || STANDARD_CHECK_OUT_TIME;

    return {
        check_in_time: checkInTime,
        check_out_time: checkOutTime,
        check_in_seconds: timeStringToSeconds(checkInTime),
        check_out_seconds: timeStringToSeconds(checkOutTime),
        label: `${formatTimeLabel(checkInTime)} - ${formatTimeLabel(checkOutTime)}`,
    };
};

function formatDateOnly(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

// ============================
// HELPER FUNCTIONS
// ============================

// Function untuk calculate late minutes
const calculateLateMinutes = (checkInTime, standardCheckInTime) => {
    const parseTimeToSeconds = (timeValue) => {
        if (!timeValue) return null;

        const [hour, minute, second = 0] = String(timeValue)
            .split(":")
            .map(Number);

        if ([hour, minute, second].some((part) => Number.isNaN(part))) {
            return null;
        }

        return hour * 3600 + minute * 60 + second;
    };

    const checkInTotalSeconds = parseTimeToSeconds(checkInTime);
    const standardTotalSeconds = parseTimeToSeconds(standardCheckInTime);

    if (
        checkInTotalSeconds === null ||
        standardTotalSeconds === null ||
        !Number.isFinite(checkInTotalSeconds) ||
        !Number.isFinite(standardTotalSeconds)
    ) {
        return 0;
    }

    const diffSeconds = checkInTotalSeconds - standardTotalSeconds;

    if (diffSeconds <= 0) return 0;
    return Math.ceil(diffSeconds / 60);
};

const getApprovedSpecialPermissionForDate = async (employeeId, dateValue) => {
    const [rows] = await db.promise().query(
        `SELECT lr.id, lr.time, lr.cuti_khusus_option, lr.leave_type
         FROM leave_requests lr
         WHERE lr.employee_id = ?
           AND lr.status = 'approved'
           AND (
             lr.leave_type IN ('izin_terlambat', 'pulang_cepat_khusus')
             OR (lr.leave_type = 'cuti_khusus' AND lr.cuti_khusus_option IN ('terlambat', 'pulang_cepat'))
           )
           AND lr.start_date <= ?
           AND lr.end_date >= ?
         ORDER BY lr.approved_at DESC, lr.id DESC
         LIMIT 1`,
        [employeeId, dateValue, dateValue]
    );

    return rows[0] || null;
};

const getLatePolicy = (lateMinutes) => {
    const normalizedLateMinutes = Math.max(0, Number(lateMinutes) || 0);
    const isPenalizedLate = normalizedLateMinutes > LATE_TOLERANCE_MINUTES;
    const isToleratedLate =
        normalizedLateMinutes > 0 && normalizedLateMinutes <= LATE_TOLERANCE_MINUTES;

    return {
        late_minutes: normalizedLateMinutes,
        is_tolerated_late: isToleratedLate,
        is_penalized_late: isPenalizedLate,
        late_penalty_days: isPenalizedLate ? 0.5 : 0,
    };
};

const isAtasanRoleActive = (req) =>
    String(req.headers["x-active-role"] || "").toLowerCase() === "atasan";

const shouldScopeAsAtasan = (req) =>
    (req.user.roles || []).includes("atasan") && isAtasanRoleActive(req);

const normalizeText = (value = "") =>
    String(value).toLowerCase().replace(/\s+/g, " ").trim();

const isManagerLevelPosition = (positionName = "") => {
    const normalized = normalizeText(positionName);
    return MANAGER_POSITION_NAMES.includes(normalized);
};

const isDirectorLevelPosition = (positionName = "") => {
    const normalized = normalizeText(positionName);
    return (
        normalized.includes("direktur") ||
        normalized.includes("director") ||
        normalized.includes("direksi") ||
        normalized.includes("ceo") ||
        normalized.includes("owner")
    );
};


// Hapus duplikat deklarasi, gunakan fungsi di bagian atas file

const getHolidayInfo = (dateValue) => {
    const result = holidayCalendar.isHoliday(new Date(dateValue));
    if (!result) return null;
    if (Array.isArray(result)) return result[0] || null;
    return result;
};

const isPublicHoliday = (dateValue) => {
    return !!getHolidayInfo(dateValue);
};

const getHolidayName = (dateValue) => {
    return getHolidayInfo(dateValue)?.name || "Tanggal merah";
};

const mapLeaveTypeToAttendanceStatus = (leaveType) => {
    if (leaveType === "cuti_sakit") return "sakit";
    return "izin";
};

const formatServiceRequirement = (months) => {
    const totalMonths = Number(months) || 0;
    if (totalMonths % 12 === 0) {
        return `${totalMonths / 12} tahun`;
    }

    return `${totalMonths} bulan`;
};

const calculateServiceMonths = (referenceDate) => {
    if (!referenceDate) return 0;

    const start = new Date(referenceDate);
    if (Number.isNaN(start.getTime())) return 0;

    const now = new Date();
    let months =
        (now.getFullYear() - start.getFullYear()) * 12 +
        (now.getMonth() - start.getMonth());

    if (now.getDate() < start.getDate()) {
        months -= 1;
    }

    return Math.max(months, 0);
};

const getLeavePolicyByType = async (leaveType) => {
    try {
        const [rows] = await db.promise().query(
            `SELECT leave_type, label, min_tenure_months, min_days, max_days, require_bukti, require_bukti_if_days_gt, attendance_status, deduct_quota, is_active, meta
             FROM leave_request_settings
             WHERE leave_type = ? AND is_active = 1
             LIMIT 1`,
            [leaveType]
        );

        if (rows.length > 0) {
            const row = rows[0];
            if (row.meta && typeof row.meta === "string") {
                try {
                    row.meta = JSON.parse(row.meta);
                } catch (e) {
                    // ignore parse errors
                }
            }
            return row;
        }
    } catch (error) {
        if (error?.code !== "ER_NO_SUCH_TABLE" && error?.errno !== 1146) {
            throw error;
        }
    }

    return null;
};

const getEffectiveMaxLeaveDays = (policy, leaveType, cutiKhususOptionKey) => {
    if (!policy) return leaveType === "izin_sakit" ? 20 : 0;

    if (leaveType === "cuti_khusus") {
        const options = Array.isArray(policy.meta?.options) ? policy.meta.options : [];
        const selectedOption = options.find((option) => option.key === cutiKhususOptionKey);
        if (selectedOption && Number(selectedOption.days) > 0) {
            return Number(selectedOption.days);
        }
    }

    const maxDays = Number(policy.max_days || 0);
    if (maxDays > 0) return maxDays;

    return leaveType === "izin_sakit" ? 20 : 0;
};

const calculateTotalLeaveDays = (startDate, endDate) => {
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (
        Number.isNaN(startDateObj.getTime()) ||
        Number.isNaN(endDateObj.getTime()) ||
        endDateObj < startDateObj
    ) {
        return -1;
    }

    const diffTime = endDateObj.getTime() - startDateObj.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

const isQuotaDeductingLeaveType = (leaveType) =>
    ["cuti_tahunan"].includes(leaveType);

const getCalculatedRemainingLeaveQuota = async (employeeId) => {
    const [quotaResult] = await db
        .promise()
        .query(
            `SELECT
                COALESCE(e.annual_leave_quota, 12) AS annual_leave_quota,
                GREATEST(
                    COALESCE(e.annual_leave_quota, 12)
                    - COALESCE(
                        (
                            SELECT SUM(COALESCE(lr.total_days, 0))
                            FROM leave_requests lr
                            WHERE lr.employee_id = e.id
                              AND lr.status = 'approved'
                              AND lr.leave_type IN ('cuti_tahunan')
                        ),
                        0
                    ),
                    0
                ) AS calculated_remaining_leave_quota
             FROM employees e
             WHERE e.id = ?
             LIMIT 1`,
            [employeeId]
        );

    if (!quotaResult.length) {
        return {
            annual_leave_quota: 12,
            calculated_remaining_leave_quota: 0,
        };
    }

    return quotaResult[0];
};

const getEmployeeCreatedDateOnly = async (employeeId) => {
    const [rows] = await db
        .promise()
        .query("SELECT created_at FROM employees WHERE id = ? LIMIT 1", [
            employeeId,
        ]);

    if (!rows.length || !rows[0].created_at) return null;

    const createdDate = new Date(rows[0].created_at);
    if (Number.isNaN(createdDate.getTime())) return null;

    createdDate.setHours(0, 0, 0, 0);
    return createdDate;
};

const applyApprovedLeaveEffects = async (leaveRequest) => {
    const startDate = new Date(leaveRequest.start_date);
    const endDate = new Date(leaveRequest.end_date);
    const attendanceStatus =
        leaveRequest.attendance_status ||
        mapLeaveTypeToAttendanceStatus(leaveRequest.leave_type);

    // For izin_terlambat (late arrival permission), don't create attendance record
    // This allows alpha status if employee doesn't check-in
    if (String(leaveRequest.leave_type) === 'izin_terlambat') {
        // Still need to evaluate discipline and deduct quota if applicable
        if (isQuotaDeductingLeaveType(leaveRequest.leave_type)) {
            await db.promise().query(
                `UPDATE employees 
                SET remaining_leave_quota = GREATEST(COALESCE(remaining_leave_quota, 0) - ?, 0) 
                WHERE id = ?`,
                [leaveRequest.total_days, leaveRequest.employee_id]
            );
        }
        await evaluateAlphaDisciplineForEmployee(leaveRequest.employee_id);
        return;
    }

    for (
        let date = new Date(startDate);
        date <= endDate;
        date.setDate(date.getDate() + 1)
    ) {
        const dateStr = formatDateOnly(date);
        // Persist leave_request_id when available so attendance rows
        // can be traced back to the originating leave request.
        const leaveRequestId = leaveRequest.id || leaveRequest.request_id || leaveRequest.requestId || null;
        await db.promise().query(
            `INSERT INTO attendance 
            (employee_id, date, status, notes, leave_request_id, created_at) 
            VALUES (?, ?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE
                status = VALUES(status),
                notes = VALUES(notes),
                leave_request_id = VALUES(leave_request_id)`,
            [
                leaveRequest.employee_id,
                dateStr,
                attendanceStatus,
                `${leaveRequest.leave_type}: ${leaveRequest.reason}`,
                leaveRequestId,
            ]
        );
    }

    if (isQuotaDeductingLeaveType(leaveRequest.leave_type)) {
        await db.promise().query(
            `UPDATE employees 
            SET remaining_leave_quota = GREATEST(COALESCE(remaining_leave_quota, 0) - ?, 0) 
            WHERE id = ?`,
            [leaveRequest.total_days, leaveRequest.employee_id]
        );
    }

    await evaluateAlphaDisciplineForEmployee(leaveRequest.employee_id);
};

const ensureAlphaAttendanceRecords = async (employeeId, month, year) => {
    const now = new Date();
    const targetMonth = Number(month) || now.getMonth() + 1;
    const targetYear = Number(year) || now.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const lastDateOfMonth = new Date(targetYear, targetMonth, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let endDate = new Date(lastDateOfMonth);
    if (
        targetYear === today.getFullYear() &&
        targetMonth === today.getMonth() + 1
    ) {
        endDate = new Date(today);
        endDate.setDate(endDate.getDate() - 1);
    }

    if (endDate < startDate) {
        return 0;
    }

    const employeeCreatedDate = await getEmployeeCreatedDateOnly(employeeId);
    if (employeeCreatedDate) {
        if (employeeCreatedDate > endDate) {
            return 0;
        }

        if (employeeCreatedDate > startDate) {
            startDate.setTime(employeeCreatedDate.getTime());
        }
    }

    let createdAlphaCount = 0;

    for (
        let cursor = new Date(startDate);
        cursor <= endDate;
        cursor.setDate(cursor.getDate() + 1)
    ) {
        // Hari kerja: Senin-Sabtu (Minggu tidak dihitung)
        if (cursor.getDay() === 0) {
            continue;
        }

        const dateStr = formatDateOnly(cursor);
        const [existingAttendance] = await db
            .promise()
            .query(
                "SELECT id FROM attendance WHERE employee_id = ? AND date = ?",
                [employeeId, dateStr]
            );

        if (existingAttendance.length === 0) {
            if (isPublicHoliday(cursor)) {
                await db.promise().query(
                    `INSERT INTO attendance 
                    (employee_id, date, status, notes, is_late, late_minutes, created_at) 
                    VALUES (?, ?, 'libur', ?, 0, 0, NOW())
                    ON DUPLICATE KEY UPDATE employee_id = employee_id`,
                    [employeeId, dateStr, `Libur: ${getHolidayName(cursor)}`]
                );
                continue;
            }

            const [insertResult] = await db.promise().query(
                `INSERT INTO attendance 
                (employee_id, date, status, is_late, late_minutes, created_at) 
                VALUES (?, ?, 'alpha', 0, 0, NOW())
                ON DUPLICATE KEY UPDATE employee_id = employee_id`,
                [employeeId, dateStr]
            );

            if (insertResult.affectedRows === 1) {
                createdAlphaCount += 1;
            }
        }
    }

    if (createdAlphaCount > 0) {
        await evaluateAlphaDisciplineForEmployee(employeeId);
    }

    return createdAlphaCount;
};

const ensureAlphaAttendanceByDate = async (employeeId, dateObj) => {
    const employeeCreatedDate = await getEmployeeCreatedDateOnly(employeeId);
    if (employeeCreatedDate) {
        const targetDate = new Date(dateObj);
        targetDate.setHours(0, 0, 0, 0);
        if (targetDate < employeeCreatedDate) {
            return false;
        }
    }

    // Hari kerja: Senin-Sabtu (Minggu tidak dihitung)
    if (dateObj.getDay() === 0) {
        return false;
    }

    const dateStr = formatDateOnly(dateObj);
    const [existingAttendance] = await db
        .promise()
        .query("SELECT id FROM attendance WHERE employee_id = ? AND date = ?", [
            employeeId,
            dateStr,
        ]);

    if (existingAttendance.length > 0) {
        return false;
    }

    if (isPublicHoliday(dateObj)) {
        const [insertResult] = await db.promise().query(
            `INSERT INTO attendance 
            (employee_id, date, status, notes, is_late, late_minutes, created_at) 
            VALUES (?, ?, 'libur', ?, 0, 0, NOW())
            ON DUPLICATE KEY UPDATE employee_id = employee_id`,
            [employeeId, dateStr, `Libur: ${getHolidayName(dateObj)}`]
        );
        return insertResult.affectedRows === 1;
    }

    const [insertResult] = await db.promise().query(
        `INSERT INTO attendance 
        (employee_id, date, status, is_late, late_minutes, created_at) 
        VALUES (?, ?, 'alpha', 0, 0, NOW())
        ON DUPLICATE KEY UPDATE employee_id = employee_id`,
        [employeeId, dateStr]
    );

    if (insertResult.affectedRows === 1) {
        await evaluateAlphaDisciplineForEmployee(employeeId);
        return true;
    }

    return false;
};

// Determine sanction level based on active attendance_warning_rules in DB.
// This allows HR to add/change rules (e.g., SP4) without code changes.
const getSanctionLevelFromAlphaCounts = async ({
    alphaConsecutiveDays,
    alphaAccumulatedDays,
    lateConsecutiveDays,
    lateAccumulatedDays,
}) => {
    const consecutive = Number(alphaConsecutiveDays || 0);
    const accumulated = Number(alphaAccumulatedDays || 0);
    const lateConsecutive = Number(lateConsecutiveDays || 0);
    const lateAccum = Number(lateAccumulatedDays || 0);

    try {
        const [rules] = await db.promise().query(
            `SELECT * FROM attendance_warning_rules WHERE is_active = 1 ORDER BY GREATEST(COALESCE(min_consecutive_alpha,0), COALESCE(min_accumulated_alpha,0), COALESCE(min_consecutive_late,0), COALESCE(min_accumulated_late,0)) DESC, id DESC`
        );

        for (const rule of rules) {
            const minConsec = Number(rule.min_consecutive_alpha || 0);
            const minAccum = Number(rule.min_accumulated_alpha || 0);
            const minConsecLate = Number(rule.min_consecutive_late || 0);
            const minAccumLate = Number(rule.min_accumulated_late || 0);
            const normalizedRuleLevel = normalizeSanctionLevel(rule.sanction_level) || ALPHA_SANCTION_LEVEL.NONE;

            if (minConsec > 0 && consecutive >= minConsec) {
                return {
                    level: normalizedRuleLevel,
                    label: rule.sanction_label || null,
                };
            }
            if (minAccum > 0 && accumulated >= minAccum) {
                return {
                    level: normalizedRuleLevel,
                    label: rule.sanction_label || null,
                };
            }

            if (minConsecLate > 0 && lateConsecutive >= minConsecLate) {
                return {
                    level: normalizedRuleLevel,
                    label: rule.sanction_label || null,
                };
            }
            if (minAccumLate > 0 && lateAccum >= minAccumLate) {
                return {
                    level: normalizedRuleLevel,
                    label: rule.sanction_label || null,
                };
            }
        }
    } catch (error) {
        console.error("Failed to load attendance_warning_rules:", error?.message || error);
    }

    return { level: ALPHA_SANCTION_LEVEL.NONE, label: null };
};

const evaluateAlphaDisciplineForEmployee = async (employeeId) => {
    const [employeeData] = await db.promise().query(
        `SELECT created_at FROM employees WHERE id = ?`,
        [employeeId]
    );

    if (!employeeData.length) {
        return {
            alpha_consecutive_days: 0,
            alpha_accumulated_days: 0,
            alpha_sanction_level: ALPHA_SANCTION_LEVEL.NONE,
            account_locked: false,
        };
    }

    const employeeCreatedDate = employeeData[0].created_at;

        // For disciplinary counts we consider only the current calendar year
        const yearStart = `${new Date().getFullYear()}-01-01`;
        const [attendanceRows] = await db.promise().query(
                `SELECT status, date
                 FROM attendance
                 WHERE employee_id = ?
                     AND date >= DATE(?)
                     AND date <= CURDATE()
                 ORDER BY date DESC`,
                [employeeId, yearStart]
        );

    const alphaAccumulatedDays = attendanceRows.reduce((total, row) => {
        return total + (row.status === "alpha" ? 1 : 0);
    }, 0);

    let alphaConsecutiveDays = 0;
    for (const row of attendanceRows) {
        if (row.status === "libur") {
            continue;
        }

        if (row.status === "alpha") {
            alphaConsecutiveDays += 1;
            continue;
        }

        break;
    }

    // compute late metrics used by some rules
    const lateAccumulatedDays = attendanceRows.reduce((total, row) => {
        const isLate = Number(row.late_minutes || 0) > 0 || Boolean(row.is_late);
        return total + (isLate ? 1 : 0);
    }, 0);

    let lateConsecutiveDays = 0;
    for (const row of attendanceRows) {
        const isLate = Number(row.late_minutes || 0) > 0 || Boolean(row.is_late);
        if (isLate) {
            lateConsecutiveDays += 1;
            continue;
        }
        break;
    }

    const sanctionResult = await getSanctionLevelFromAlphaCounts({
        alphaConsecutiveDays,
        alphaAccumulatedDays,
        lateConsecutiveDays,
        lateAccumulatedDays,
    });

    const sanctionLevel = sanctionResult && sanctionResult.level ? sanctionResult.level : ALPHA_SANCTION_LEVEL.NONE;
    const sanctionLabelFromRule = sanctionResult && sanctionResult.label ? String(sanctionResult.label).trim() : null;

    await db.promise().query(
        `UPDATE employees
         SET alpha_consecutive_days = ?,
             alpha_accumulated_days = ?,
             alpha_sanction_level = ?,
             alpha_last_evaluated_at = NOW(),
             updated_at = NOW()
         WHERE id = ?`,
        [
            alphaConsecutiveDays,
            alphaAccumulatedDays,
            sanctionLevel,
            employeeId,
        ]
    );

    return {
        alpha_consecutive_days: alphaConsecutiveDays,
        alpha_accumulated_days: alphaAccumulatedDays,
        late_consecutive_days: lateConsecutiveDays,
        late_accumulated_days: lateAccumulatedDays,
        alpha_sanction_level: sanctionLevel,
        alpha_sanction_label_from_rule: sanctionLabelFromRule,
        account_locked: false,
    };
};

const getMonthlyLatePenaltyStatus = async (employeeId, dateStr) => {
    const d = new Date(dateStr);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const threshold = 5;

    const [rows] = await db.promise().query(
        `SELECT COUNT(DISTINCT date) AS penalized_count
         FROM attendance
         WHERE employee_id = ?
           AND YEAR(date) = ?
           AND MONTH(date) = ?
           AND late_minutes > ?`,
        [employeeId, year, month, LATE_TOLERANCE_MINUTES]
    );

    const penalizedCount = Number(rows[0]?.penalized_count || 0);
    return {
        month,
        year,
        threshold,
        penalized_late_count: penalizedCount,
        salary_penalty_triggered: penalizedCount >= threshold,
        salary_penalty_units: Math.floor(penalizedCount / threshold),
    };
};

// ============================
// MULTER CONFIG (Leave attachment: bukti)
// ============================
const getLeaveUploadSubFolder = (leaveType) => {
    if (String(leaveType || "").startsWith("izin")) {
        return "izin";
    }

    return "cuti";
};

const leaveStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const subFolder = getLeaveUploadSubFolder(req.body?.leave_type);
        const targetDir = path.join(__dirname, `../uploads/${subFolder}`);

        fs.mkdirSync(targetDir, { recursive: true });

        req.leaveUploadSubFolder = subFolder;
        req.leaveUploadDir = null;

        cb(null, targetDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `leave-${uniqueSuffix}${ext}`);
    },
});

const leaveFileFilter = (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    return cb(new Error("Only PDF/JPG/PNG are allowed for bukti"));
};

const uploadLeave = multer({ storage: leaveStorage, fileFilter: leaveFileFilter });

// Function untuk get working hours berdasarkan employee
const getWorkingHoursByEmployee = async (employeeId) => {
    const [result] = await db
        .promise()
        .query(
            `SELECT wh.* FROM working_hours wh 
             INNER JOIN employees e ON e.working_hours_id = wh.id 
             WHERE e.id = ? LIMIT 1`,
            [employeeId]
        );

    if (result[0]) {
        return result[0];
    }

    const [defaultResult] = await db
        .promise()
        .query(
            `SELECT * FROM working_hours
             WHERE is_default = 1 AND deleted_at IS NULL
             ORDER BY id ASC
             LIMIT 1`
        );

    if (defaultResult[0]) {
        return defaultResult[0];
    }

    return (
        result[0] || {
            check_in_time: "08:00:00",
            check_out_time: "16:00:00",
            grace_period_minutes: 0,
        }
    );
};

// ============================
// CHECK IN
// ============================
// Pegawai melakukan check in
router.post(
    "/checkin",
    verifyToken,
    verifyRole(["pegawai"]),
    async (req, res) => {
        try {
            const userId = req.user.id;
            const today = formatDateOnly(new Date()); // Format: YYYY-MM-DD (local date)
            const checkInTime = new Date().toTimeString().split(" ")[0]; // Format: HH:MM:SS

            // Cari employee_id berdasarkan user_id
            const [employeeResult] = await db
                .promise()
                .query("SELECT id FROM employees WHERE user_id = ?", [userId]);

            if (employeeResult.length === 0) {
                return res.status(404).json({
                    message: "Employee record not found. Please contact HR.",
                });
            }

            const employeeId = employeeResult[0].id;
            const workingHours = await getWorkingHoursByEmployee(employeeId);
            const workingHoursWindow = getWorkingHoursWindow(workingHours);
            const approvedSpecialPermission = await getApprovedSpecialPermissionForDate(
                employeeId,
                today
            );

            // Also fetch any approved leave for today (used to detect half-day approvals)
            const [activeLeaveRows] = await db.promise().query(
                `SELECT id, leave_type, total_days, time, cuti_khusus_option
                 FROM leave_requests
                 WHERE employee_id = ?
                   AND status = 'approved'
                   AND ? BETWEEN start_date AND end_date
                 ORDER BY approved_at DESC, created_at DESC
                 LIMIT 1`,
                [employeeId, today]
            );

            const activeLeave = activeLeaveRows[0] || null;

            // Cek apakah sudah ada record attendance hari ini
            const [existingAttendance] = await db
                .promise()
                .query(
                    "SELECT * FROM attendance WHERE employee_id = ? AND date = ?",
                    [employeeId, today]
                );

            if (existingAttendance.length > 0) {
                // Jika status hari ini sudah cuti/izin/sakit/libur, check-in tidak diperbolehkan
                // Kecuali ada approved special permission atau approved half-day / izin_terlambat
                const isApprovedHalfDay = activeLeave && Number(activeLeave.total_days) > 0 && Number(activeLeave.total_days) < 1;
                const isApprovedIzinTerlambat = activeLeave && String(activeLeave.leave_type) === 'izin_terlambat';

                if (
                    ["izin", "sakit", "libur"].includes(existingAttendance[0].status) &&
                    !approvedSpecialPermission &&
                    !isApprovedHalfDay &&
                    !isApprovedIzinTerlambat
                ) {
                    return res.status(400).json({
                        message:
                            "Status absensi hari ini sudah cuti/izin/sakit/libur. Check-in tidak diperlukan.",
                        status: existingAttendance[0].status,
                        date: today,
                    });
                }

                // Jika sudah check-in hari ini
                if (existingAttendance[0].check_in) {
                    return res.status(400).json({
                        message: "You have already checked in today",
                        check_in: existingAttendance[0].check_in,
                        is_late: existingAttendance[0].is_late,
                        late_minutes: existingAttendance[0].late_minutes,
                    });
                }
            }

            const checkInStartSeconds = workingHoursWindow.check_in_seconds;
            const checkInCutoffSeconds = workingHoursWindow.check_out_seconds;
            const currentCheckInSeconds = timeStringToSeconds(checkInTime);

            if (isPublicHoliday(new Date())) {
                return res.status(400).json({
                    message: "Hari ini tanggal merah/libur. Check-in tidak diperlukan.",
                    status: "libur",
                    date: today,
                });
            }

            if (currentCheckInSeconds < checkInStartSeconds) {
                return res.status(400).json({
                    message: `Check-in hanya bisa dilakukan pada jam kerja ${workingHoursWindow.label}.`,
                    start_time: workingHoursWindow.check_in_time,
                    end_time: workingHoursWindow.check_out_time,
                    check_in_time: checkInTime,
                });
            }

            if (currentCheckInSeconds > checkInCutoffSeconds) {
                return res.status(400).json({
                    message: `Check-in hanya bisa dilakukan pada jam kerja ${workingHoursWindow.label}.`,
                    cutoff_time: workingHoursWindow.check_out_time,
                    check_in_time: checkInTime,
                });
            }

            // Aturan telat berdasarkan jam kerja dari working_hours,
            // atau jam izin terlambat yang sudah di-approve pada tanggal yang sama.
            // Aturan telat berdasarkan jam kerja dari working_hours,
            // atau jam izin terlambat / cuti_khusus (terlambat) yang sudah di-approve pada tanggal yang sama.
            const approvedTimeFromLeave =
                (approvedSpecialPermission && approvedSpecialPermission.time) ||
                (activeLeave && activeLeave.time);

            const isLeaveTerlambat =
                (approvedSpecialPermission && approvedSpecialPermission.cuti_khusus_option === "terlambat") ||
                (activeLeave && String(activeLeave.cuti_khusus_option) === "terlambat") ||
                (activeLeave && String(activeLeave.leave_type) === 'izin_terlambat');

            const lateThresholdTime = approvedTimeFromLeave && isLeaveTerlambat
                ? approvedTimeFromLeave
                : workingHoursWindow.check_in_time;
            const latePolicy = getLatePolicy(
                calculateLateMinutes(checkInTime, lateThresholdTime)
            );
            const lateMinutes = latePolicy.late_minutes;
            const isLate = latePolicy.is_penalized_late;

            // Insert atau update attendance record
            if (existingAttendance.length === 0) {
                // Buat record baru
                await db.promise().query(
                    `INSERT INTO attendance (employee_id, date, check_in, status, is_late, late_minutes, created_at) 
                 VALUES (?, ?, ?, 'hadir', ?, ?, NOW())`,
                    [
                        employeeId,
                        today,
                        checkInTime,
                        isLate ? 1 : 0,
                        lateMinutes,
                    ]
                );
            } else {
                // Update record yang sudah ada
                await db.promise().query(
                    `UPDATE attendance SET check_in = ?, status = 'hadir', is_late = ?, late_minutes = ?
                 WHERE employee_id = ? AND date = ?`,
                    [
                        checkInTime,
                        isLate ? 1 : 0,
                        lateMinutes,
                        employeeId,
                        today,
                    ]
                );
            }

            await evaluateAlphaDisciplineForEmployee(employeeId);
            const monthlyLatePenaltyStatus = await getMonthlyLatePenaltyStatus(
                employeeId,
                today
            );
            // Log activity: check-in
            try {
                const username = req.user.username || req.user.name || null;
                const role = Array.isArray(req.user.roles)
                    ? req.user.roles[0]
                    : req.user.role || null;
                const action = existingAttendance.length === 0 ? "CREATE" : "UPDATE";

                await logActivity({
                    userId,
                    username,
                    role,
                    action,
                    module: "attendance",
                    description: action === "CREATE" ? "Check-in" : "Check-in (update)",
                    oldValues: existingAttendance.length === 0 ? null : existingAttendance[0],
                    newValues: { date: today, check_in: checkInTime, employee_id: employeeId },
                    ipAddress: getIpAddress(req),
                    userAgent: getUserAgent(req),
                    status: "success",
                });
            } catch (e) {
                console.error("Failed to log check-in activity:", e);
            }

            res.status(200).json({
                message: isLate
                    ? "Check-in successful but LATE"
                    : "Check-in successful",
                employee_id: employeeId,
                date: today,
                check_in: checkInTime,
                is_late: isLate,
                late_minutes: lateMinutes,
                standard_check_in: workingHoursWindow.check_in_time,
                standard_check_out: workingHoursWindow.check_out_time,
                working_hours_schedule: workingHours,
                is_tolerated_late: latePolicy.is_tolerated_late,
                is_penalized_late: latePolicy.is_penalized_late,
                late_penalty_days: latePolicy.late_penalty_days,
                monthly_late_penalty: monthlyLatePenaltyStatus,
            });
        } catch (error) {
            console.error(error);
            try {
                await logActivity({
                    userId: req.user?.id || null,
                    username: req.user?.username || req.user?.name || null,
                    role: Array.isArray(req.user?.roles) ? req.user.roles[0] : req.user?.role || null,
                    action: "CREATE",
                    module: "attendance",
                    description: "Check-in failed",
                    errorMessage: error.message,
                    ipAddress: getIpAddress(req),
                    userAgent: getUserAgent(req),
                    status: "failed",
                });
            } catch (e) {
                console.error("Failed to log failed check-in activity:", e);
            }

            res.status(error.statusCode || 500).json({
                message: error.message || "Server error",
            });
        }
    }
);

// ============================
// CHECK OUT
// ============================
// Pegawai melakukan check out
router.post(
    "/checkout",
    verifyToken,
    verifyRole(["pegawai"]),
    async (req, res) => {
        try {
            const userId = req.user.id;
            const today = formatDateOnly(new Date());
            const checkOutTime = new Date().toTimeString().split(" ")[0];

            // Cari employee_id berdasarkan user_id
            const [employeeResult] = await db
                .promise()
                .query("SELECT id FROM employees WHERE user_id = ?", [userId]);

            if (employeeResult.length === 0) {
                return res.status(404).json({
                    message: "Employee record not found. Please contact HR.",
                });
            }

            const employeeId = employeeResult[0].id;
            const workingHours = await getWorkingHoursByEmployee(employeeId);
            const workingHoursWindow = getWorkingHoursWindow(workingHours);
            const approvedSpecialPermission = await getApprovedSpecialPermissionForDate(
                employeeId,
                today
            );
            // Cek apakah sudah ada record attendance hari ini
            const [existingAttendance] = await db
                .promise()
                .query(
                    "SELECT * FROM attendance WHERE employee_id = ? AND date = ?",
                    [employeeId, today]
                );

            if (existingAttendance.length === 0) {
                if (isPublicHoliday(new Date())) {
                    return res.status(400).json({
                        message:
                            "Hari ini tanggal merah/libur. Check-out tidak diperlukan.",
                        status: "libur",
                        date: today,
                    });
                }

                return res.status(400).json({
                    message:
                        "No check-in record found for today. Please check in first.",
                });
            }

            // Cek apakah sudah check-in
            if (!existingAttendance[0].check_in) {
                if (["izin", "sakit", "libur"].includes(existingAttendance[0].status)) {
                    return res.status(400).json({
                        message:
                            "Status absensi hari ini sudah cuti/izin/sakit/libur. Check-out tidak diperlukan.",
                        status: existingAttendance[0].status,
                        date: today,
                    });
                }

                return res.status(400).json({
                    message: "Please check in first before checking out.",
                });
            }

            // Cek apakah sudah check-out
            if (existingAttendance[0].check_out) {
                return res.status(400).json({
                    message: "You have already checked out today",
                    check_out: existingAttendance[0].check_out,
                });
            }

            const checkOutStartSeconds =
                approvedSpecialPermission &&
                approvedSpecialPermission.cuti_khusus_option === "pulang_cepat" &&
                approvedSpecialPermission.time
                    ? timeStringToSeconds(approvedSpecialPermission.time)
                    : workingHoursWindow.check_in_seconds;
            const checkOutEndSeconds = workingHoursWindow.check_out_seconds;
            const currentCheckOutSeconds = timeStringToSeconds(checkOutTime);
            if (
                currentCheckOutSeconds < checkOutStartSeconds ||
                currentCheckOutSeconds > checkOutEndSeconds
            ) {
                return res.status(400).json({
                    message: `Check-out hanya bisa dilakukan pada jam kerja ${workingHoursWindow.label}.`,
                    start_time: workingHoursWindow.check_in_time,
                    end_time: workingHoursWindow.check_out_time,
                    check_out_time: checkOutTime,
                });
            }

            // Calculate working hours & overtime hours
            const checkInSeconds = timeStringToSeconds(
                existingAttendance[0].check_in
            );
            const checkOutSeconds = timeStringToSeconds(checkOutTime);
            const standardWorkingDurationSeconds = Math.max(
                0,
                checkOutEndSeconds - checkOutStartSeconds
            );

            let workingDurationSeconds = checkOutSeconds - checkInSeconds;
            if (workingDurationSeconds < 0) {
                workingDurationSeconds += 24 * 3600;
            }

            let overtimeDurationSeconds =
                workingDurationSeconds - standardWorkingDurationSeconds;
            if (overtimeDurationSeconds < 0) {
                overtimeDurationSeconds = 0;
            }

            const workingHoursDecimal = secondsToHoursDecimal(
                workingDurationSeconds
            );
            const overtimeHoursDecimal = secondsToHoursDecimal(
                overtimeDurationSeconds
            );

            // Update check_out, working_hours, overtime_hours
            await db
                .promise()
                .query(
                    "UPDATE attendance SET check_out = ?, working_hours = ?, overtime_hours = ? WHERE employee_id = ? AND date = ?",
                    [
                        checkOutTime,
                        workingHoursDecimal,
                        overtimeHoursDecimal,
                        employeeId,
                        today,
                    ]
                );
            // Log activity: check-out
            try {
                const username = req.user.username || req.user.name || null;
                const role = Array.isArray(req.user.roles)
                    ? req.user.roles[0]
                    : req.user.role || null;

                await logActivity({
                    userId,
                    username,
                    role,
                    action: "UPDATE",
                    module: "attendance",
                    description: "Check-out",
                    oldValues: existingAttendance[0],
                    newValues: {
                        date: today,
                        check_out: checkOutTime,
                        working_hours: workingHoursDecimal,
                        overtime_hours: overtimeHoursDecimal,
                    },
                    ipAddress: getIpAddress(req),
                    userAgent: getUserAgent(req),
                    status: "success",
                });
            } catch (e) {
                console.error("Failed to log check-out activity:", e);
            }

            res.status(200).json({
                message: "Check-out successful",
                employee_id: employeeId,
                date: today,
                check_in: existingAttendance[0].check_in,
                check_out: checkOutTime,
                is_late: existingAttendance[0].is_late,
                late_minutes: existingAttendance[0].late_minutes,
                working_hours: workingHoursDecimal,
                overtime_hours: overtimeHoursDecimal,
                standard_check_in: workingHoursWindow.check_in_time,
                standard_check_out: workingHoursWindow.check_out_time,
                working_hours_schedule: workingHours,
            });
        } catch (error) {
            console.error(error);
            try {
                await logActivity({
                    userId: req.user?.id || null,
                    username: req.user?.username || req.user?.name || null,
                    role: Array.isArray(req.user?.roles) ? req.user.roles[0] : req.user?.role || null,
                    action: "UPDATE",
                    module: "attendance",
                    description: "Check-out failed",
                    errorMessage: error.message,
                    ipAddress: getIpAddress(req),
                    userAgent: getUserAgent(req),
                    status: "failed",
                });
            } catch (e) {
                console.error("Failed to log failed check-out activity:", e);
            }

            res.status(error.statusCode || 500).json({
                message: error.message || "Server error",
            });
        }
    }
);

// ============================
// GET TODAY'S ATTENDANCE STATUS
// ============================
// Cek status absensi hari ini
router.get("/today", verifyToken, verifyRole(["pegawai"]), async (req, res) => {
    try {
        const userId = req.user.id;
        const today = formatDateOnly(new Date());

        // Cari employee_id berdasarkan user_id
        const [employeeResult] = await db
            .promise()
            .query("SELECT id FROM employees WHERE user_id = ?", [userId]);

        if (employeeResult.length === 0) {
            return res.status(404).json({
                message: "Employee record not found. Please contact HR.",
            });
        }

        const employeeId = employeeResult[0].id;
        const workingHours = await getWorkingHoursByEmployee(employeeId);
        const workingHoursWindow = getWorkingHoursWindow(workingHours);
        const approvedSpecialPermission = await getApprovedSpecialPermissionForDate(
            employeeId,
            today
        );

        const specialPermissionPayload = approvedSpecialPermission
            ? {
                  id: approvedSpecialPermission.id,
                  leave_type: approvedSpecialPermission.leave_type,
                  cuti_khusus_option: approvedSpecialPermission.cuti_khusus_option,
                  time: approvedSpecialPermission.time,
              }
            : null;

        // Ambil data attendance hari ini
        const [attendanceResult] = await db
            .promise()
            .query(
                "SELECT * FROM attendance WHERE employee_id = ? AND date = ?",
                [employeeId, today]
            );

        if (attendanceResult.length === 0) {
            if (isPublicHoliday(new Date())) {
                return res.status(200).json({
                    message: "Attendance status for today from holiday",
                    date: today,
                    check_in: null,
                    check_out: null,
                    status: "libur",
                    can_attendance: false,
                    approved_special_permission: null,
                    is_late: false,
                    late_minutes: 0,
                    working_hours: null,
                    overtime_hours: null,
                    is_tolerated_late: false,
                    is_penalized_late: false,
                    late_penalty_days: 0,
                    standard_check_in: workingHoursWindow.check_in_time,
                    standard_check_out: workingHoursWindow.check_out_time,
                    working_hours_schedule: workingHours,
                });
            }

            const [activeLeaveResult] = await db
                .promise()
                .query(
                    `SELECT id, leave_type, total_days, time, cuti_khusus_option
                     FROM leave_requests
                     WHERE employee_id = ?
                       AND status = 'approved'
                       AND ? BETWEEN start_date AND end_date
                     ORDER BY approved_at DESC, created_at DESC
                     LIMIT 1`,
                    [employeeId, today]
                );

            if (activeLeaveResult.length > 0) {
                const leaveRow = activeLeaveResult[0];
                const leaveStatus = mapLeaveTypeToAttendanceStatus(leaveRow.leave_type);

                // Allow attendance when there is an approved special permission,
                // or when the approved leave is a half-day (total_days < 1),
                // or when leave_type is 'izin_terlambat'.
                const isApprovedHalfDay = leaveRow.total_days && Number(leaveRow.total_days) > 0 && Number(leaveRow.total_days) < 1;
                const isIzinTerlambat = String(leaveRow.leave_type) === 'izin_terlambat';
                const canAttendance = Boolean(approvedSpecialPermission) || isApprovedHalfDay || isIzinTerlambat;

                const specialTime = (approvedSpecialPermission && approvedSpecialPermission.time) || leaveRow.time || null;
                const cutiOption = (approvedSpecialPermission && approvedSpecialPermission.cuti_khusus_option) || leaveRow.cuti_khusus_option || null;

                return res.status(200).json({
                    message: "Attendance status for today from approved leave",
                    date: today,
                    check_in: null,
                    check_out: null,
                    status: leaveStatus,
                    leave_type: leaveRow.leave_type,
                    cuti_khusus_option: cutiOption,
                    special_permission_time: specialTime,
                    can_attendance: canAttendance,
                    approved_special_permission: specialPermissionPayload,
                    is_late: false,
                    late_minutes: 0,
                    working_hours: null,
                    overtime_hours: null,
                    is_tolerated_late: false,
                    is_penalized_late: false,
                    late_penalty_days: 0,
                    standard_check_in: workingHoursWindow.check_in_time,
                    standard_check_out: workingHoursWindow.check_out_time,
                    working_hours_schedule: workingHours,
                });
            }

            return res.status(200).json({
                message: "No attendance record for today",
                date: today,
                check_in: null,
                check_out: null,
                status: null,
                can_attendance: false,
                approved_special_permission: specialPermissionPayload,
                is_late: false,
                late_minutes: 0,
                working_hours: null,
                overtime_hours: null,
                standard_check_in: workingHoursWindow.check_in_time,
                standard_check_out: workingHoursWindow.check_out_time,
                working_hours_schedule: workingHours,
            });
        }

        const attendance = attendanceResult[0];
        const latePolicy = getLatePolicy(attendance.late_minutes);
        res.status(200).json({
            message: "Attendance status for today",
            date: attendance.date,
            check_in: attendance.check_in,
            check_out: attendance.check_out,
            status: attendance.status,
            can_attendance: Boolean(approvedSpecialPermission),
            approved_special_permission: specialPermissionPayload,
            leave_type: approvedSpecialPermission?.leave_type || null,
            cuti_khusus_option: approvedSpecialPermission?.cuti_khusus_option || null,
            special_permission_time: approvedSpecialPermission?.time || null,
            is_late: attendance.is_late,
            late_minutes: attendance.late_minutes,
            working_hours: attendance.working_hours,
            overtime_hours: attendance.overtime_hours,
            is_tolerated_late: latePolicy.is_tolerated_late,
            is_penalized_late: latePolicy.is_penalized_late,
            late_penalty_days: latePolicy.late_penalty_days,
            standard_check_in: workingHoursWindow.check_in_time,
            standard_check_out: workingHoursWindow.check_out_time,
            working_hours_schedule: workingHours,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// ============================
// GET MY ATTENDANCE HISTORY
// ============================
// Pegawai melihat riwayat absensi sendiri
router.get(
    "/my-history",
    verifyToken,
    verifyRole(["pegawai"]),
    async (req, res) => {
        try {
            const userId = req.user.id;
            const { month, year, status, limit = 30 } = req.query;

            // Cari employee_id berdasarkan user_id
            const [employeeResult] = await db
                .promise()
                .query("SELECT id FROM employees WHERE user_id = ?", [userId]);

            if (employeeResult.length === 0) {
                return res.status(404).json({
                    message: "Employee record not found. Please contact HR.",
                });
            }

            const employeeId = employeeResult[0].id;

            // Auto-generate alpha untuk hari kerja yang belum punya record
            await ensureAlphaAttendanceRecords(employeeId, month, year);

            // Build query dengan filter optional
            let query = "SELECT * FROM attendance WHERE employee_id = ?";
            const params = [employeeId];

            if (month && year) {
                query += " AND MONTH(date) = ? AND YEAR(date) = ?";
                params.push(month, year);
            }

            const validStatuses = ["hadir", "izin", "sakit", "alpha", "libur"];
            if (status && validStatuses.includes(String(status).toLowerCase())) {
                query += " AND status = ?";
                params.push(String(status).toLowerCase());
            }

            query += " ORDER BY date DESC LIMIT ?";
            params.push(parseInt(limit));

            const [attendanceHistory] = await db.promise().query(query, params);

            res.status(200).json({
                message: "Attendance history retrieved successfully",
                total: attendanceHistory.length,
                data: attendanceHistory,
            });
        } catch (error) {
            console.error(error);
            res.status(error.statusCode || 500).json({
                message: error.message || "Server error",
            });
        }
    }
);

// ============================
// GET ATTENDANCE SUMMARY (Late & Absent Days)
// ============================
// Ringkasan absensi - hari terlambat, tidak hadir, dll
router.get(
    "/my-summary",
    verifyToken,
    verifyRole(["pegawai"]),
    async (req, res) => {
        try {
            const userId = req.user.id;
            const { month, year } = req.query;

            // Cari employee_id berdasarkan user_id
            const [employeeResult] = await db
                .promise()
                .query("SELECT id FROM employees WHERE user_id = ?", [userId]);

            if (employeeResult.length === 0) {
                return res.status(404).json({
                    message: "Employee record not found. Please contact HR.",
                });
            }

            const employeeId = employeeResult[0].id;

            // Pastikan alpha otomatis tercatat sebelum summary dihitung
            await ensureAlphaAttendanceRecords(employeeId, month, year);

            // Build query dengan filter optional
            let query = `
                SELECT 
                    COUNT(DISTINCT date) as total_days,
                    COUNT(DISTINCT CASE WHEN late_minutes > 0 AND late_minutes <= 60 THEN date END) as tolerated_late_days,
                    COUNT(DISTINCT CASE WHEN late_minutes > 60 THEN date END) as late_days,
                    (COUNT(DISTINCT CASE WHEN late_minutes > 60 THEN date END) * 0.5) as late_penalty_days,
                    COUNT(DISTINCT CASE WHEN status = 'alpha' THEN date END) as absent_days,
                    COUNT(DISTINCT CASE WHEN status = 'hadir' THEN date END) as present_days,
                    COUNT(DISTINCT CASE WHEN status IN ('izin', 'cuti') THEN date END) as permission_days,
                    COUNT(DISTINCT CASE WHEN status = 'sakit' THEN date END) as sick_days,
                    COUNT(DISTINCT CASE WHEN status = 'libur' THEN date END) as holiday_days,
                    SUM(late_minutes) as total_late_minutes,
                    AVG(working_hours) as avg_working_hours,
                    SUM(COALESCE(overtime_hours, 0)) as total_overtime_hours,
                    AVG(COALESCE(overtime_hours, 0)) as avg_overtime_hours
                FROM attendance 
                WHERE employee_id = ? AND date >= (SELECT DATE(created_at) FROM employees WHERE id = ?)`;
            const params = [employeeId, employeeId];

            if (month && year) {
                query += " AND MONTH(date) = ? AND YEAR(date) = ?";
                params.push(month, year);
            }

            const [summary] = await db.promise().query(query, params);

            const summaryData = summary[0] || {};
            const alphaDays = Number(summaryData.absent_days || 0);
            const lateDays = Number(summaryData.late_days || 0);
            const latePenaltyDays = Number(summaryData.late_penalty_days || 0);
            const salaryPenaltyThreshold = 5;
            const disciplineSnapshot = await evaluateAlphaDisciplineForEmployee(
                employeeId
            );

            // Generate label and badge dynamically so backend handles new levels (e.g., sp4)
            const makeLabel = (lvl) => {
                const raw = String(lvl || "").trim();
                if (!raw || raw.toLowerCase() === "none") return "Belum Ada SP";
                const spMatch = raw.match(/^\s*sp\s*[-_]?\s*(\d+)\s*$/i);
                if (spMatch) return `SP${spMatch[1]}`;
                return raw.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
            };

            const makeBadge = (lvl) => {
                const m = String(lvl || "").toLowerCase();
                if (!m || m === "none") return "badge-ghost";
                const palette = ["badge-info", "badge-warning", "badge-error", "badge-secondary", "badge-success", "badge-neutral", "badge-ghost"];
                let hash = 0;
                for (let i = 0; i < m.length; i++) hash = (hash << 5) - hash + m.charCodeAt(i);
                return palette[Math.abs(hash) % palette.length];
            };

            const finalLabel = disciplineSnapshot.alpha_sanction_label_from_rule
                ? String(disciplineSnapshot.alpha_sanction_label_from_rule)
                : makeLabel(disciplineSnapshot.alpha_sanction_level);

            const disciplineWithLabel = {
                ...disciplineSnapshot,
                alpha_sanction_label: finalLabel,
                alpha_sanction_badge: disciplineSnapshot.alpha_sanction_badge || makeBadge(disciplineSnapshot.alpha_sanction_level),
            };

            res.status(200).json({
                message: "Attendance summary retrieved successfully",
                period: month && year ? `${month}/${year}` : "all",
                data: {
                    ...summaryData,
                    alpha_days: alphaDays,
                    effective_absent_days: Number(
                        (alphaDays + latePenaltyDays).toFixed(1)
                    ),
                    salary_penalty_threshold: salaryPenaltyThreshold,
                    salary_penalty_triggered: lateDays >= salaryPenaltyThreshold,
                    salary_penalty_units: Math.floor(
                        lateDays / salaryPenaltyThreshold
                    ),
                    alpha_discipline: disciplineWithLabel,
                },
            });
        } catch (error) {
            console.error(error);
            res.status(error.statusCode || 500).json({
                message: error.message || "Server error",
            });
        }
    }
);

// ============================
// GET ALL EMPLOYEES ATTENDANCE (HR/Atasan/Finance)
// ============================
// HR, Atasan, atau Finance melihat absensi semua pegawai
router.get(
    "/all",
    verifyToken,
    verifyRole(["hr", "atasan", "finance"]),
    async (req, res) => {
        try {
            const { date, month, year, employee_id } = req.query;
            let managerScope = null;

            if (shouldScopeAsAtasan(req)) {
                managerScope = await resolveManagerScope(db, req.user.id);
            }

            let query = `
            SELECT a.*, e.employee_code, u.name as employee_name, p.department_id
            FROM attendance a
            JOIN employees e ON a.employee_id = e.id
            JOIN positions p ON e.position_id = p.id
            JOIN users u ON e.user_id = u.id
            WHERE 1=1
        `;
            const params = [];

            if (date) {
                query += " AND a.date = ?";
                params.push(date);
            }

            if (month && year) {
                query += " AND MONTH(a.date) = ? AND YEAR(a.date) = ?";
                params.push(month, year);
            }

            if (employee_id) {
                query += " AND a.employee_id = ?";
                params.push(employee_id);
            }

            if (managerScope) {
                if (managerScope.isDirector) {
                    query += " AND p.level = 'manager' AND e.id <> ?";
                    params.push(managerScope.managerEmployeeId);
                } else {
                    query += " AND p.department_id = ? AND e.id <> ?";
                    params.push(
                        managerScope.departmentId,
                        managerScope.managerEmployeeId
                    );
                }
            }

            query += " ORDER BY a.date DESC, u.name ASC";

            const [attendanceData] = await db.promise().query(query, params);

            res.status(200).json({
                message: "Attendance data retrieved successfully",
                total: attendanceData.length,
                data: attendanceData,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

// ============================
// GET TEAM MEMBERS (HR/Atasan/Finance)
// ============================
router.get(
    "/team-members",
    verifyToken,
    verifyRole(["hr", "atasan", "finance"]),
    async (req, res) => {
        try {
            let managerScope = null;

            if (shouldScopeAsAtasan(req)) {
                managerScope = await resolveManagerScope(db, req.user.id);
            }

            let query = `
                SELECT e.id as employee_id, e.employee_code, u.name as employee_name, p.department_id, p.name as position_name, p.level as level
                FROM employees e
                JOIN positions p ON e.position_id = p.id
                JOIN users u ON e.user_id = u.id
                WHERE 1=1
            `;
            const params = [];

            if (managerScope) {
                if (managerScope.isDirector) {
                    query += " AND p.level = 'manager' AND e.id <> ?";
                    params.push(managerScope.managerEmployeeId);
                } else {
                    query += " AND p.department_id = ? AND e.id <> ?";
                    params.push(
                        managerScope.departmentId,
                        managerScope.managerEmployeeId
                    );
                }
            }

            query += " ORDER BY u.name ASC";

            const [teamMembers] = await db.promise().query(query, params);

            res.status(200).json({
                message: "Team members retrieved successfully",
                total: teamMembers.length,
                data: teamMembers,
            });
        } catch (error) {
            console.error(error);
            res.status(error.statusCode || 500).json({
                message: error.message || "Server error",
            });
        }
    }
);

// ============================
// GET ATTENDANCE SUMMARY FOR ALL EMPLOYEES (HR/Finance)
// ============================
// Ringkasan absensi semua pegawai per bulan
router.get(
    "/summary/all",
    verifyToken,
    verifyRole(["hr", "finance"]),
    async (req, res) => {
        try {
            const { month, year } = req.query;

            // Pastikan hari kerja yang belum memiliki absensi ditandai alpha
            // agar ringkasan payroll finance akurat (terutama untuk alpha/present).
            if (month && year) {
                const [employees] = await db
                    .promise()
                    .query("SELECT id FROM employees");

                for (const employee of employees) {
                    await ensureAlphaAttendanceRecords(
                        employee.id,
                        Number(month),
                        Number(year)
                    );
                }
            }

            let query = `
                SELECT 
                    e.id as employee_id,
                    e.employee_code,
                    u.name as employee_name,
                    e.alpha_consecutive_days,
                    e.alpha_accumulated_days,
                    e.alpha_sanction_level,
                    e.alpha_last_evaluated_at,
                    COUNT(DISTINCT a.date) as total_days,
                    COUNT(DISTINCT CASE WHEN a.late_minutes > 0 AND a.late_minutes <= 60 THEN a.date END) as tolerated_late_days,
                    COUNT(DISTINCT CASE WHEN a.late_minutes > 60 THEN a.date END) as late_days,
                    (COUNT(DISTINCT CASE WHEN a.late_minutes > 60 THEN a.date END) * 0.5) as late_penalty_days,
                    COUNT(DISTINCT CASE WHEN a.status = 'alpha' THEN a.date END) as absent_days,
                    COUNT(DISTINCT CASE WHEN a.status = 'hadir' THEN a.date END) as present_days,
                    COUNT(DISTINCT CASE WHEN a.status IN ('izin', 'cuti') THEN a.date END) as permission_days,
                    COUNT(DISTINCT CASE WHEN a.status = 'sakit' THEN a.date END) as sick_days,
                    COUNT(DISTINCT CASE WHEN a.status = 'libur' THEN a.date END) as holiday_days,
                    ${month && year ? `COALESCE((
                        SELECT SUM(
                            GREATEST(
                                DATEDIFF(
                                    LEAST(lr.end_date, ?),
                                    GREATEST(lr.start_date, ?)
                                ) + 1,
                                0
                            )
                        )
                        FROM leave_requests lr
                        LEFT JOIN leave_request_settings lrs ON lrs.leave_type = lr.leave_type
                        WHERE lr.employee_id = e.id
                          AND lr.status = 'approved'
                          AND lr.end_date >= ?
                          AND lr.start_date <= ?
                          AND (
                               COALESCE(JSON_UNQUOTE(JSON_EXTRACT(lrs.meta, '$.paid')), '') = '0'
                               OR (lrs.leave_type IS NULL AND lr.leave_type IN ('cuti_lainnya', 'izin_lainnya', 'izin_pribadi'))
                          )
                    ), 0) as unpaid_leave_days,` : `0 as unpaid_leave_days,`}
                    SUM(COALESCE(a.late_minutes, 0)) as total_late_minutes,
                    AVG(a.working_hours) as avg_working_hours,
                    SUM(COALESCE(a.overtime_hours, 0)) as total_overtime_hours,
                    AVG(COALESCE(a.overtime_hours, 0)) as avg_overtime_hours
                FROM employees e
                JOIN users u ON e.user_id = u.id
                LEFT JOIN attendance a ON a.employee_id = e.id`;

            const params = [];

            if (month && year) {
                query += " AND MONTH(a.date) = ? AND YEAR(a.date) = ?";
                const periodStart = `${year}-${String(month).padStart(2, "0")}-01`;
                const periodEndDate = new Date(Number(year), Number(month), 0);
                const periodEnd = `${periodEndDate.getFullYear()}-${String(
                    periodEndDate.getMonth() + 1
                ).padStart(2, "0")}-${String(periodEndDate.getDate()).padStart(2, "0")}`;
                params.push(periodEnd, periodStart, periodStart, periodEnd, month, year);
            }

            query +=
                " GROUP BY e.id, e.employee_code, u.name ORDER BY u.name ASC";

            const [summaryData] = await db.promise().query(query, params);

            const mappedSummaryData = summaryData.map((row) => {
                const alphaDays = Number(row.absent_days || 0);
                const unpaidLeaveDays = Number(row.unpaid_leave_days || 0);
                const lateDays = Number(row.late_days || 0);
                const latePenaltyDays = Number(row.late_penalty_days || 0);
                const salaryPenaltyThreshold = 5;
                return {
                    ...row,
                    alpha_days: alphaDays,
                    unpaid_leave_days: unpaidLeaveDays,
                    effective_absent_days: Number(
                        (alphaDays + unpaidLeaveDays + latePenaltyDays).toFixed(1)
                    ),
                    salary_penalty_threshold: salaryPenaltyThreshold,
                    salary_penalty_triggered: lateDays >= salaryPenaltyThreshold,
                    salary_penalty_units: Math.floor(
                        lateDays / salaryPenaltyThreshold
                    ),
                };
            });

            res.status(200).json({
                message:
                    "Attendance summary for all employees retrieved successfully",
                period: month && year ? `${month}/${year}` : "all",
                total_employees: mappedSummaryData.length,
                data: mappedSummaryData,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

// ============================
// UPDATE ATTENDANCE STATUS (HR/Atasan/Finance)
// ============================
// HR, Atasan, atau Finance mengubah status absensi (misal: izin, sakit, alpha)
router.put(
    "/:id/status",
    verifyToken,
    verifyRole(["hr", "atasan", "finance"]),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            let managerScope = null;

            if (shouldScopeAsAtasan(req)) {
                managerScope = await resolveManagerScope(db, req.user.id);
            }

            const validStatuses = ["hadir", "izin", "sakit", "alpha", "libur"];
            if (!status || !validStatuses.includes(status)) {
                return res.status(400).json({
                    message:
                        "Invalid status. Valid statuses: hadir, izin, sakit, alpha, libur",
                });
            }

            // Cek apakah attendance record ada
            const [existingAttendance] = await db
                .promise()
                .query("SELECT * FROM attendance WHERE id = ?", [id]);

            if (existingAttendance.length === 0) {
                return res
                    .status(404)
                    .json({ message: "Attendance record not found" });
            }

            if (managerScope) {
                let attendanceDeptClause = 'p.department_id = ? AND e.id <> ?';
                const attendanceParams = [managerScope.departmentId, managerScope.managerEmployeeId];
                if (managerScope.isDirector) {
                    attendanceDeptClause = "p.level = 'manager' AND e.id <> ?";
                    attendanceParams.splice(0, attendanceParams.length, managerScope.managerEmployeeId);
                }

                const [attendanceScope] = await db.promise().query(
                    `SELECT a.id
                     FROM attendance a
                     JOIN employees e ON a.employee_id = e.id
                     JOIN positions p ON e.position_id = p.id
                     WHERE a.id = ?
                       AND ${attendanceDeptClause}`,
                    [id, ...attendanceParams]
                );

                if (!attendanceScope.length) {
                    return res.status(403).json({
                        message:
                            managerScope.isDirector
                                ? "Direktur dapat mengubah status absensi tim manajer."
                                : "Atasan hanya dapat mengubah status absensi tim dalam departemen yang dipimpin",
                    });
                }
            }

            if (status === "alpha" && !existingAttendance[0].check_in) {
                return res.status(400).json({
                    message:
                        "Status alpha tidak bisa diberikan karena belum ada check-in.",
                });
            }

            const isAdminOrAtasanUpdatingHadir =
                (shouldScopeAsAtasan(req) || (req.user.roles || []).includes("admin")) && status === "hadir";

            if (isAdminOrAtasanUpdatingHadir) {
                const attendanceWorkingHours = await getWorkingHoursByEmployee(
                    existingAttendance[0].employee_id
                );
                const attendanceWorkingHoursWindow = getWorkingHoursWindow(
                    attendanceWorkingHours
                );
                const standardWorkingDurationSeconds = Math.max(
                    0,
                    attendanceWorkingHoursWindow.check_out_seconds -
                        attendanceWorkingHoursWindow.check_in_seconds
                );

                const recordDate = new Date(existingAttendance[0].date);
                recordDate.setHours(0, 0, 0, 0);

                const todayDate = new Date();
                todayDate.setHours(0, 0, 0, 0);

                const isTodayRecord =
                    recordDate.getTime() === todayDate.getTime();
                const isPastRecord =
                    recordDate.getTime() < todayDate.getTime();

                if (isPastRecord) {
                    await db.promise().query(
                        `UPDATE attendance
                         SET status = ?,
                             check_in = ?,
                             check_out = ?,
                             working_hours = ?,
                             overtime_hours = ?,
                             is_late = ?,
                             late_minutes = ?
                         WHERE id = ?`,
                        [
                            status,
                            attendanceWorkingHoursWindow.check_in_time,
                            attendanceWorkingHoursWindow.check_out_time,
                            secondsToHoursDecimal(standardWorkingDurationSeconds),
                            0,
                            0,
                            0,
                            id,
                        ]
                    );
                } else if (isTodayRecord) {
                    await db.promise().query(
                        `UPDATE attendance
                         SET status = ?,
                             check_in = ?,
                             check_out = NULL,
                             working_hours = NULL,
                             overtime_hours = NULL,
                             is_late = ?,
                             late_minutes = ?
                         WHERE id = ?`,
                        [status, attendanceWorkingHoursWindow.check_in_time, 0, 0, id]
                    );
                } else {
                    await db
                        .promise()
                        .query("UPDATE attendance SET status = ? WHERE id = ?", [
                            status,
                            id,
                        ]);
                }
            } else {
                await db
                    .promise()
                    .query("UPDATE attendance SET status = ? WHERE id = ?", [
                        status,
                        id,
                    ]);
            }

            await evaluateAlphaDisciplineForEmployee(
                existingAttendance[0].employee_id
            );

            // Log activity: update attendance status by admin/atasan/hr/finance
            try {
                const username = req.user.username || req.user.name || null;
                const role = Array.isArray(req.user.roles)
                    ? req.user.roles[0]
                    : req.user.role || null;

                await logActivity({
                    userId: req.user.id,
                    username,
                    role,
                    action: "UPDATE",
                    module: "attendance",
                    description: `Attendance status updated to ${status}`,
                    oldValues: existingAttendance[0],
                    newValues: { id, status },
                    ipAddress: getIpAddress(req),
                    userAgent: getUserAgent(req),
                    status: "success",
                });
            } catch (e) {
                console.error("Failed to log attendance status update:", e);
            }

            res.status(200).json({
                message: "Attendance status updated successfully",
                id: id,
                status: status,
            });
        } catch (error) {
            console.error(error);
            try {
                await logActivity({
                    userId: req.user?.id || null,
                    username: req.user?.username || req.user?.name || null,
                    role: Array.isArray(req.user?.roles) ? req.user.roles[0] : req.user?.role || null,
                    action: "UPDATE",
                    module: "attendance",
                    description: "Attendance status update failed",
                    errorMessage: error.message,
                    ipAddress: getIpAddress(req),
                    userAgent: getUserAgent(req),
                    status: "failed",
                });
            } catch (e) {
                console.error("Failed to log failed attendance status update:", e);
            }
            res.status(500).json({ message: "Server error" });
        }
    }
);

router.put(
    "/:id/manager-edit",
    verifyToken,
    verifyRole(["atasan"]),
    async (req, res) => {
        try {
            const managerScope = await resolveManagerScope(db, req.user.id);

            if (!shouldScopeAsAtasan(req)) {
                return res.status(403).json({
                    message: "Atasan hanya dapat mengedit absensi tim saat role atasan sedang aktif",
                });
            }

            const { id } = req.params;
            const { check_in, check_out, status } = req.body;

            let attendanceScopeClause = "p.department_id = ? AND e.id <> ?";
            let attendanceScopeParams = [managerScope.departmentId, managerScope.managerEmployeeId];
            if (managerScope.isDirector) {
                attendanceScopeClause = "p.level = 'manager' AND e.id <> ?";
                attendanceScopeParams = [managerScope.managerEmployeeId];
            }

            const [existingAttendance] = await db.promise().query(
                `SELECT a.*, e.employee_code, e.id AS employee_id, u.name AS employee_name
                 FROM attendance a
                 JOIN employees e ON a.employee_id = e.id
                 JOIN positions p ON e.position_id = p.id
                 JOIN users u ON e.user_id = u.id
                 WHERE a.id = ?
                   AND ${attendanceScopeClause}`,
                [id, ...attendanceScopeParams]
            );

            if (!existingAttendance.length) {
                return res.status(404).json({ message: "Attendance record not found" });
            }

            const validStatuses = ["hadir", "izin", "sakit", "alpha", "libur"];
            const nextStatus = String(status || existingAttendance[0].status || "").toLowerCase().trim();
            if (!validStatuses.includes(nextStatus)) {
                return res.status(400).json({
                    message: "Invalid status. Valid statuses: hadir, izin, sakit, alpha, libur",
                });
            }

            const normalizeTimeInput = (value) => {
                if (value === undefined) return undefined;
                const normalizedValue = String(value || "").trim();
                if (!normalizedValue) return null;
                if (!/^\d{2}:\d{2}(:\d{2})?$/.test(normalizedValue)) {
                    const error = new Error("Format waktu harus HH:MM atau HH:MM:SS");
                    error.statusCode = 400;
                    throw error;
                }
                return normalizedValue.length === 5 ? `${normalizedValue}:00` : normalizedValue;
            };

            const nextCheckIn = normalizeTimeInput(check_in);
            const nextCheckOut = normalizeTimeInput(check_out);
            const attendanceRow = existingAttendance[0];
            let effectiveCheckIn =
                nextCheckIn !== undefined ? nextCheckIn : attendanceRow.check_in;
            let effectiveCheckOut =
                nextCheckOut !== undefined ? nextCheckOut : attendanceRow.check_out;

            let nextWorkingHours = null;
            let nextOvertimeHours = null;
            let nextIsLate = 0;
            let nextLateMinutes = 0;
            let nextCheckInValue = null;
            let nextCheckOutValue = null;

            const leaveStatuses = ["izin", "sakit", "alpha", "libur"];
            const isLeaveStatus = leaveStatuses.includes(nextStatus);

            if (isLeaveStatus) {
                nextCheckInValue = null;
                nextCheckOutValue = null;
            } else {
                const workingHours = await getWorkingHoursByEmployee(
                    attendanceRow.employee_id
                );
                const workingHoursWindow = getWorkingHoursWindow(workingHours);

                if (!effectiveCheckIn) {
                    effectiveCheckIn = workingHoursWindow.check_in_time;
                }

                if (!effectiveCheckOut) {
                    effectiveCheckOut = workingHoursWindow.check_out_time;
                }

                nextCheckInValue = effectiveCheckIn;
                nextCheckOutValue = effectiveCheckOut;

                const [approvedLeaves] = await db.promise().query(
                    `SELECT id
                     FROM leave_requests
                     WHERE employee_id = ?
                       AND status = 'approved'
                       AND ? BETWEEN start_date AND end_date
                     LIMIT 1`,
                    [attendanceRow.employee_id, attendanceRow.date]
                );

                const hasApprovedLeaveOnDate = approvedLeaves.length > 0;

                if (hasApprovedLeaveOnDate) {
                    nextLateMinutes = 0;
                    nextIsLate = 0;
                } else {
                    nextLateMinutes = calculateLateMinutes(
                        nextCheckInValue,
                        workingHoursWindow.check_in_time
                    );
                    nextIsLate = nextLateMinutes > 0 ? 1 : 0;
                }

                const checkInSeconds = timeStringToSeconds(nextCheckInValue);
                const checkOutSeconds = timeStringToSeconds(nextCheckOutValue);
                let workingDurationSeconds = checkOutSeconds - checkInSeconds;
                if (workingDurationSeconds < 0) {
                    workingDurationSeconds += 24 * 3600;
                }

                const standardWorkingDurationSeconds = Math.max(
                    0,
                    workingHoursWindow.check_out_seconds -
                        workingHoursWindow.check_in_seconds
                );

                nextWorkingHours = secondsToHoursDecimal(workingDurationSeconds);
                nextOvertimeHours = secondsToHoursDecimal(
                    Math.max(0, workingDurationSeconds - standardWorkingDurationSeconds)
                );
            }

            await db.promise().query(
                `UPDATE attendance
                 SET status = ?,
                     check_in = ?,
                     check_out = ?,
                     working_hours = ?,
                     overtime_hours = ?,
                     is_late = ?,
                     late_minutes = ?
                 WHERE id = ?`,
                [
                    nextStatus,
                    nextCheckInValue,
                    nextCheckOutValue,
                    nextWorkingHours,
                    nextOvertimeHours,
                    nextIsLate,
                    nextLateMinutes,
                    id,
                ]
            );

            await evaluateAlphaDisciplineForEmployee(attendanceRow.employee_id);

            try {
                const username = req.user.username || req.user.name || null;
                const role = Array.isArray(req.user.roles)
                    ? req.user.roles[0]
                    : req.user.role || null;

                await logActivity({
                    userId: req.user.id,
                    username,
                    role,
                    action: "UPDATE",
                    module: "attendance",
                    description: "Attendance record edited by atasan",
                    oldValues: attendanceRow,
                    newValues: {
                        id,
                        status: nextStatus,
                        check_in: nextCheckInValue,
                        check_out: nextCheckOutValue,
                        working_hours: nextWorkingHours,
                        overtime_hours: nextOvertimeHours,
                        is_late: nextIsLate,
                        late_minutes: nextLateMinutes,
                    },
                    ipAddress: getIpAddress(req),
                    userAgent: getUserAgent(req),
                    status: "success",
                });
            } catch (e) {
                console.error("Failed to log attendance edit activity:", e);
            }

            return res.status(200).json({
                message: "Attendance record updated successfully",
                id,
                status: nextStatus,
                check_in: nextCheckInValue,
                check_out: nextCheckOutValue,
                working_hours: nextWorkingHours,
                overtime_hours: nextOvertimeHours,
                is_late: nextIsLate,
                late_minutes: nextLateMinutes,
            });
        } catch (error) {
            console.error(error);
            return res.status(error.statusCode || 500).json({
                message: error.message || "Server error",
            });
        }
    }
);

// ============================
// CRON: GENERATE DAILY ALPHA (ALL EMPLOYEES)
// ============================
const runDailyAlphaGeneration = async (targetDateInput) => {
    const targetDate = targetDateInput
        ? new Date(targetDateInput)
        : new Date(Date.now() - 24 * 60 * 60 * 1000);

    if (Number.isNaN(targetDate.getTime())) {
        const error = new Error("Invalid date format. Use YYYY-MM-DD");
        error.statusCode = 400;
        throw error;
    }

    targetDate.setHours(0, 0, 0, 0);

    // Hari Minggu diskip
    if (targetDate.getDay() === 0) {
        return {
            skipped: true,
            message: "Skipped. Target date is Sunday",
            date: formatDateOnly(targetDate),
            total_employees: 0,
            generated_alpha: 0,
        };
    }

    const [employees] = await db.promise().query(
        `SELECT e.id
         FROM employees e
         INNER JOIN users u ON u.id = e.user_id
         WHERE e.deleted_at IS NULL
           AND LOWER(COALESCE(u.status, 'active')) = 'active'`
    );

    let generatedAlphaCount = 0;
    for (const employee of employees) {
        const inserted = await ensureAlphaAttendanceByDate(
            employee.id,
            targetDate
        );
        if (inserted) {
            generatedAlphaCount += 1;
        }
    }

    return {
        skipped: false,
        message: "Daily alpha generation completed",
        date: formatDateOnly(targetDate),
        total_employees: employees.length,
        generated_alpha: generatedAlphaCount,
    };
};

router.runDailyAlphaGeneration = runDailyAlphaGeneration;

// Endpoint untuk scheduler harian agar alpha tercatat tanpa menunggu user buka halaman
router.post("/cron/generate-alpha", async (req, res) => {
    try {
        const cronKey = req.headers["x-cron-key"];
        const expectedCronKey = process.env.CRON_SECRET;

        if (!expectedCronKey || cronKey !== expectedCronKey) {
            return res.status(401).json({ message: "Unauthorized cron request" });
        }

        const result = await runDailyAlphaGeneration(req.body?.date);

        return res.status(200).json(result);
    } catch (error) {
        if (error.statusCode === 400) {
            return res.status(400).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});

// ============================
// SUBMIT LEAVE REQUEST (Pegawai)
// ============================
// Pegawai/Admin/Direktur submit cuti/izin/sakit
router.post(
    "/leave-request",
    verifyToken,
    verifyRole(["pegawai", "admin", "direktur"]),
    uploadLeave.single("bukti"),
    async (req, res) => {
        try {
            const userId = req.user.id;
            const { leave_type, start_date, end_date, reason, time, cuti_khusus_option } = req.body;

            // Validasi input
            if (!leave_type || !start_date || !end_date || !reason) {
                return res.status(400).json({
                    message:
                        "leave_type, start_date, end_date, and reason are required",
                });
            }
                // Path bukti (optional) jika diupload
                const buktiPath = req.file
                    ? `uploads/${req.leaveUploadSubFolder || "cuti"}/${req.file.filename}`
                    : null;


            const fallbackMaxDays = getEffectiveMaxLeaveDays(null, leave_type, cuti_khusus_option);
            const policy = await getLeavePolicyByType(leave_type);
            if (!policy) {
                return res.status(400).json({
                    message:
                        fallbackMaxDays > 0
                            ? `Maksimal pengajuan untuk jenis cuti/izin tersebut adalah ${fallbackMaxDays} hari.`
                            : "Maksimal pengajuan untuk jenis cuti/izin tersebut mengikuti aturan database.",
                    max_days: fallbackMaxDays > 0 ? fallbackMaxDays : null,
                });
            }

            const maxDaysForPolicy = getEffectiveMaxLeaveDays(policy, leave_type, cuti_khusus_option);

            // Cari employee_id berdasarkan user_id
            const [employeeResult] = await db.promise().query(
                `SELECT e.id, e.join_date, e.created_at, e.annual_leave_quota, e.remaining_leave_quota, p.name AS position_name
                 FROM employees e
                 LEFT JOIN positions p ON e.position_id = p.id
                 WHERE e.user_id = ?`,
                [userId]
            );

            if (employeeResult.length === 0) {
                return res.status(404).json({
                    message: "Employee record not found. Please contact HR.",
                });
            }

            const employeeId = employeeResult[0].id;
            const quotaSummary = await getCalculatedRemainingLeaveQuota(employeeId);
            const remainingQuota = Number(
                quotaSummary.calculated_remaining_leave_quota || 0
            );
            const startDateObj = new Date(start_date);
            if (Number.isNaN(startDateObj.getTime())) {
                return res.status(400).json({
                    message: "Format tanggal mulai tidak valid.",
                });
            }
            const requesterPositionName = employeeResult[0].position_name || "";
            const requesterRoles = req.user.roles || [];
            const requesterIsDirector =
                requesterRoles.includes("direktur") ||
                isDirectorLevelPosition(requesterPositionName);
            const shouldAutoApprove =
                requesterRoles.includes("admin") || requesterIsDirector;

            // Hitung total hari
            const totalDays = calculateTotalLeaveDays(start_date, end_date);
            if (totalDays <= 0) {
                return res.status(400).json({
                    message: "Tanggal akhir tidak boleh lebih kecil dari tanggal mulai.",
                });
            }

            const serviceDate =
                employeeResult[0].join_date || employeeResult[0].created_at;
            const serviceMonths = calculateServiceMonths(serviceDate);

            if (
                Number(policy.min_tenure_months || 0) > 0 &&
                serviceMonths < Number(policy.min_tenure_months || 0)
            ) {
                return res.status(400).json({
                    message: `${policy.label || leave_type} hanya bisa diajukan setelah masa kerja ${formatServiceRequirement(policy.min_tenure_months)}.`,
                    required_tenure_months: Number(policy.min_tenure_months || 0),
                    current_tenure_months: serviceMonths,
                });
            }

            if (Number(policy.min_days || 1) > 0 && totalDays < Number(policy.min_days || 1)) {
                return res.status(400).json({
                    message: `${policy.label || leave_type} minimal diajukan selama ${policy.min_days} hari.`,
                });
            }

            if (maxDaysForPolicy > 0 && totalDays > maxDaysForPolicy) {
                return res.status(400).json({
                    message: `Maksimal pengajuan untuk jenis cuti/izin tersebut adalah ${maxDaysForPolicy} hari.`,
                    max_days: Number(maxDaysForPolicy),
                    requested_days: totalDays,
                });
            }

            if (policy.require_bukti && !buktiPath) {
                return res.status(400).json({
                    message: `${policy.label || leave_type} wajib melampirkan bukti pendukung.`,
                });
            }

            if (
                Number(policy.require_bukti_if_days_gt || 0) > 0 &&
                totalDays > Number(policy.require_bukti_if_days_gt) &&
                !buktiPath
            ) {
                return res.status(400).json({
                    message: `${policy.label || leave_type} untuk lebih dari ${policy.require_bukti_if_days_gt} hari wajib melampirkan bukti pendukung.`,
                });
            }

            // Enforce that short sick permits ('izin_sakit') are limited to short durations.
            // Longer sick leaves should be submitted as 'cuti_sakit'.
            if (leave_type === 'izin_sakit') {
                const maxShortSickDays = maxDaysForPolicy || 20;
                if (totalDays > maxShortSickDays) {
                    return res.status(400).json({
                        message: `Izin Sakit hanya untuk pengajuan singkat (maksimal ${maxShortSickDays} hari). Untuk cuti sakit lebih dari ${maxShortSickDays} hari, silakan ajukan 'cuti_sakit'.`,
                        max_short_sick_days: maxShortSickDays,
                        suggested_type: 'cuti_sakit',
                    });
                }
            }

            // Additional specific checks for izin_pribadi monthly cap and izin_terlambat single-day
            if (leave_type === 'izin_pribadi') {
                const monthlyLimit = (policy.meta && policy.meta.monthly_limit) || 2;
                const startMonth = startDateObj.getMonth() + 1;
                const startYear = startDateObj.getFullYear();
                const [usedRows] = await db.promise().query(
                    `SELECT COALESCE(SUM(total_days),0) AS used_days
                     FROM leave_requests
                     WHERE employee_id = ?
                       AND status = 'approved'
                       AND leave_type = 'izin_pribadi'
                       AND MONTH(start_date) = ? AND YEAR(start_date) = ?`,
                    [employeeId, startMonth, startYear]
                );
                const usedDays = Number((usedRows[0] && usedRows[0].used_days) || 0);
                if (usedDays + totalDays > Number(monthlyLimit)) {
                    return res.status(400).json({
                        message: `Izin Keperluan Pribadi dibatasi ${monthlyLimit} hari per bulan. Anda sudah menggunakan ${usedDays} hari pada bulan ini.`,
                        monthly_limit: monthlyLimit,
                        used_days: usedDays,
                        requested_days: totalDays,
                    });
                }
            }

            if (leave_type === 'izin_terlambat') {
                if (totalDays !== 1) {
                    return res.status(400).json({
                        message: `Izin Terlambat / Pulang Cepat hanya boleh 1 hari per pengajuan.`,
                    });
                }
            }

            // Validasi kuota cuti untuk cuti_tahunan
            if (["cuti_tahunan"].includes(leave_type)) {
                if (totalDays > remainingQuota) {
                    return res.status(400).json({
                        message: `Insufficient leave quota. You have ${remainingQuota} days remaining, but requested ${totalDays} days.`,
                        remaining_quota: remainingQuota,
                        requested_days: totalDays,
                    });
                }
            }

            let result;
            let status = "pending";

            if (shouldAutoApprove) {
                status = "approved";
                const autoApprovedBy = requesterIsDirector
                    ? null
                    : employeeId;
                [result] = await db.promise().query(
                    `INSERT INTO leave_requests 
                    (employee_id, leave_type, start_date, end_date, total_days, reason, bukti, time, cuti_khusus_option, status, approved_by, approved_at, created_at) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?, NOW(), NOW())`,
                    [
                            employeeId,
                            leave_type,
                            start_date,
                            end_date,
                            totalDays,
                            reason,
                            buktiPath,
                            time || null,
                            cuti_khusus_option || null,
                            autoApprovedBy,
                        ]
                );

                await applyApprovedLeaveEffects({
                    id: result.insertId,
                    employee_id: employeeId,
                    leave_type,
                    start_date,
                    end_date,
                    total_days: totalDays,
                    reason,
                    attendance_status: policy.attendance_status,
                });
                // Log activity: auto-approved leave request
                try {
                    const username = req.user.username || req.user.name || null;
                    const role = Array.isArray(req.user.roles)
                        ? req.user.roles[0]
                        : req.user.role || null;
                    await logActivity({
                        userId,
                        username,
                        role,
                        action: "CREATE",
                        module: "leave_requests",
                        description: "Leave request auto-approved",
                        oldValues: null,
                        newValues: {
                            request_id: result.insertId,
                            employee_id: employeeId,
                            leave_type,
                            start_date,
                            end_date,
                            total_days: totalDays,
                            status: "approved",
                        },
                        ipAddress: getIpAddress(req),
                        userAgent: getUserAgent(req),
                        status: "success",
                    });
                } catch (e) {
                    console.error("Failed to log auto-approved leave request:", e);
                }
            } else {
                [result] = await db.promise().query(
                    `INSERT INTO leave_requests 
                    (employee_id, leave_type, start_date, end_date, total_days, reason, bukti, time, cuti_khusus_option, status, created_at) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
                    [
                            employeeId,
                            leave_type,
                            start_date,
                            end_date,
                            totalDays,
                            reason,
                            buktiPath,
                            time || null,
                            cuti_khusus_option || null,
                        ]
                );
            }

            res.status(201).json({
                message: shouldAutoApprove
                    ? "Leave request auto-approved successfully"
                    : "Leave request submitted successfully",
                request_id: result.insertId,
                leave_type,
                start_date,
                end_date,
                total_days: totalDays,
                status,
            });
            // Log activity: leave request submitted (pending)
            try {
                const username = req.user.username || req.user.name || null;
                const role = Array.isArray(req.user.roles)
                    ? req.user.roles[0]
                    : req.user.role || null;
                await logActivity({
                    userId,
                    username,
                    role,
                    action: "CREATE",
                    module: "leave_requests",
                    description: shouldAutoApprove ? "Leave request auto-approved" : "Leave request submitted",
                    oldValues: null,
                    newValues: {
                        request_id: result.insertId,
                        employee_id: employeeId,
                        leave_type,
                        start_date,
                        end_date,
                        total_days: totalDays,
                        status,
                    },
                    ipAddress: getIpAddress(req),
                    userAgent: getUserAgent(req),
                    status: "success",
                });
            } catch (e) {
                console.error("Failed to log leave request submission:", e);
            }
        } catch (error) {
            console.error(error);
            try {
                await logActivity({
                    userId: req.user?.id || null,
                    username: req.user?.username || req.user?.name || null,
                    role: Array.isArray(req.user?.roles) ? req.user.roles[0] : req.user?.role || null,
                    action: "CREATE",
                    module: "leave_requests",
                    description: "Leave request submission failed",
                    errorMessage: error.message,
                    ipAddress: getIpAddress(req),
                    userAgent: getUserAgent(req),
                    status: "failed",
                });
            } catch (e) {
                console.error("Failed to log failed leave request submission:", e);
            }

            res.status(500).json({ message: "Server error" });
        }
    }
);

// ============================
// GET MY LEAVE REQUESTS (Pegawai)
// ============================
// Pegawai/Admin/Direktur melihat leave request sendiri
router.get(
    "/my-leave-requests",
    verifyToken,
    verifyRole(["pegawai", "admin", "direktur"]),
    async (req, res) => {
        try {
            const userId = req.user.id;
            const { status } = req.query;

            // Cari employee_id berdasarkan user_id
            const [employeeResult] = await db
                .promise()
                .query("SELECT id FROM employees WHERE user_id = ?", [userId]);

            if (employeeResult.length === 0) {
                return res.status(404).json({
                    message: "Employee record not found. Please contact HR.",
                });
            }

            const employeeId = employeeResult[0].id;

            // Build query
            let query = `
                SELECT lr.*, 
                       u_approver.name as approved_by_name
                FROM leave_requests lr
                LEFT JOIN employees e_approver ON lr.approved_by = e_approver.id
                LEFT JOIN users u_approver ON e_approver.user_id = u_approver.id
                WHERE lr.employee_id = ?
            `;
            const params = [employeeId];

            if (status) {
                query += " AND lr.status = ?";
                params.push(status);
            }

            query += " ORDER BY lr.created_at DESC";

            const [leaveRequests] = await db.promise().query(query, params);

            res.status(200).json({
                message: "Leave requests retrieved successfully",
                total: leaveRequests.length,
                data: leaveRequests,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

// ============================
// GET ALL LEAVE REQUESTS (HR/Atasan/Admin)
// ============================

// ============================
// GET LEAVE POLICY BY TYPE (Pegawai)
// ============================
router.get(
    "/leave-policy/:leave_type",
    verifyToken,
    verifyRole(["pegawai", "admin", "hr", "atasan", "direktur"]),
    async (req, res) => {
        try {
            const leaveType = req.params.leave_type;
            const policy = await getLeavePolicyByType(leaveType);
            if (!policy) {
                return res.status(404).json({ message: "Leave policy not found" });
            }

            return res.status(200).json({ message: "Leave policy retrieved", data: policy });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Server error" });
        }
    }
);
// HR/Atasan melihat semua leave request
router.get(
    "/leave-requests",
    verifyToken,
    verifyRole(["hr", "atasan", "admin", "commissioner"]),
    async (req, res) => {
        try {
            const { status, employee_id, leave_type } = req.query;
            const forceHrAllScope = req.query.scope === "hr_all";
            const requesterRoles = req.user.roles || [];
            const adminDirecturScopeToAtasan =
                !forceHrAllScope &&
                requesterRoles.includes("admin") &&
                !requesterRoles.includes("hr");
            let managerScope = null;

            if (!forceHrAllScope && shouldScopeAsAtasan(req)) {
                managerScope = await resolveManagerScope(db, req.user.id);
            }

            // Build query
            let query = `
                SELECT lr.*, 
                       e.employee_code,
                       p.department_id,
                       u.name as employee_name,
                       u_approver.name as approved_by_name
                FROM leave_requests lr
                JOIN employees e ON lr.employee_id = e.id
                LEFT JOIN positions p ON e.position_id = p.id
                JOIN users u ON e.user_id = u.id
                LEFT JOIN employees e_approver ON lr.approved_by = e_approver.id
                LEFT JOIN users u_approver ON e_approver.user_id = u_approver.id
                WHERE 1=1
            `;
            const params = [];

            if (status) {
                query += " AND lr.status = ?";
                params.push(status);
            }

            if (employee_id) {
                query += " AND lr.employee_id = ?";
                params.push(employee_id);
            }

            if (leave_type) {
                query += " AND lr.leave_type = ?";
                params.push(leave_type);
            }

            if (adminDirecturScopeToAtasan) {
                query += `
                    AND EXISTS (
                        SELECT 1
                        FROM user_roles ur_req
                        JOIN roles r_req ON r_req.id = ur_req.role_id
                        WHERE ur_req.user_id = e.user_id
                          AND r_req.name = 'atasan'
                    )
                `;
            }

            if (managerScope) {
                if (managerScope.isDirector) {
                    query += " AND p.level = 'manager' AND e.id <> ?";
                    params.push(managerScope.managerEmployeeId);
                } else {
                    query += " AND p.department_id = ? AND e.id <> ?";
                    params.push(
                        managerScope.departmentId,
                        managerScope.managerEmployeeId
                    );
                }
            }

            query += " ORDER BY lr.created_at DESC";

            const [leaveRequests] = await db.promise().query(query, params);

            res.status(200).json({
                message: "Leave requests retrieved successfully",
                total: leaveRequests.length,
                data: leaveRequests,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

// ============================
// APPROVE/REJECT LEAVE REQUEST (HR/Atasan)
// ============================
// HR/Atasan approve atau reject leave request
router.put(
    "/leave-request/:id",
    verifyToken,
    verifyRole(["hr", "atasan", "admin", "commissioner"]),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const userId = req.user.id;
            const requesterRoles = req.user.roles || [];
            const adminDirecturScopeToAtasan =
                requesterRoles.includes("admin") &&
                !requesterRoles.includes("hr");
            let managerScope = null;

            if (shouldScopeAsAtasan(req)) {
                managerScope = await resolveManagerScope(db, userId);
            }

            // Validasi status
            if (!status || !["approved", "rejected"].includes(status)) {
                return res.status(400).json({
                    message:
                        "Invalid status. Valid statuses: approved, rejected",
                });
            }

            // Cek apakah leave request ada
            const [leaveRequestResult] = await db
                .promise()
                .query("SELECT * FROM leave_requests WHERE id = ?", [id]);

            if (leaveRequestResult.length === 0) {
                return res.status(404).json({
                    message: "Leave request not found",
                });
            }

            const leaveRequest = leaveRequestResult[0];

            if (adminDirecturScopeToAtasan) {
                const [atasanRoleResult] = await db.promise().query(
                    `SELECT e.id
                     FROM employees e
                     JOIN user_roles ur ON ur.user_id = e.user_id
                     JOIN roles r ON r.id = ur.role_id
                     WHERE e.id = ?
                       AND r.name = 'atasan'
                     LIMIT 1`,
                    [leaveRequest.employee_id]
                );

                if (!atasanRoleResult.length) {
                    return res.status(403).json({
                        message:
                            "Direktur/Admin hanya dapat memproses pengajuan cuti/izin milik atasan.",
                    });
                }
            }

            const [requesterPositionResult] = await db.promise().query(
                `SELECT p.name AS position_name
                 FROM employees e
                 LEFT JOIN positions p ON e.position_id = p.id
                 WHERE e.id = ?
                 LIMIT 1`,
                [leaveRequest.employee_id]
            );

            const requesterPositionName =
                requesterPositionResult[0]?.position_name || "";
            const requesterIsDirector =
                isDirectorLevelPosition(requesterPositionName);
            const requesterIsManager =
                isManagerLevelPosition(requesterPositionName);
            const approverIsDirector = (req.user.roles || []).includes("admin");

            if (requesterIsManager && !requesterIsDirector && !approverIsDirector) {
                return res.status(403).json({
                    message:
                        "Pengajuan cuti/izin untuk level manajer hanya dapat diproses oleh Direktur.",
                });
            }

            if (managerScope) {
                let leaveDeptClause = 'p.department_id = ? AND e.id <> ?';
                const leaveParams = [managerScope.departmentId, managerScope.managerEmployeeId];
                if (managerScope.isDirector) {
                    leaveDeptClause = "p.level = 'manager' AND e.id <> ?";
                    leaveParams.splice(0, leaveParams.length, managerScope.managerEmployeeId);
                }

                const [leaveScope] = await db.promise().query(
                    `SELECT lr.id
                     FROM leave_requests lr
                     JOIN employees e ON lr.employee_id = e.id
                     JOIN positions p ON e.position_id = p.id
                     WHERE lr.id = ?
                       AND ${leaveDeptClause}`,
                    [id, ...leaveParams]
                );

                if (!leaveScope.length) {
                    return res.status(403).json({
                        message:
                            managerScope.isDirector
                                ? "Direktur dapat memproses cuti/izin untuk pegawai level manager di departemen mana pun"
                                : "Atasan hanya dapat memproses cuti/izin tim dalam departemen yang dipimpin",
                    });
                }
            }

            // Cek jika sudah di-approve/reject
            if (leaveRequest.status !== "pending") {
                return res.status(400).json({
                    message: `Leave request already ${leaveRequest.status}`,
                });
            }

            // Cari employee_id dari user yang approve
            const [approverResult] = await db
                .promise()
                .query("SELECT id FROM employees WHERE user_id = ?", [userId]);

            const approverId =
                approverResult.length > 0 ? approverResult[0].id : null;

            // Update status leave request
            await db.promise().query(
                `UPDATE leave_requests 
                SET status = ?, approved_by = ?, approved_at = NOW(), updated_at = NOW() 
                WHERE id = ?`,
                [status, approverId, id]
            );

            // Jika approved, create attendance records untuk setiap hari
            if (status === "approved") {
                await applyApprovedLeaveEffects(leaveRequest);
            }

            // Log activity: approve/reject leave request
            try {
                const username = req.user.username || req.user.name || null;
                const role = Array.isArray(req.user.roles)
                    ? req.user.roles[0]
                    : req.user.role || null;

                await logActivity({
                    userId,
                    username,
                    role,
                    action: "UPDATE",
                    module: "leave_requests",
                    description: status === "approved" ? "Leave request approved" : "Leave request rejected",
                    oldValues: leaveRequest,
                    newValues: { request_id: id, status, approved_by: approverId },
                    ipAddress: getIpAddress(req),
                    userAgent: getUserAgent(req),
                    status: "success",
                });
            } catch (e) {
                console.error("Failed to log leave request approval/rejection:", e);
            }

            res.status(200).json({
                message: `Leave request ${status} successfully`,
                request_id: id,
                status: status,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

module.exports = router;
