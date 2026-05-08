const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const { resolveManagerScope } = require("../utils/managerScope");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const COMPANY_NAME = "PT OTAK KANAN";
const COMPANY_ADDRESS =
    "Graha Pena, Ruang 1503, Jl. Ahmad Yani No.88, Ketintang, Kec. Gayungan, Surabaya, Jawa Timur 60234";

const VALID_SP_LEVELS = ["sp1", "sp2", "sp3"];
const ALPHA_SANCTION_LEVEL = {
    NONE: "none",
    SP1: "sp1",
    SP2: "sp2",
    SP3: "sp3",
    EVALUASI_HR: "evaluasi_hr",
};
const WARNING_LETTER_UPLOAD_SUBDIR = "warning_letters";
const COMPANY_LOGO_PATH = path.join(
    __dirname,
    "../../frontend/src/assets/logo1.svg"
);

const getSanctionLevelFromAlphaCounts = ({
    alphaConsecutiveDays,
    alphaAccumulatedDays,
}) => {
    const consecutive = Number(alphaConsecutiveDays || 0);
    const accumulated = Number(alphaAccumulatedDays || 0);

    if (consecutive >= 7 || accumulated >= 7) {
        return ALPHA_SANCTION_LEVEL.EVALUASI_HR;
    }

    if (consecutive >= 6 || accumulated >= 6) {
        return ALPHA_SANCTION_LEVEL.SP3;
    }

    if (consecutive >= 5 || accumulated >= 5) {
        return ALPHA_SANCTION_LEVEL.SP2;
    }

    if (consecutive >= 3 || accumulated >= 3) {
        return ALPHA_SANCTION_LEVEL.SP1;
    }

    return ALPHA_SANCTION_LEVEL.NONE;
};

const getCompanyLogoDataUri = () => {
    try {
        const svg = fs.readFileSync(COMPANY_LOGO_PATH, "utf8");
        return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
    } catch (error) {
        return "";
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

const normalizeSpLevel = (value) => {
    const normalized = String(value || "").toLowerCase().trim();
    if (VALID_SP_LEVELS.includes(normalized)) {
        return normalized;
    }
    return null;
};

const toReadableSpLabel = (spLevel) => {
    const normalized = normalizeSpLevel(spLevel) || "sp1";
    if (normalized === "sp1") return "SURAT PERINGATAN PERTAMA (SP1)";
    if (normalized === "sp2") return "SURAT PERINGATAN KEDUA (SP2)";
    return "SURAT PERINGATAN KETIGA (SP3)";
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
        const logoDataUri = getCompanyLogoDataUri();
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
                <div class="header-row">
                    <div class="logo">${logoDataUri ? `<img src="${logoDataUri}" alt="Logo" style="width: 150px; height: auto;" />` : "<div style='font-weight:700;font-size:18px;'>PT OTAK KANAN</div>"}</div>
                    <div class="company">
                        <div class="company-name">PT OTAK KANAN</div>
                        <div style="font-size: 13px;">Graha Pena Building Lt.15 Suite 1503</div>
                        <div style="font-size: 13px;">Jl. Ahmad Yani No.88 Surabaya</div>
                        <div style="font-size: 13px;">Telp: (031) 8286155</div>
                    </div>
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
    violationDate,
    violationDateEnd,
    consecutiveAlphaDays,
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
            "Sehubungan dengan catatan pelanggaran kedisiplinan kehadiran yang telah mencapai tahap Surat Peringatan III (SP3), dengan ini Saudara diminta untuk menghadiri sesi Evaluasi HR.",
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

const normalizeUploadedFilePath = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return null;
    const normalized = raw.replace(/^\/+/, "");
    if (!normalized.startsWith("uploads/")) return null;
    return normalized;
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
        sanctionLevel: getSanctionLevelFromAlphaCounts({
            alphaConsecutiveDays: consecutiveAlphaDays,
            alphaAccumulatedDays,
        }),
    };
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

const saveWarningLetterToUploadFolder = async ({
    letterNumber,
    employeeId,
    issuedDate,
    letterContent,
}) => {
    const uploadDirectory = path.join(
        __dirname,
        `../uploads/${WARNING_LETTER_UPLOAD_SUBDIR}`
    );

    fs.mkdirSync(uploadDirectory, { recursive: true });

    const safeLetterNumber = String(letterNumber || "SP")
        .replace(/[^a-zA-Z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    const safeIssuedDate = String(issuedDate || "").replace(/[^0-9-]/g, "");

    const fileName = `sp-${safeLetterNumber}-${employeeId}-${safeIssuedDate}.pdf`;
    const absoluteFilePath = path.join(uploadDirectory, fileName);
    const relativeFilePath = `uploads/${WARNING_LETTER_UPLOAD_SUBDIR}/${fileName}`;

    await new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: "A4", margin: 56 });
        const writeStream = fs.createWriteStream(absoluteFilePath);

        writeStream.on("finish", resolve);
        writeStream.on("error", reject);
        doc.on("error", reject);

        doc.pipe(writeStream);
        doc.font("Helvetica").fontSize(11).text(stripHtmlToText(letterContent), {
            align: "left",
            lineGap: 4,
        });
        doc.end();
    });

    return relativeFilePath;
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

router.get("/", verifyToken, verifyRole(["hr", "admin"]), async (req, res) => {
    try {
        const { employee_id } = req.query;

        let query = `SELECT
                wl.id,
                wl.letter_number,
                wl.sp_level,
                wl.employee_id,
                wl.issued_by_user_id,
                wl.issued_by_role,
                wl.violation_date,
                wl.issued_date,
                wl.valid_until,
                wl.status,
                wl.reason,
                wl.signed_title,
                wl.signed_name,
                wl.letter_content,
                wl.file_path,
                COALESCE(e.full_name, u.name) AS employee_name,
                e.employee_code,
                e.npwp,
                p.name AS position_name,
                LOWER(COALESCE(p.level, '')) AS position_level,
                d.name AS department_name,
                GROUP_CONCAT(DISTINCT LOWER(r.name)) AS recipient_roles_csv,
                issuer.name AS issued_by_name
            FROM warning_letters wl
            JOIN employees e ON wl.employee_id = e.id
            JOIN users u ON e.user_id = u.id
            LEFT JOIN positions p ON e.position_id = p.id
            LEFT JOIN departments d ON p.department_id = d.id
            LEFT JOIN user_roles ur ON ur.user_id = u.id
            LEFT JOIN roles r ON r.id = ur.role_id
            LEFT JOIN users issuer ON issuer.id = wl.issued_by_user_id
            WHERE 1=1`;

        const params = [];

        if (employee_id) {
            query += " AND wl.employee_id = ?";
            params.push(employee_id);
        }

        query += `
            GROUP BY
                wl.id,
                wl.letter_number,
                wl.sp_level,
                wl.employee_id,
                wl.issued_by_user_id,
                wl.issued_by_role,
                wl.violation_date,
                wl.issued_date,
                wl.valid_until,
                wl.status,
                wl.reason,
                wl.signed_title,
                wl.signed_name,
                wl.letter_content,
                wl.file_path,
                employee_name,
                e.employee_code,
                e.npwp,
                p.name,
                p.level,
                d.name,
                issuer.name
            ORDER BY wl.issued_date DESC, wl.id DESC`;

        const [rows] = await db.promise().query(query, params);

        const adminContext = isAdminContext(req);
        const filtered = adminContext
            ? rows.filter((row) => canAdminIssueForTarget({
                  roles_csv: row.recipient_roles_csv,
                  position_level: row.position_level,
              }))
            : rows;

        res.json({
            message: "Warning letters fetched successfully",
            total: filtered.length,
            data: filtered,
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
                wl.letter_number,
                wl.sp_level,
                wl.employee_id,
                wl.violation_date,
                wl.issued_date,
                wl.valid_until,
                wl.status,
                wl.reason,
                wl.signed_title,
                wl.signed_name,
                wl.letter_content,
                wl.file_path,
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

        return res.json({
            message: "My warning letters fetched successfully",
            total: rows.length,
            data: rows,
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
                    wl.letter_number,
                    wl.sp_level,
                    wl.employee_id,
                    wl.issued_by_user_id,
                    wl.issued_by_role,
                    wl.violation_date,
                    wl.issued_date,
                    wl.valid_until,
                    wl.status,
                    wl.reason,
                    wl.signed_title,
                    wl.signed_name,
                    wl.letter_content,
                    wl.file_path,
                    wl.created_at,
                    COALESCE(e.full_name, u.name) AS employee_name,
                    e.employee_code,
                    e.npwp,
                    p.name AS position_name,
                    d.name AS department_name,
                    issuer.name AS issued_by_name
                FROM warning_letters wl
                JOIN employees e ON wl.employee_id = e.id
                JOIN users u ON e.user_id = u.id
                LEFT JOIN positions p ON e.position_id = p.id
                LEFT JOIN departments d ON p.department_id = d.id
                LEFT JOIN users issuer ON issuer.id = wl.issued_by_user_id
                WHERE p.department_id = ?
                  AND e.id <> ?
                  AND LOWER(COALESCE(wl.issued_by_role, '')) = 'hr'`;

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

            return res.json({
                message: "Team warning letters fetched successfully",
                total: rows.length,
                data: rows,
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
                    GROUP_CONCAT(DISTINCT LOWER(r.name)) AS recipient_roles_csv,
                    issuer.name AS issued_by_name
                FROM warning_letters wl
                JOIN employees e ON wl.employee_id = e.id
                JOIN users u ON e.user_id = u.id
                LEFT JOIN positions p ON e.position_id = p.id
                LEFT JOIN departments d ON p.department_id = d.id
                LEFT JOIN user_roles ur ON ur.user_id = u.id
                LEFT JOIN roles r ON r.id = ur.role_id
                LEFT JOIN users issuer ON issuer.id = wl.issued_by_user_id
                WHERE wl.id = ?
                GROUP BY
                    wl.id,
                    employee_name,
                    e.employee_code,
                    e.npwp,
                    wl.file_path,
                    p.name,
                    p.level,
                    d.name,
                    issuer.name`,
                [id]
            );

            if (!rows.length) {
                return res.status(404).json({ message: "Surat peringatan tidak ditemukan" });
            }

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
            file_path,
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
        const uploadedFilePath = normalizeUploadedFilePath(file_path);

        const isEvaluasiHR = String(sp_level || "").toLowerCase().trim() === "evaluasi_hr";

        if (isEvaluasiHR) {
            const violationContextEval = await getAlphaViolationContext(employee_id);
            const evalViolationDate = violationContextEval?.latestAlphaDate || normalizedIssuedDate;

            const evalLetterNumber = await generateEvaluasiLetterNumber(normalizedIssuedDate);
            const evalLetterContent = buildEvaluasiHRContent({
                letterNumber: evalLetterNumber,
                employee: employeeData,
                evaluationDate: evaluation_date,
                evaluationTime: evaluation_time,
                evaluationPlace: evaluation_place || "Ruang HR / Kantor HRD",
                issuedDate: normalizedIssuedDate,
                signedTitle: issuerSignature.signedTitle,
                signedName: issuerSignature.signedName,
            });

            const evalFilePath = uploadedFilePath || (await saveWarningLetterToUploadFolder({
                letterNumber: evalLetterNumber,
                employeeId: employee_id,
                issuedDate: normalizedIssuedDate,
                letterContent: evalLetterContent,
            }));

            const [evalResult] = await db.promise().query(
                `INSERT INTO warning_letters (
                    letter_number, sp_level, employee_id, issued_by_user_id, issued_by_role,
                    company_name, company_address, violation_date, issued_date, valid_until,
                    status, reason, signed_title, signed_name, letter_content, file_path,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NULL, ?, ?, ?, ?, NOW(), NOW())`,
                [
                    evalLetterNumber, "evaluasi_hr", employee_id, req.user.id, issuerRole,
                    COMPANY_NAME, COMPANY_ADDRESS, evalViolationDate, normalizedIssuedDate, normalizedIssuedDate,
                    issuerSignature.signedTitle, issuerSignature.signedName, evalLetterContent, evalFilePath,
                ]
            );

            const [evalCreatedRows] = await db.promise().query(
                `SELECT wl.*,
                        COALESCE(e.full_name, u.name) AS employee_name,
                        e.employee_code,
                        e.npwp,
                        p.name AS position_name,
                        d.name AS department_name,
                        wl.file_path
                 FROM warning_letters wl
                 JOIN employees e ON wl.employee_id = e.id
                 JOIN users u ON e.user_id = u.id
                 LEFT JOIN positions p ON e.position_id = p.id
                 LEFT JOIN departments d ON p.department_id = d.id
                 WHERE wl.id = ?
                 LIMIT 1`,
                [evalResult.insertId]
            );

            return res.status(201).json({
                message: "Undangan evaluasi HR berhasil dibuat",
                data: evalCreatedRows[0] || null,
            });
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
        const normalizedSpLevel = normalizeSpLevel(sp_level) || inferredLevel;

        const letterNumber = await generateLetterNumber(normalizedIssuedDate);

        const validUntilDate = new Date(normalizedIssuedDate);
        validUntilDate.setMonth(validUntilDate.getMonth() + 6);
        const validUntil = toDateOnly(validUntilDate);

        const letterContent = buildWarningLetterContent({
            letterNumber,
            spLevel: normalizedSpLevel,
            employee: employeeData,
            violationDate: normalizedViolationDate,
            violationDateEnd: violationContext.streakEndDate,
            consecutiveAlphaDays: violationContext.consecutiveAlphaDays,
            reason,
            issuedDate: normalizedIssuedDate,
            signedTitle: issuerSignature.signedTitle,
            signedName: issuerSignature.signedName,
        });
        const filePath = uploadedFilePath || (await saveWarningLetterToUploadFolder({
            letterNumber,
            employeeId: employee_id,
            issuedDate: normalizedIssuedDate,
            letterContent,
        }));

        const [result] = await db.promise().query(
            `INSERT INTO warning_letters (
                letter_number,
                sp_level,
                employee_id,
                issued_by_user_id,
                issued_by_role,
                company_name,
                company_address,
                violation_date,
                issued_date,
                valid_until,
                status,
                reason,
                signed_title,
                signed_name,
                letter_content,
                file_path,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                letterNumber,
                normalizedSpLevel,
                employee_id,
                req.user.id,
                issuerRole,
                COMPANY_NAME,
                COMPANY_ADDRESS,
                normalizedViolationDate,
                normalizedIssuedDate,
                validUntil,
                reason || null,
                issuerSignature.signedTitle,
                issuerSignature.signedName,
                letterContent,
                filePath,
            ]
        );

        const [createdRows] = await db.promise().query(
            `SELECT wl.*,
                    COALESCE(e.full_name, u.name) AS employee_name,
                    e.employee_code,
                    e.npwp,
                    p.name AS position_name,
                          d.name AS department_name,
                          wl.file_path
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
