const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const { resolveManagerScope } = require("../utils/managerScope");

const COMPANY_NAME = "PT OTAK KANAN";
const COMPANY_ADDRESS =
    "Graha Pena, Ruang 1503, Jl. Ahmad Yani No.88, Ketintang, Kec. Gayungan, Surabaya, Jawa Timur 60234";

const ALPHA_SANCTION_LEVEL = {
    NONE: "none",
};

const normalizeSpLevel = (value) => {
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

const getSanctionLevelFromAlphaCounts = async ({
    alphaConsecutiveDays,
    alphaAccumulatedDays,
}) => {
    const consecutive = Number(alphaConsecutiveDays || 0);
    const accumulated = Number(alphaAccumulatedDays || 0);

    try {
        const [rules] = await db.promise().query(
            `SELECT sanction_level, min_consecutive_alpha, min_accumulated_alpha
             FROM attendance_warning_rules
             WHERE is_active = 1
             ORDER BY GREATEST(COALESCE(min_consecutive_alpha, 0), COALESCE(min_accumulated_alpha, 0)) DESC, id DESC`
        );

        for (const rule of rules) {
            const minConsec = Number(rule.min_consecutive_alpha || 0);
            const minAccum = Number(rule.min_accumulated_alpha || 0);

            if ((minConsec > 0 && consecutive >= minConsec) || (minAccum > 0 && accumulated >= minAccum)) {
                return normalizeSpLevel(rule.sanction_level) || ALPHA_SANCTION_LEVEL.NONE;
            }
        }
    } catch (error) {
        console.error("Failed to infer sanction level from attendance_warning_rules:", error?.message || error);
    }

};

const isAdminContext = (req) => {
    const activeRole = String(req.headers["x-active-role"] || "").toLowerCase();
    return (req.user.roles || []).includes("admin") && activeRole === "admin";
};

const isHrContext = (req) => {
    const activeRole = String(req.headers["x-active-role"] || "").toLowerCase();
    return (req.user.roles || []).includes("hr") && activeRole === "hr";
};

const toReadableSpLabel = (spLevel) => {
    const normalized = normalizeSpLevel(spLevel) || "sp1";
    if (normalized === "none") return "SURAT PERINGATAN";

    const spMatch = normalized.match(/^sp(\d+)$/i);
    if (spMatch) {
        return `SURAT PERINGATAN (SP${spMatch[1]})`;
    }

    return normalized.replace(/[_-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

const monthRoman = (monthNumber) => {
    const map = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    return map[Math.max(1, Math.min(12, Number(monthNumber || 1))) - 1];
};

const formatDateForLetter = (dateValue) => {
    if (!dateValue) return "-";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
};

const stripHtmlToText = (value) =>
        String(value || "")
                .replace(/<br\s*\/?>(\r?\n)?/gi, "\n")
                .replace(/<[^>]*>/g, "")
                .replace(/&nbsp;/g, " ")
                .replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'");

const buildLetterHtmlDocument = ({
        title,
        letterNumber,
        recipient,
        bodyParagraphs,
        detailRows,
        issuedDate,
        closingLines = [],
}) => {
        const detailHtml = (detailRows || [])
                .map(
                        (row) => `
                                <tr>
                                        <td style="width: 140px; padding: 0 0 6px 0; vertical-align: top;">${row.label}</td>
                                        <td style="padding: 0 0 6px 0; vertical-align: top;">: ${row.value}</td>
                                </tr>`,
                )
                .join("");
        const paragraphHtml = (bodyParagraphs || [])
                .map((line) => `<p style="margin: 0 0 12px 0; text-align: justify; text-indent: 36px;">${line}</p>`)
                .join("");
        const closingHtml = (closingLines || [])
                .map((line) => `<div style="margin-bottom: ${line.marginBottom || 10}px;">${line.text}</div>`)
                .join("");

        return `<!doctype html>
<html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${letterNumber}</title>
        <style>
            @page { size: A4; margin: 24mm 20mm; }
            * { box-sizing: border-box; }
            body { margin: 0; font-family: 'Times New Roman', serif; color: #111827; line-height: 1.7; background: #fff; }
            .sheet { width: 210mm; min-height: 297mm; margin: 0 auto; background: #fff; padding: 22mm 24mm; }
            .header { border-bottom: 3px solid #222; padding-bottom: 12px; margin-bottom: 18px; }
            .header-row { display: flex; align-items: center; }
            .logo { width: 190px; min-width: 190px; }
            .company { flex: 1; margin-left: 25px; }
            .company-name { font-weight: 700; font-size: 18px; margin-bottom: 4px; }
            .title { text-align: center; font-weight: 700; font-size: 18px; letter-spacing: 1px; margin: 8px 0 6px; }
            .letter-number { text-align: center; margin-bottom: 24px; font-size: 13px; }
            .recipient-title { margin: 0 0 8px 0; }
            .recipient-name { margin: 0 0 12px 0; }
            .closing { margin-top: 40px; width: 260px; margin-left: auto; text-align: center; }
        </style>
    </head>
    <body>
        <div class="sheet">
            <div class="header">
                <div class="company-name">PT OTAK KANAN</div>
                <div style="font-size: 13px;">Graha Pena Building Lt.15 Suite 1503</div>
                <div style="font-size: 13px;">Jl. Ahmad Yani No.88 Surabaya</div>
                <div style="font-size: 13px;">Telp: (031) 8286155</div>
                </div>
            </div>
            <div style="text-align: right; margin-bottom: 24px;">Surabaya, ${formatDateForLetter(issuedDate)}</div>
            <div class="title">${title}</div>
            <div class="letter-number">No: ${letterNumber}</div>
            <div class="recipient-title">Diberikan kepada:</div>
            <div class="recipient-name">
                <div>Nama&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ${recipient.name}</div>
                <div>Departemen : ${recipient.department}</div>
                <div>Posisi&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ${recipient.position}</div>
                ${recipient.npwp ? `<div>NPWP&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ${recipient.npwp}</div>` : ""}
            </div>
            ${paragraphHtml}
            ${detailRows?.length ? `<table style="margin: 0 0 20px 0; border-collapse: collapse;">${detailHtml}</table>` : ""}
            <div>${closingHtml}</div>
            <div class="closing">
                <div style="margin-bottom: 70px;">Hormat kami,</div>
                <div style="font-weight: bold;">${recipient.signedTitle || "HRD PT OTAK KANAN"}</div>
                <div>${recipient.signedName || "...................."}</div>
            </div>
        </div>
    </body>
</html>`;
};

const buildWarningLetterContent = ({
    letterNumber,
    spLevel,
    employee,
    reason,
    issuedDate,
    signedTitle,
    signedName,
}) => {
    const spTitle = toReadableSpLabel(spLevel);
    const employeeName = employee.employee_name || "-";
    const departmentName = employee.department_name || "-";
    const positionName = employee.position_name || "-";
    const npwp = employee.npwp || "-";
    const violationDateText = formatDateForLetter(violationDate);
    const violationDateEndText = formatDateForLetter(violationDateEnd);
    const isConsecutiveRange =
        Number(consecutiveAlphaDays || 0) > 1 &&
        violationDate &&
        violationDateEnd &&
        violationDate !== violationDateEnd;
    const issuedDateText = formatDateForLetter(issuedDate);
    const violationReason =
        reason ||
        (isConsecutiveRange
            ? `Berdasarkan catatan kehadiran, Saudara tidak masuk kerja tanpa\nketerangan (alpha) secara berturut-turut pada tanggal\n${violationDateText} s.d. ${violationDateEndText}.`
            : `Berdasarkan catatan kehadiran, Saudara tidak masuk kerja tanpa\nketerangan (alpha) pada tanggal ${violationDateText}.`);

    return buildLetterHtmlDocument({
        title: spTitle,
        letterNumber,
        recipient: {
            name: employeeName,
            department: departmentName,
            position: positionName,
            npwp,
            signedTitle,
            signedName,
        },
        bodyParagraphs: [
            violationReason.replace(/\n/g, "<br/>") ,
            `Sehubungan dengan hal tersebut, perusahaan memberikan ${spTitle}.`,
            "Diharapkan Saudara tidak mengulangi pelanggaran tersebut dan meningkatkan kedisiplinan kerja.",
            "Surat peringatan ini berlaku selama 6 bulan sejak tanggal diterbitkan.",
        ],
        detailRows: [],
        issuedDate,
    });
};

const buildEvaluasiHRContent = ({
    letterNumber,
    employee,
    evaluationDate,
    evaluationTime,
    evaluationPlace,
    issuedDate,
    signedTitle,
    signedName,
}) => {
    const employeeName = employee.employee_name || "-";
    const departmentName = employee.department_name || "-";
    const positionName = employee.position_name || "-";
    const issuedDateText = formatDateForLetter(issuedDate);
    const evalDay = evaluationDate
        ? new Date(evaluationDate + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long" })
        : "-";
    const evalDateText = evaluationDate
        ? `${evalDay}, ${formatDateForLetter(evaluationDate)}`
        : "-";
    const evalTimeText = evaluationTime || "-";
    const evalPlaceText = evaluationPlace || "Ruang HR / Kantor HRD";

    return buildLetterHtmlDocument({
        title: "UNDANGAN EVALUASI HR",
        letterNumber,
        recipient: {
            name: employeeName,
            department: departmentName,
            position: positionName,
            signedTitle,
            signedName,
        },
        bodyParagraphs: [
            "Dengan hormat,",
            "Sehubungan dengan catatan pelanggaran kedisiplinan kehadiran yang telah mencapai tahap evaluasi HR, dengan ini Saudara diminta untuk menghadiri sesi Evaluasi HR.",
            "Evaluasi ini bertujuan untuk melakukan peninjauan terhadap riwayat kehadiran serta memberikan kesempatan kepada Saudara untuk menyampaikan klarifikasi terkait pelanggaran yang terjadi.",
            "Adapun pelaksanaan evaluasi akan dilakukan pada:",
        ],
        detailRows: [
            { label: "Hari/Tanggal", value: evalDateText },
            { label: "Waktu", value: evalTimeText },
            { label: "Tempat", value: evalPlaceText },
        ],
        closingLines: [
            { text: "Diharapkan Saudara dapat hadir sesuai jadwal yang telah ditentukan.", marginBottom: 12 },
        ],
        issuedDate,
    });
};

const getEmployeeBaseData = async (employeeId) => {
    const [rows] = await db.promise().query(
        `SELECT
            e.id AS employee_id,
            e.employee_code,
            COALESCE(e.full_name, u.name) AS employee_name,
            e.npwp,
            e.alpha_sanction_level,
            e.alpha_consecutive_days,
            e.alpha_accumulated_days,
            p.name AS position_name,
            LOWER(COALESCE(p.level, '')) AS position_level,
            d.name AS department_name,
            LOWER(COALESCE(u.status, 'active')) AS user_status,
            GROUP_CONCAT(DISTINCT LOWER(r.name)) AS roles_csv
         FROM employees e
         JOIN users u ON e.user_id = u.id
         LEFT JOIN positions p ON e.position_id = p.id
         LEFT JOIN departments d ON p.department_id = d.id
         LEFT JOIN user_roles ur ON ur.user_id = u.id
         LEFT JOIN roles r ON r.id = ur.role_id
         WHERE e.id = ?
         GROUP BY
            e.id,
            e.employee_code,
            employee_name,
            e.npwp,
            e.alpha_sanction_level,
            e.alpha_consecutive_days,
            e.alpha_accumulated_days,
            p.name,
            p.level,
            d.name,
            u.status`,
        [employeeId]
    );

    return rows[0] || null;
};

const canAdminIssueForTarget = (employeeData) => {
    const roles = String(employeeData?.roles_csv || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    const isHrRole = roles.includes("hr");
    const level = String(employeeData?.position_level || "").toLowerCase();
    const isManagerOrAtasan = level === "manager" || level === "atasan";
    return isHrRole && isManagerOrAtasan;
};

const assertIssuerScope = (req, employeeData) => {
    const hrContext = isHrContext(req);
    const adminContext = isAdminContext(req);

    if (!hrContext && !adminContext) {
        const error = new Error("Role aktif tidak valid untuk membuat surat peringatan");
        error.statusCode = 403;
        throw error;
    }

    if (adminContext && !canAdminIssueForTarget(employeeData)) {
        const error = new Error(
            "Direktur hanya dapat membuat SP untuk pegawai HR dengan level atasan/manager"
        );
        error.statusCode = 403;
        throw error;
    }
};

const generateLetterNumber = async (issuedDate) => {
    const issued = new Date(issuedDate);
    const year = issued.getFullYear();
    const month = issued.getMonth() + 1;

    const [rows] = await db.promise().query(
        `SELECT COUNT(*) AS total
         FROM warning_letters
         WHERE YEAR(issued_date) = ? AND MONTH(issued_date) = ?`,
        [year, month]
    );

    const nextNumber = Number(rows[0]?.total || 0) + 1;
    const serial = String(nextNumber).padStart(3, "0");

    return `${serial}/SP-HRD/${monthRoman(month)}/${year}`;
};

const generateEvaluasiLetterNumber = async (issuedDate) => {
    const issued = new Date(issuedDate);
    const year = issued.getFullYear();
    const month = issued.getMonth() + 1;

    const [rows] = await db.promise().query(
        `SELECT COUNT(*) AS total
         FROM warning_letters
         WHERE sp_level = 'evaluasi_hr' AND YEAR(issued_date) = ? AND MONTH(issued_date) = ?`,
        [year, month]
    );

    const nextNumber = Number(rows[0]?.total || 0) + 1;
    const serial = String(nextNumber).padStart(3, "0");

    return `${serial}/EVAL-HRD/${monthRoman(month)}/${year}`;
};

const toDateOnly = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const getAlphaViolationContext = async (employeeId) => {
    const [employeeData] = await db.promise().query(
        `SELECT created_at FROM employees WHERE id = ?`,
        [employeeId]
    );

    if (!employeeData.length) {
        return null;
    }

    const employeeCreatedDate = employeeData[0].created_at;

    const [rows] = await db.promise().query(
        `SELECT date, status
         FROM attendance
         WHERE employee_id = ?
           AND date >= DATE(?)
         ORDER BY date DESC`,
        [employeeId, employeeCreatedDate]
    );

    if (!rows.length) {
        return null;
    }

    let latestAlphaDate = null;
    let streakStartDate = null;
    let consecutiveAlphaDays = 0;
    let streakStarted = false;
    let alphaAccumulatedDays = 0;

    for (const row of rows) {
        const status = String(row.status || "").toLowerCase();

        if (status === "alpha") {
            alphaAccumulatedDays += 1;
        }

        if (!latestAlphaDate && status === "alpha") {
            latestAlphaDate = toDateOnly(row.date);
        }

        if (status === "libur") {
            continue;
        }

        if (status === "alpha") {
            streakStarted = true;
            consecutiveAlphaDays += 1;
            streakStartDate = toDateOnly(row.date);
            continue;
        }

        if (streakStarted) {
            break;
        }

        break;
    }

    if (!latestAlphaDate) {
        return null;
    }

    return {
        latestAlphaDate,
        streakStartDate: streakStartDate || latestAlphaDate,
        streakEndDate: latestAlphaDate,
        consecutiveAlphaDays,
        alphaAccumulatedDays,
        sanctionLevel: await getSanctionLevelFromAlphaCounts({
            alphaConsecutiveDays: consecutiveAlphaDays,
            alphaAccumulatedDays,
        }),
    };
};

const parseEvidenceSnapshot = (snapshot) => {
    if (!snapshot) return {};
    if (typeof snapshot === "object") return snapshot;

    try {
        return JSON.parse(snapshot);
    } catch (error) {
        return {};
    }
};

const mapViolationRow = (row) => {
    const snapshot = parseEvidenceSnapshot(row.evidence_snapshot);
    const validUntil = row.valid_until || snapshot.valid_until || null;
    const validUntilDate = validUntil ? new Date(validUntil) : null;
    const remainingDays =
        validUntilDate && !Number.isNaN(validUntilDate.getTime())
            ? Math.max(
                  0,
                  Math.ceil((validUntilDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
              )
            : null;

    return {
        ...row,
        sp_level: normalizeSpLevel(row.sp_level) || row.sp_level,
        rule_id: snapshot.rule_id || null,
        rule_code: snapshot.rule_code || null,
        rule_name: snapshot.rule_name || null,
        alpha_consecutive_days: Number(snapshot.alpha_consecutive_days || 0),
        alpha_accumulated_days: Number(snapshot.alpha_accumulated_days || 0),
        late_consecutive_days: Number(snapshot.late_consecutive_days || 0),
        late_accumulated_days: Number(snapshot.late_accumulated_days || 0),
        valid_until: validUntil,
        remaining_days: remainingDays,
    };
};

const buildActiveViolationListQuery = ({ scope = "all" } = {}) => {
        const baseQuery = `SELECT
                        wl.id,
                        wl.auto_letter_number,
                        wl.sp_level,
                        wl.employee_id,
                        wl.violation_date,
                        wl.issued_date,
                        wl.valid_until,
                        wl.status,
                        wl.evidence_snapshot,
                        wl.generated_by,
                        COALESCE(e.full_name, u.name) AS employee_name,
                        e.employee_code,
                        e.npwp,
                        p.name AS position_name,
                        LOWER(COALESCE(p.level, '')) AS position_level,
                        d.name AS department_name
                 FROM warning_letters wl
                 JOIN employees e ON wl.employee_id = e.id
                 JOIN users u ON e.user_id = u.id
                 LEFT JOIN positions p ON e.position_id = p.id
                 LEFT JOIN departments d ON p.department_id = d.id
                 WHERE wl.status = 'active'
                     AND wl.valid_until >= CURDATE()`;

    if (scope === "team") {
        return `${baseQuery}
           AND p.department_id = ?
           AND e.id <> ?
         ORDER BY wl.valid_until ASC, wl.issued_date DESC, wl.id DESC`;
    }

    return `${baseQuery}
         ORDER BY wl.valid_until ASC, wl.issued_date DESC, wl.id DESC`;
};

const getIssuerSignatureInfo = async (userId, issuerRole) => {
    const [rows] = await db.promise().query(
        `SELECT
            u.name AS user_name,
            e.full_name AS employee_full_name,
            p.name AS position_name
         FROM users u
         LEFT JOIN employees e ON e.user_id = u.id
         LEFT JOIN positions p ON p.id = e.position_id
         WHERE u.id = ?
         LIMIT 1`,
        [userId]
    );

    if (!rows.length) {
        return {
            signedTitle: issuerRole === "admin" ? "Direktur" : "HRD Manager",
            signedName: "....................",
        };
    }

    const issuerRow = rows[0];
    const signedName =
        String(issuerRow.employee_full_name || "").trim() ||
        String(issuerRow.user_name || "").trim() ||
        "....................";
    const signedTitle =
        String(issuerRow.position_name || "").trim() ||
        (issuerRole === "admin" ? "Direktur" : "HRD Manager");

    return {
        signedTitle,
        signedName,
    };
};

router.get(
    "/eligible-employees",
    verifyToken,
    verifyRole(["hr", "admin"]),
    async (req, res) => {
        try {
            const [rows] = await db.promise().query(
                `SELECT
                    e.id AS employee_id,
                    e.user_id AS employee_user_id,
                    e.employee_code,
                    COALESCE(e.full_name, u.name) AS employee_name,
                    e.npwp,
                    p.name AS position_name,
                    LOWER(COALESCE(p.level, '')) AS position_level,
                    d.name AS department_name,
                    e.alpha_sanction_level,
                    e.alpha_consecutive_days,
                    e.alpha_accumulated_days,
                          MAX(CASE WHEN a.status = 'alpha' THEN a.date END) AS latest_alpha_date,
                    GROUP_CONCAT(DISTINCT LOWER(r.name)) AS roles_csv
                 FROM employees e
                 JOIN users u ON e.user_id = u.id
                 LEFT JOIN positions p ON e.position_id = p.id
                 LEFT JOIN departments d ON p.department_id = d.id
                      LEFT JOIN attendance a ON a.employee_id = e.id
                 LEFT JOIN user_roles ur ON ur.user_id = u.id
                 LEFT JOIN roles r ON r.id = ur.role_id
                 GROUP BY
                    e.id,
                    e.user_id,
                    e.employee_code,
                    employee_name,
                    e.npwp,
                    p.name,
                    p.level,
                    d.name,
                    e.alpha_sanction_level,
                    e.alpha_consecutive_days,
                    e.alpha_accumulated_days
                 ORDER BY employee_name ASC`
            );

            const adminContext = isAdminContext(req);
            const filtered = adminContext
                ? rows.filter((row) => canAdminIssueForTarget(row))
                : rows;

            const enrichedRows = await Promise.all(
                filtered.map(async (row) => {
                    const violationContext = await getAlphaViolationContext(
                        row.employee_id
                    );

                    const violationDateStart =
                        violationContext?.streakStartDate || null;
                    const violationDateEnd =
                        violationContext?.streakEndDate || null;
                    const isRange =
                        !!violationDateStart &&
                        !!violationDateEnd &&
                        violationDateStart !== violationDateEnd;

                    return {
                        ...row,
                        alpha_sanction_level:
                            violationContext?.sanctionLevel ||
                            ALPHA_SANCTION_LEVEL.NONE,
                        alpha_consecutive_days:
                            violationContext?.consecutiveAlphaDays || 0,
                        alpha_accumulated_days:
                            violationContext?.alphaAccumulatedDays || 0,
                        latest_alpha_date:
                            violationContext?.latestAlphaDate || row.latest_alpha_date,
                        violation_date_start: violationDateStart,
                        violation_date_end: violationDateEnd,
                        violation_date_label: isRange
                            ? `${violationDateStart} s.d. ${violationDateEnd}`
                            : violationDateStart || "",
                        consecutive_alpha_days:
                            violationContext?.consecutiveAlphaDays || 0,
                    };
                })
            );

            res.json({
                message: "Eligible employees fetched successfully",
                total: enrichedRows.length,
                data: enrichedRows,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

router.get(
    "/active",
    verifyToken,
    verifyRole(["hr", "admin"]),
    async (req, res) => {
        try {
            const { employee_id } = req.query;
            const query = buildActiveViolationListQuery({ scope: "all" });
            const params = [];

            let finalQuery = query;
            if (employee_id) {
                finalQuery = query.replace("WHERE wl.status = 'active'\n           AND wl.valid_until >= CURDATE()", "WHERE wl.status = 'active'\n           AND wl.valid_until >= CURDATE()\n           AND wl.employee_id = ?");
                params.push(employee_id);
            }

            const [rows] = await db.promise().query(finalQuery, params);

            return res.json({
                message: "Active warning letters fetched successfully",
                total: rows.length,
                data: rows.map(mapViolationRow),
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Server error" });
        }
    }
);

router.get("/", verifyToken, verifyRole(["hr", "admin"]), async (req, res) => {
    try {
        const { employee_id } = req.query;

        let query = `SELECT
                wl.id,
                wl.auto_letter_number,
                wl.sp_level,
                wl.employee_id,
                wl.violation_date,
                wl.issued_date,
                wl.status,
                wl.evidence_snapshot,
                wl.generated_by,
                COALESCE(e.full_name, u.name) AS employee_name,
                e.employee_code,
                e.npwp,
                p.name AS position_name,
                LOWER(COALESCE(p.level, '')) AS position_level,
                d.name AS department_name,
                GROUP_CONCAT(DISTINCT LOWER(r.name)) AS recipient_roles_csv
            FROM warning_letters wl
            JOIN employees e ON wl.employee_id = e.id
            JOIN users u ON e.user_id = u.id
            LEFT JOIN positions p ON e.position_id = p.id
            LEFT JOIN departments d ON p.department_id = d.id
            LEFT JOIN user_roles ur ON ur.user_id = u.id
            LEFT JOIN roles r ON r.id = ur.role_id
            WHERE 1=1`;

        const params = [];

        if (employee_id) {
            query += " AND wl.employee_id = ?";
            params.push(employee_id);
        }

            query += `
            GROUP BY
                wl.id,
                wl.auto_letter_number,
                wl.sp_level,
                wl.employee_id,
                wl.violation_date,
                wl.issued_date,
                wl.status,
                wl.evidence_snapshot,
                wl.generated_by,
                employee_name,
                e.employee_code,
                e.npwp,
                p.name,
                p.level,
                d.name
            ORDER BY wl.issued_date DESC, wl.id DESC`;

        const [rows] = await db.promise().query(query, params);

        const adminContext = isAdminContext(req);
        const filtered = adminContext
            ? rows.filter((row) => canAdminIssueForTarget({
                  roles_csv: row.recipient_roles_csv,
                  position_level: row.position_level,
              }))
            : rows;

        // Normalize sp_level in response
        const normalized = filtered.map((r) => ({
            ...r,
            sp_level: normalizeSpLevel(r.sp_level) || r.sp_level,
        }));

        res.json({
            message: "Warning letters fetched successfully",
            total: normalized.length,
            data: normalized,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/my", verifyToken, verifyRole(["pegawai"]), async (req, res) => {
    try {
        const userId = req.user.id;
        const [employeeRows] = await db
            .promise()
            .query("SELECT id FROM employees WHERE user_id = ? LIMIT 1", [userId]);

        if (!employeeRows.length) {
            return res.status(404).json({
                message: "Data pegawai tidak ditemukan",
            });
        }

        const employeeId = employeeRows[0].id;
        const [rows] = await db.promise().query(
            `SELECT
                wl.id,
                wl.auto_letter_number,
                wl.sp_level,
                wl.employee_id,
                wl.violation_date,
                wl.issued_date,
                wl.status,
                wl.evidence_snapshot,
                wl.generated_by,
                wl.created_at,
                COALESCE(e.full_name, u.name) AS employee_name,
                e.employee_code,
                p.name AS position_name,
                d.name AS department_name
             FROM warning_letters wl
             JOIN employees e ON wl.employee_id = e.id
             JOIN users u ON e.user_id = u.id
             LEFT JOIN positions p ON e.position_id = p.id
             LEFT JOIN departments d ON p.department_id = d.id
             WHERE wl.employee_id = ?
             ORDER BY wl.issued_date DESC, wl.id DESC`,
            [employeeId]
        );

        const normalizedRows = rows.map((r) => ({
            ...r,
            sp_level: normalizeSpLevel(r.sp_level) || r.sp_level,
        }));

        return res.json({
            message: "My warning letters fetched successfully",
            total: normalizedRows.length,
            data: normalizedRows,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});

router.get(
    "/team",
    verifyToken,
    verifyRole(["atasan"]),
    async (req, res) => {
        try {
            const { employee_id } = req.query;
            const managerScope = await resolveManagerScope(db, req.user.id);

                        let query = `SELECT
                                        wl.id,
                                        wl.auto_letter_number,
                                        wl.sp_level,
                                        wl.employee_id,
                                        wl.violation_date,
                                        wl.issued_date,
                                        wl.status,
                                        wl.evidence_snapshot,
                                        wl.created_at,
                                        COALESCE(e.full_name, u.name) AS employee_name,
                                        e.employee_code,
                                        e.npwp,
                                        p.name AS position_name,
                                        d.name AS department_name
                                FROM warning_letters wl
                                JOIN employees e ON wl.employee_id = e.id
                                JOIN users u ON e.user_id = u.id
                                LEFT JOIN positions p ON e.position_id = p.id
                                LEFT JOIN departments d ON p.department_id = d.id
                                WHERE p.department_id = ?
                                    AND e.id <> ?`;

            const params = [
                managerScope.departmentId,
                managerScope.managerEmployeeId,
            ];

            if (employee_id) {
                query += " AND wl.employee_id = ?";
                params.push(employee_id);
            }

            query += " ORDER BY wl.issued_date DESC, wl.id DESC";

            const [rows] = await db.promise().query(query, params);

            const normalizedRows = rows.map((r) => ({
                ...r,
                sp_level: normalizeSpLevel(r.sp_level) || r.sp_level,
            }));

            return res.json({
                message: "Team warning letters fetched successfully",
                total: normalizedRows.length,
                data: normalizedRows,
            });
        } catch (error) {
            console.error(error);
            return res.status(error.statusCode || 500).json({
                message: error.message || "Server error",
            });
        }
    }
);

router.get(
    "/team/active",
    verifyToken,
    verifyRole(["atasan"]),
    async (req, res) => {
        try {
            const { employee_id } = req.query;
            const managerScope = await resolveManagerScope(db, req.user.id);
            let query = buildActiveViolationListQuery({ scope: "team" });
            const params = [managerScope.departmentId, managerScope.managerEmployeeId];

            if (employee_id) {
                query = query.replace(
                    "AND e.id <> ?\n         ORDER BY wl.valid_until ASC, wl.issued_date DESC, wl.id DESC",
                    "AND e.id <> ?\n           AND wl.employee_id = ?\n         ORDER BY wl.valid_until ASC, wl.issued_date DESC, wl.id DESC",
                );
                params.push(employee_id);
            }

            const [rows] = await db.promise().query(query, params);

            return res.json({
                message: "Active team warning letters fetched successfully",
                total: rows.length,
                data: rows.map(mapViolationRow),
            });
        } catch (error) {
            console.error(error);
            return res.status(error.statusCode || 500).json({
                message: error.message || "Server error",
            });
        }
    }
);

router.get(
    "/:id",
    verifyToken,
    verifyRole(["hr", "admin"]),
    async (req, res) => {
        try {
            const { id } = req.params;
            const [rows] = await db.promise().query(
                `SELECT
                    wl.*,
                    COALESCE(e.full_name, u.name) AS employee_name,
                    e.employee_code,
                    e.npwp,
                    p.name AS position_name,
                    LOWER(COALESCE(p.level, '')) AS position_level,
                    d.name AS department_name,
                    GROUP_CONCAT(DISTINCT LOWER(r.name)) AS recipient_roles_csv
                FROM warning_letters wl
                JOIN employees e ON wl.employee_id = e.id
                JOIN users u ON e.user_id = u.id
                LEFT JOIN positions p ON e.position_id = p.id
                LEFT JOIN departments d ON p.department_id = d.id
                LEFT JOIN user_roles ur ON ur.user_id = u.id
                LEFT JOIN roles r ON r.id = ur.role_id
                WHERE wl.id = ?
                GROUP BY
                    wl.id,
                    employee_name,
                    e.employee_code,
                    e.npwp,
                    p.name,
                    p.level,
                    d.name`,
                [id]
            );

            const letter = rows[0];
            const adminContext = isAdminContext(req);
            if (
                adminContext &&
                !canAdminIssueForTarget({
                    roles_csv: letter.recipient_roles_csv,
                    position_level: letter.position_level,
                })
            ) {
                return res.status(403).json({
                    message:
                        "Direktur hanya dapat melihat SP untuk pegawai HR dengan level atasan/manager",
                });
            }

            return res.json({ data: letter });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Server error" });
        }
    }
);

router.post("/", verifyToken, verifyRole(["hr", "admin"]), async (req, res) => {
    try {
        const {
            employee_id,
            sp_level,
            reason,
            issued_date,
            evaluation_date,
            evaluation_time,
            evaluation_place,
        } = req.body;

        if (!employee_id) {
            return res.status(400).json({ message: "employee_id wajib diisi" });
        }

        const employeeData = await getEmployeeBaseData(employee_id);
        if (!employeeData) {
            return res.status(404).json({ message: "Pegawai tidak ditemukan" });
        }

        assertIssuerScope(req, employeeData);

        const normalizedIssuedDate = toDateOnly(issued_date || new Date());
        if (!normalizedIssuedDate) {
            return res.status(400).json({
                message: "Format issued_date tidak valid. Gunakan YYYY-MM-DD",
            });
        }

        const issuerRole = isAdminContext(req) ? "admin" : "hr";
        const issuerSignature = await getIssuerSignatureInfo(req.user.id, issuerRole);

        const normalizedRequestedLevel = normalizeSpLevel(sp_level);
        const isEvaluasiHR = normalizedRequestedLevel === "evaluasi_hr";

        if (isEvaluasiHR) {
            const violationContextEval = await getAlphaViolationContext(employee_id);
            const evalViolationDate = violationContextEval?.latestAlphaDate || normalizedIssuedDate;
            // For evaluation letters created by HR, store minimal metadata in evidence_snapshot
            const evalLetterNumber = await generateEvaluasiLetterNumber(normalizedIssuedDate);
            // Determine valid duration based on rule mapping if available
            let evalDurationMonths = 6;
            try {
                const [ruleRows] = await db.promise().query(
                    `SELECT sp_duration_months FROM attendance_warning_rules WHERE sanction_level COLLATE utf8mb4_unicode_ci = ? LIMIT 1`,
                    [normalizeSpLevel('evaluasi_hr')]
                );
                if (ruleRows && ruleRows[0] && ruleRows[0].sp_duration_months) {
                    evalDurationMonths = Number(ruleRows[0].sp_duration_months) || evalDurationMonths;
                }
            } catch (e) {
                // ignore and use default
            }

            const validUntilDateEval = new Date(normalizedIssuedDate);
            validUntilDateEval.setMonth(validUntilDateEval.getMonth() + evalDurationMonths);
            const validUntilEval = toDateOnly(validUntilDateEval);

            const evidenceSnapshot = {
                type: 'evaluasi_hr',
                letter_number: evalLetterNumber,
                evaluation_date: evaluation_date || null,
                evaluation_time: evaluation_time || null,
                evaluation_place: evaluation_place || null,
                signed_title: issuerSignature.signedTitle || null,
                signed_name: issuerSignature.signedName || null,
                valid_until: validUntilEval,
            };

            const [evalResult] = await db.promise().query(
                `INSERT INTO warning_letters (
                    auto_letter_number, sp_level, employee_id,
                    violation_date, issued_date, valid_until, status, evidence_snapshot, generated_by, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, 'active', ?, 'hr', NOW(), NOW())`,
                [
                    null,
                    'evaluasi_hr',
                    employee_id,
                    evalViolationDate,
                    normalizedIssuedDate,
                    validUntilEval,
                    JSON.stringify(evidenceSnapshot),
                ]
            );

            const [evalCreatedRows] = await db.promise().query(
                `SELECT wl.*, COALESCE(e.full_name, u.name) AS employee_name, e.employee_code, e.npwp, p.name AS position_name, d.name AS department_name
                 FROM warning_letters wl
                 JOIN employees e ON wl.employee_id = e.id
                 JOIN users u ON e.user_id = u.id
                 LEFT JOIN positions p ON e.position_id = p.id
                 LEFT JOIN departments d ON p.department_id = d.id
                 WHERE wl.id = ? LIMIT 1`,
                [evalResult.insertId]
            );

            return res.status(201).json({ message: 'Undangan evaluasi HR berhasil dibuat', data: evalCreatedRows[0] || null });
        }

        const violationContext = await getAlphaViolationContext(employee_id);
        if (!violationContext?.latestAlphaDate) {
            return res.status(400).json({
                message:
                    "Tanggal pelanggaran alpha tidak ditemukan. Pastikan pegawai memiliki data alpha terlebih dahulu.",
            });
        }

        const normalizedViolationDate =
            Number(violationContext.consecutiveAlphaDays || 0) > 1
                ? violationContext.streakStartDate
                : violationContext.latestAlphaDate;

        const inferredLevel =
            normalizeSpLevel(violationContext?.sanctionLevel) || "sp1";
        const normalizedSpLevel = normalizedRequestedLevel || inferredLevel;

        // For manual HR-created warning letters, store metadata-only (no PDF/content columns)
        const letterNumber = await generateLetterNumber(normalizedIssuedDate);
        // Determine duration from attendance_warning_rules for this SP level if present
        let durationMonths = 6;
        try {
            const [ruleRows] = await db.promise().query(
                `SELECT sp_duration_months FROM attendance_warning_rules WHERE sanction_level COLLATE utf8mb4_unicode_ci = ? LIMIT 1`,
                [normalizedSpLevel]
            );
            if (ruleRows && ruleRows[0] && ruleRows[0].sp_duration_months) {
                durationMonths = Number(ruleRows[0].sp_duration_months) || durationMonths;
            }
        } catch (e) {
            // ignore and use default
        }

        const validUntilDateManual = new Date(normalizedIssuedDate);
        validUntilDateManual.setMonth(validUntilDateManual.getMonth() + durationMonths);
        const validUntilManual = toDateOnly(validUntilDateManual);

        const evidenceSnapshot = {
            type: 'manual_warning',
            letter_number: letterNumber,
            sp_level: normalizedSpLevel,
            reason: reason || null,
            signed_title: issuerSignature.signedTitle || null,
            signed_name: issuerSignature.signedName || null,
            violation_date: normalizedViolationDate,
            issued_date: normalizedIssuedDate,
            valid_until: validUntilManual,
        };

        const [result] = await db.promise().query(
            `INSERT INTO warning_letters (
                auto_letter_number,
                sp_level,
                employee_id,
                violation_date,
                issued_date,
                valid_until,
                status,
                evidence_snapshot,
                generated_by,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, 'active', ?, 'hr', NOW(), NOW())`,
            [
                null,
                normalizedSpLevel,
                employee_id,
                normalizedViolationDate,
                normalizedIssuedDate,
                validUntilManual,
                JSON.stringify(evidenceSnapshot),
            ]
        );

        const [createdRows] = await db.promise().query(
            `SELECT wl.*,
                    COALESCE(e.full_name, u.name) AS employee_name,
                    e.employee_code,
                    e.npwp,
                    p.name AS position_name,
                      d.name AS department_name
             FROM warning_letters wl
             JOIN employees e ON wl.employee_id = e.id
             JOIN users u ON e.user_id = u.id
             LEFT JOIN positions p ON e.position_id = p.id
             LEFT JOIN departments d ON p.department_id = d.id
             WHERE wl.id = ?
             LIMIT 1`,
            [result.insertId]
        );

        return res.status(201).json({
            message: "Surat peringatan berhasil dibuat",
            data: createdRows[0] || null,
        });
    } catch (error) {
        console.error(error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Server error",
        });
    }
});

module.exports = router;
