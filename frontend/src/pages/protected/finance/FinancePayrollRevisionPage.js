import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { setPageTitle } from "../../../features/common/headerSlice";
import TitleCard from "../../../components/Cards/TitleCard";
import Pagination from "../../../components/Pagination/Pagination";
import { financeApi } from "../../../features/finance/api";
import { resolveFixedPositionAllowance } from "../../../utils/fixedPositionAllowance";
import { calculateWorkdaysInMonth } from "../../../utils/attendanceUtils";
import useTablePagination from "../../../hooks/useTablePagination";
import useAppPopup from "../../../hooks/useAppPopup";

const getCurrentPeriod = () => {
  const now = new Date();
  return {
    month: String(now.getMonth() + 1),
    year: String(now.getFullYear()),
  };
};

const formatCurrency = (value) =>
  `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

const formatPercent = (value) =>
  `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(Number(value || 0) * 100)}%`;

const normalizePercentValue = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return parsed >= 1 ? parsed / 100 : parsed;
};

const formatLateDuration = (value) => {
  const minutes = Number(value || 0);
  const totalSeconds = Math.round(minutes * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const remainingAfterHours = totalSeconds % 3600;
  const displayMinutes = Math.floor(remainingAfterHours / 60);
  const seconds = remainingAfterHours % 60;

  return `${hours} jam ${displayMinutes} menit ${seconds} detik`;
};

const monthOptions = [
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

const statusBadgeClass = {
  draft: "badge-warning",
  published: "badge-info",
  claimed: "badge-success",
};

const AUTO_TAX_RATE = 0.03;
const DEFAULT_WORKING_HOURS_PER_DAY = 8;

const defaultPayrollSettings = {
  transport_per_day: 50000,
  meal_per_day: 25000,
  health_percentage: 0.01,
  bpjs_percentage: 0.01,
  tax: AUTO_TAX_RATE,
  late_deduction_percentage: 0.02,
  alpha_deduction_percentage: 1,
};

const resolvePhotoUrl = (photoPath) => {
  if (!photoPath) return null;

  if (/^https?:\/\//i.test(photoPath)) {
    return photoPath;
  }

  const baseUrl = (
    process.env.REACT_APP_BASE_URL || "http://localhost:5000"
  ).replace(/\/$/, "");
  return `${baseUrl}/${String(photoPath).replace(/^\/+/, "")}`;
};

const toSafeArray = (value) => {
  if (Array.isArray(value)) {
    return value.filter((item) => item !== null && item !== undefined);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.filter((item) => item !== null && item !== undefined)
        : [];
    } catch (error) {
      return [];
    }
  }

  return [];
};

const getApprovedReviewItemsFromAppeal = (appealDetail) => {
  const appealReasonItems = toSafeArray(appealDetail?.appeal_reason_items)
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      reason_key: String(item.appeal_reason_item || "").trim(),
      label: String(
        item.appeal_reason_label || item.appeal_reason_item || "",
      ).trim(),
    }));

  const normalizeLabel = (value) =>
    String(value || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

  const findReasonKeyByLabel = (label) => {
    const normalizedTarget = normalizeLabel(label);
    if (!normalizedTarget) return "";

    const exactMatch = appealReasonItems.find(
      (item) => normalizeLabel(item.label) === normalizedTarget,
    );
    if (exactMatch?.reason_key) return exactMatch.reason_key;

    const partialMatch = appealReasonItems.find(
      (item) =>
        normalizeLabel(item.label).includes(normalizedTarget) ||
        normalizedTarget.includes(normalizeLabel(item.label)),
    );
    return partialMatch?.reason_key || "";
  };

  const approvedFromItems = toSafeArray(appealDetail?.review_result_items)
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      label: String(
        item.label || item.appeal_reason_label || item.appeal_reason_item || "",
      ).trim(),
      reason_key: String(
        item.reason_key || item.appeal_reason_item || "",
      ).trim(),
      decision: String(item.decision || item.status || "").toLowerCase(),
      adjustment_amount: Number(item.adjustment_amount || 0),
    }))
    .map((item) => ({
      ...item,
      reason_key: item.reason_key || findReasonKeyByLabel(item.label),
    }))
    .filter((item) =>
      ["approve", "approved", "disetujui"].includes(item.decision),
    );

  if (approvedFromItems.length > 0) {
    return approvedFromItems;
  }

  const rawNotes = String(appealDetail?.review_notes || "").trim();
  if (!rawNotes) return [];

  const approvedMatches = Array.from(
    rawNotes.matchAll(
      /\[(.+?)\]\s*disetujui,\s*nominal\s*perbaikan\s*:\s*([0-9.,]+)/gi,
    ),
  );

  if (approvedMatches.length > 0) {
    return approvedMatches.map((match) => {
      const label = String(match?.[1] || "Komponen Revisi").trim();
      const amountRaw = String(match?.[2] || "0");
      return {
        label,
        reason_key: findReasonKeyByLabel(label),
        decision: "approve",
        adjustment_amount:
          Number(amountRaw.replace(/\./g, "").replace(/,/g, ".")) || 0,
      };
    });
  }

  return rawNotes
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && /disetujui/i.test(line))
    .map((line) => {
      const labelMatch = line.match(/^\[(.*?)\]/);
      const amountMatch = line.match(
        /(?:nominal\s*perbaikan\s*:?\s*)(\d+[\d.,]*)/i,
      );

      const label = String(labelMatch?.[1] || "Komponen Revisi").trim();
      return {
        label,
        reason_key: findReasonKeyByLabel(label),
        decision: "approve",
        adjustment_amount: amountMatch
          ? Number(
              String(amountMatch[1]).replace(/\./g, "").replace(/,/g, "."),
            ) || 0
          : 0,
      };
    });
};

const resolveCorrectedValueByLabel = (
  label,
  reasonKey,
  payrollPreview,
  fallbackAmount,
) => {
  const normalizedReasonKey = String(reasonKey || "").toLowerCase();

  if (normalizedReasonKey === "bonus")
    return Number(payrollPreview?.bonus || 0);
  if (normalizedReasonKey === "other_allowance") {
    return Number(payrollPreview?.otherAllowance || 0);
  }
  if (normalizedReasonKey === "other_deduction") {
    return Number(payrollPreview?.otherDeduction || 0);
  }

  return Number(fallbackAmount || 0);
};

const resolveManualFieldByLabel = (label, reasonKey) => {
  const normalizedReasonKey = String(reasonKey || "").toLowerCase();
  if (normalizedReasonKey === "bonus") return "bonus";
  if (normalizedReasonKey === "other_allowance") return "other_allowance";
  if (normalizedReasonKey === "other_deduction") return "other_deduction";

  return null;
};

const revisionComponentDefinitions = [
  {
    label: "Gaji Pokok",
    key: "basicSalary",
    group: "Pendapatan",
    reasonKeys: ["basic_salary", "salary", "gaji_pokok"],
  },
  {
    label: "Tunjangan Transport",
    key: "transportAllowance",
    group: "Pendapatan",
    reasonKeys: ["transport_allowance", "transport"],
  },
  {
    label: "Makan",
    key: "mealAllowance",
    group: "Pendapatan",
    reasonKeys: ["meal_allowance", "meal", "makan"],
  },
  {
    label: "Tunjangan Kesehatan",
    key: "healthAllowance",
    group: "Pendapatan",
    reasonKeys: ["health_allowance", "health", "kesehatan"],
  },
  {
    label: "Bonus",
    key: "bonus",
    group: "Pendapatan",
    reasonKeys: ["bonus"],
  },
  {
    label: "Tunjangan Jabatan",
    key: "otherAllowance",
    group: "Pendapatan",
    reasonKeys: ["other_allowance", "position_allowance", "tunjangan_lain"],
  },
  {
    label: "Total Tunjangan",
    key: "allowanceTotal",
    group: "Pendapatan",
    reasonKeys: ["allowance", "total_allowance", "total_tunjangan"],
  },
  {
    label: "Gaji Kotor",
    key: "grossSalary",
    group: "Pendapatan",
    reasonKeys: ["gross_salary", "gaji_kotor"],
  },
  {
    label: "Total Reimbursement",
    key: "reimbursement",
    group: "Pendapatan",
    reasonKeys: ["reimbursement", "reimbursement_total"],
  },
  {
    label: "Potongan Keterlambatan",
    key: "lateDeduction",
    group: "Potongan",
    reasonKeys: ["late_deduction", "late", "keterlambatan"],
  },
  {
    label: "Potongan Alpha",
    key: "alphaDeduction",
    group: "Potongan",
    reasonKeys: ["absent_deduction", "alpha_deduction", "alpha"],
  },
  {
    label: "Potongan Cuti Tidak Dibayar",
    key: "absentDeduction",
    group: "Potongan",
    reasonKeys: ["unpaid_leave_deduction", "unpaid_leave"],
  },
  {
    label: "Potongan BPJS",
    key: "bpjsDeduction",
    group: "Potongan",
    reasonKeys: ["bpjs_deduction", "bpjs"],
  },
  {
    label: "Potongan Pajak",
    key: "taxDeduction",
    group: "Potongan",
    reasonKeys: ["tax_deduction", "tax", "pajak"],
  },
  {
    label: "Potongan Lain",
    key: "otherDeduction",
    group: "Potongan",
    reasonKeys: ["other_deduction", "potongan_lain"],
  },
  {
    label: "Total Potongan",
    key: "totalDeduction",
    group: "Potongan",
    reasonKeys: ["deduction", "total_deduction", "total_potongan"],
  },
];

const normalizeRevisionText = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const findRevisionComponentDefinition = (item) => {
  const reasonKey = normalizeRevisionText(item?.reason_key);
  const label = normalizeRevisionText(item?.label);
  const manualField = resolveManualFieldByLabel(item?.label, item?.reason_key);
  const manualFieldKeyMap = {
    bonus: "bonus",
    other_allowance: "otherAllowance",
    other_deduction: "otherDeduction",
  };

  if (manualFieldKeyMap[manualField]) {
    return revisionComponentDefinitions.find(
      (definition) => definition.key === manualFieldKeyMap[manualField],
    );
  }

  return revisionComponentDefinitions.find((definition) => {
    const definitionLabel = normalizeRevisionText(definition.label);
    const reasonMatch = definition.reasonKeys.some(
      (key) => normalizeRevisionText(key) === reasonKey,
    );
    const labelMatch =
      label &&
      (label === definitionLabel ||
        label.includes(definitionLabel) ||
        definitionLabel.includes(label));

    return reasonMatch || labelMatch;
  });
};

const applyApprovedRevisionAdjustmentsToPreview = (preview, approvedItems) => {
  if (!preview || !approvedItems?.length) {
    return preview;
  }

  const adjustmentMap = approvedItems.reduce((accumulator, item) => {
    const targetComponent = findRevisionComponentDefinition(item);
    if (!targetComponent?.key) {
      return accumulator;
    }

    const amount = Number(item.adjustment_amount || 0);
    const currentAdjustment = accumulator[targetComponent.key] || {
      amount: 0,
      group: targetComponent.group,
    };

    accumulator[targetComponent.key] = {
      ...currentAdjustment,
      amount:
        currentAdjustment.amount + (Number.isFinite(amount) ? amount : 0),
    };
    return accumulator;
  }, {});

  if (Object.keys(adjustmentMap).length === 0) {
    return preview;
  }

  const next = { ...preview };
  const hasAdjustment = (key) =>
    Object.prototype.hasOwnProperty.call(adjustmentMap, key);

  Object.entries(adjustmentMap).forEach(([key, adjustment]) => {
    const currentValue = Number(preview?.[key] || 0);
    const amount = Number(adjustment.amount || 0);
    next[key] =
      adjustment.group === "Potongan"
        ? Math.max(0, Number((currentValue - amount).toFixed(2)))
        : Number((currentValue + amount).toFixed(2));
  });

  next.allowanceTotal = hasAdjustment("allowanceTotal")
    ? Number(next.allowanceTotal || 0)
    : Number(
        (
          Number(next.transportAllowance || 0) +
          Number(next.mealAllowance || 0) +
          Number(next.healthAllowance || 0) +
          Number(next.bonus || 0) +
          Number(next.otherAllowance || 0)
        ).toFixed(2),
      );

  next.grossSalary = hasAdjustment("grossSalary")
    ? Number(next.grossSalary || 0)
    : Number((Number(next.basicSalary || 0) + next.allowanceTotal).toFixed(2));

  next.totalIncome = Number(
    (next.grossSalary + Number(next.reimbursement || 0)).toFixed(2),
  );

  if (
    !hasAdjustment("absentDeduction") &&
    (hasAdjustment("alphaDeduction") || hasAdjustment("unpaidLeaveDeduction"))
  ) {
    next.absentDeduction = Number(
      (
        Number(next.alphaDeduction || 0) +
        Number(next.unpaidLeaveDeduction || 0)
      ).toFixed(2),
    );
  }

  next.totalDeduction = hasAdjustment("totalDeduction")
    ? Number(next.totalDeduction || 0)
    : Number(
        (
          Number(next.lateDeduction || 0) +
          Number(next.absentDeduction || 0) +
          Number(next.bpjsDeduction || 0) +
          Number(next.taxDeduction || 0) +
          Number(next.otherDeduction || 0)
        ).toFixed(2),
      );

  next.netSalary = Number((next.totalIncome - next.totalDeduction).toFixed(2));

  return next;
};

function FinancePayroll({ isRevisionPage = false }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { popup, confirmPopup } = useAppPopup();

  const period = getCurrentPeriod();
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingPublishAll, setLoadingPublishAll] = useState(false);
  const [loadingReferenceData, setLoadingReferenceData] = useState(false);
  const [loadingMonthlyRows, setLoadingMonthlyRows] = useState(false);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [periodMonth, setPeriodMonth] = useState(period.month);
  const [periodYear, setPeriodYear] = useState(period.year);
  const [recapMonth, setRecapMonth] = useState(period.month);
  const [manualInput, setManualInput] = useState({
    bonus: "",
    other_allowance: "",
    other_deduction: "",
  });

  const [currentEmployeePayrollRows, setCurrentEmployeePayrollRows] = useState(
    [],
  );
  const [latestGenerated, setLatestGenerated] = useState(null);
  const [monthlyPayrollRows, setMonthlyPayrollRows] = useState([]);
  const [selectedPayrollPdf, setSelectedPayrollPdf] = useState(null);
  const [employeeReferenceData, setEmployeeReferenceData] = useState([]);
  const [attendanceSummaryData, setAttendanceSummaryData] = useState([]);
  const [reimbursements, setReimbursements] = useState([]);
  const [managerAdjustments, setManagerAdjustments] = useState([]);
  const [payrollSettings, setPayrollSettings] = useState(
    defaultPayrollSettings,
  );
  const [isAppealRevisionMode, setIsAppealRevisionMode] = useState(false);
  const [appealRevisionId, setAppealRevisionId] = useState("");
  const [revisionAppealDetail, setRevisionAppealDetail] = useState(null);
  const [hasAppliedRevisionAutofill, setHasAppliedRevisionAutofill] =
    useState(false);

  const selectedEmployeeReferenceForAllowance =
    employeeReferenceData.find(
      (item) => String(item.employee_id) === String(selectedEmployeeId),
    ) || null;
  const fixedOtherAllowance = Number(
    resolveFixedPositionAllowance(selectedEmployeeReferenceForAllowance) || 0,
  );

  const mapPayrollRowToPreview = (row) => {
    if (!row) return null;

    const totalAbsentDays = Number(row.total_absent_days || 0);
    const totalAlphaDays = Number(row.total_alpha_days || 0);
    const totalUnpaidLeaveDays = Number(row.total_unpaid_leave_days || 0);
    const permissionDays = Number(row.total_izin_days || 0);
    const sickDays = Number(row.total_sakit_days || 0);
    const alphaDays =
      totalAlphaDays || Math.max(0, totalAbsentDays - totalUnpaidLeaveDays);
    const unpaidLeaveDays =
      totalUnpaidLeaveDays || Math.max(0, totalAbsentDays - alphaDays);

    return {
      mode: "actual",
      basicSalary: Number(row.basic_salary || 0),
      transportAllowance: Number(row.transport_allowance || 0),
      mealAllowance: Number(row.meal_allowance || 0),
      healthAllowance: Number(row.health_allowance || 0),
      bonus: Number(row.bonus || 0),
      otherAllowance: Number(row.other_allowance || 0),
      allowanceTotal: Number(row.allowance || 0),
      grossSalary: Number(row.gross_salary || 0),
      reimbursement: Number(row.reimbursement_total || 0),
      totalIncome: Number(row.total_income || 0),
      lateDeduction: Number(row.late_deduction || 0),
      absentDeduction: Number(row.absent_deduction || 0),
      alphaDeduction: Number(row.alpha_deduction ?? row.absent_deduction ?? 0),
      unpaidLeaveDeduction: Number(row.unpaid_leave_deduction || 0),
      bpjsDeduction: Number(row.bpjs_deduction || 0),
      taxDeduction: Number(row.tax_deduction || 0),
      otherDeduction: Number(row.other_deduction || 0),
      totalDeduction: Number(row.deduction || 0),
      netSalary: Number(row.final_amount || row.net_salary || 0),
      presentDays: Number(row.present_days || 0),
      alphaDays,
      unpaidLeaveDays,
      permissionDays,
      sickDays,
      deductibleAbsentDays: totalAbsentDays,
      totalLateMinutes: 0,
    };
  };

  useEffect(() => {
    dispatch(
      setPageTitle({
        title: isRevisionPage ? "Revisi Payroll Finance" : "Payroll Finance",
      }),
    );
  }, [dispatch, isRevisionPage]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const source = searchParams.get("source");
    const employeeIdFromQuery = searchParams.get("employee_id");
    const monthFromQuery = searchParams.get("month");
    const yearFromQuery = searchParams.get("year");
    const appealIdFromQuery = searchParams.get("appeal_id");

    if (source !== "salary-appeal") {
      setIsAppealRevisionMode(false);
      setAppealRevisionId("");
      setRevisionAppealDetail(null);
      setHasAppliedRevisionAutofill(false);

      if (monthFromQuery) {
        setPeriodMonth(monthFromQuery);
        setRecapMonth(monthFromQuery);
      }

      if (yearFromQuery) {
        setPeriodYear(yearFromQuery);
      }

      return;
    }

    setIsAppealRevisionMode(true);
    setAppealRevisionId(appealIdFromQuery || "");
    setRevisionAppealDetail(location.state?.appeal || null);
    setHasAppliedRevisionAutofill(false);

    if (employeeIdFromQuery) {
      setSelectedEmployeeId(employeeIdFromQuery);
    }

    if (monthFromQuery) {
      setPeriodMonth(monthFromQuery);
      setRecapMonth(monthFromQuery);
    }

    if (yearFromQuery) {
      setPeriodYear(yearFromQuery);
    }

    setError("");
    setSuccessMessage(
      `Mode revisi banding gaji aktif. Silakan ubah nominal lalu klik ${isRevisionPage ? "Kirim" : "Buat Slip Gaji"}.`,
    );
  }, [location.search, location.state, isRevisionPage]);

  useEffect(() => {
    const loadRevisionAppealDetail = async () => {
      if (!isAppealRevisionMode || revisionAppealDetail || !appealRevisionId) {
        return;
      }

      try {
        const result = await financeApi.getSalaryAppeals({
          status: "approved",
        });
        const target = (result?.data || []).find(
          (item) => String(item.id) === String(appealRevisionId),
        );

        if (target) {
          setRevisionAppealDetail(target);
          if (target.employee_id) {
            setSelectedEmployeeId(String(target.employee_id));
          }
        }
      } catch (err) {
        // no-op, existing UI already has error handling on primary actions
      }
    };

    loadRevisionAppealDetail();
  }, [isAppealRevisionMode, revisionAppealDetail, appealRevisionId]);

  useEffect(() => {
    const loadRevisionPayrollById = async () => {
      if (!isAppealRevisionMode || !revisionAppealDetail?.payroll_id) {
        return;
      }

      try {
        const payrollById = await financeApi.getPayrollById(
          revisionAppealDetail.payroll_id,
        );

        if (payrollById?.id) {
          setSelectedEmployeeId(String(payrollById.employee_id || ""));
          setPeriodMonth(String(payrollById.period_month || periodMonth));
          setPeriodYear(String(payrollById.period_year || periodYear));
          setCurrentEmployeePayrollRows([payrollById]);
        }
      } catch (err) {
        // no-op
      }
    };

    loadRevisionPayrollById();
  }, [isAppealRevisionMode, revisionAppealDetail, periodMonth, periodYear]);

  useEffect(() => {
    const payrollForAutofill =
      latestGenerated?.payroll_id &&
      String(latestGenerated?.employee?.id) === String(selectedEmployeeId)
        ? null
        : currentEmployeePayrollRows[0] || null;

    // Wait until reference data is loaded so manager adjustment fallback is reliable.
    if (loadingReferenceData) {
      return;
    }

    if (
      !isAppealRevisionMode ||
      hasAppliedRevisionAutofill ||
      !revisionAppealDetail ||
      !payrollForAutofill
    ) {
      return;
    }

    const approvedItemsForAutofill =
      getApprovedReviewItemsFromAppeal(revisionAppealDetail);

    const approvedFieldAmountMap = approvedItemsForAutofill.reduce(
      (accumulator, item) => {
        const fieldName = resolveManualFieldByLabel(
          item.label,
          item.reason_key,
        );
        if (!fieldName) {
          return accumulator;
        }

        const amount = Number(item.adjustment_amount || 0);
        accumulator[fieldName] = Number.isFinite(amount)
          ? amount
          : Number(accumulator[fieldName] || 0);
        return accumulator;
      },
      {},
    );

    const currentEmployeeId = String(selectedEmployeeId || "");
    const adjustmentCandidates = managerAdjustments.filter(
      (item) => String(item.employee_id) === currentEmployeeId,
    );
    const priority = {
      submitted: 1,
      approved: 2,
      draft: 3,
      rejected: 4,
    };
    const selectedAdjustment =
      [...adjustmentCandidates].sort((a, b) => {
        const scoreA = priority[String(a.status || "").toLowerCase()] || 99;
        const scoreB = priority[String(b.status || "").toLowerCase()] || 99;
        if (scoreA !== scoreB) return scoreA - scoreB;

        const dateA = new Date(a.submitted_at || a.updated_at || 0).getTime();
        const dateB = new Date(b.submitted_at || b.updated_at || 0).getTime();
        return dateB - dateA;
      })[0] || null;

    const fallbackBonus = Number(
      selectedAdjustment?.bonus ?? payrollForAutofill.bonus ?? 0,
    );
    const fallbackOtherDeduction = Number(
      selectedAdjustment?.other_deduction ??
        payrollForAutofill.other_deduction ??
        0,
    );
    const fallbackOtherAllowance = Number(
      selectedAdjustment?.other_allowance ??
        payrollForAutofill.other_allowance ??
        fixedOtherAllowance ??
        0,
    );

    setManualInput({
      bonus: String(approvedFieldAmountMap.bonus ?? fallbackBonus),
      other_allowance: String(fallbackOtherAllowance),
      other_deduction: String(
        approvedFieldAmountMap.other_deduction ?? fallbackOtherDeduction,
      ),
    });

    if (Object.keys(approvedFieldAmountMap).length > 0) {
      setSuccessMessage(
        "Nominal komponen yang disetujui reviewer sudah otomatis dimasukkan ke field revisi terkait.",
      );
    } else if (approvedItemsForAutofill.length > 0) {
      setSuccessMessage(
        "Ada komponen banding yang tidak terkait field editable (bonus/tunjangan lainnya/potongan lainnya), jadi tidak diisikan otomatis ke field manual.",
      );
    }

    setHasAppliedRevisionAutofill(true);
  }, [
    isAppealRevisionMode,
    hasAppliedRevisionAutofill,
    revisionAppealDetail,
    latestGenerated,
    selectedEmployeeId,
    currentEmployeePayrollRows,
    managerAdjustments,
    fixedOtherAllowance,
    loadingReferenceData,
  ]);

  useEffect(() => {
    if (!successMessage) return undefined;

    const timeoutId = setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [successMessage]);

  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        setLoadingReferenceData(true);
        const [
          attendanceSummaryResult,
          reimbursementsResult,
          payrollSettingsResult,
          employeeReferenceResult,
          managerAdjustmentsResult,
        ] = await Promise.allSettled([
          financeApi.getAttendanceSummaryAll({
            month: Number(periodMonth),
            year: Number(periodYear),
          }),
          financeApi.getReimbursements(),
          financeApi.getPayrollSettings(),
          financeApi.getEmployeeReferences(),
          financeApi.getPayrollManagerAdjustments({
            month: Number(periodMonth),
            year: Number(periodYear),
          }),
        ]);

        const attendanceRows =
          attendanceSummaryResult.status === "fulfilled"
            ? attendanceSummaryResult.value
            : [];
        const reimbursementRows =
          reimbursementsResult.status === "fulfilled"
            ? reimbursementsResult.value
            : [];
        const payrollSettingsRow =
          payrollSettingsResult.status === "fulfilled"
            ? payrollSettingsResult.value
            : defaultPayrollSettings;
        const employeeRows =
          employeeReferenceResult.status === "fulfilled"
            ? employeeReferenceResult.value
            : [];
        const managerAdjustmentRows =
          managerAdjustmentsResult.status === "fulfilled"
            ? managerAdjustmentsResult.value?.data || []
            : [];

        setAttendanceSummaryData(attendanceRows);
        setReimbursements(reimbursementRows);
        setEmployeeReferenceData(employeeRows);
        setManagerAdjustments(managerAdjustmentRows);
        setPayrollSettings({
          transport_per_day: Number(
            payrollSettingsRow?.transport_per_day ??
              defaultPayrollSettings.transport_per_day,
          ),
          meal_per_day: Number(
            payrollSettingsRow?.meal_per_day ??
              defaultPayrollSettings.meal_per_day,
          ),
          health_percentage: normalizePercentValue(
            payrollSettingsRow?.health_percentage ??
              defaultPayrollSettings.health_percentage,
          ),
          bpjs_percentage: normalizePercentValue(
            payrollSettingsRow?.bpjs_percentage ??
              defaultPayrollSettings.bpjs_percentage,
          ),
          tax: normalizePercentValue(
            payrollSettingsRow?.tax ?? defaultPayrollSettings.tax,
          ),
          late_deduction_percentage: normalizePercentValue(
            payrollSettingsRow?.late_deduction_percentage ??
              defaultPayrollSettings.late_deduction_percentage,
          ),
          alpha_deduction_percentage: normalizePercentValue(
            payrollSettingsRow?.alpha_deduction_percentage ??
              defaultPayrollSettings.alpha_deduction_percentage,
          ),
        });

        if (!isAppealRevisionMode && employeeRows.length > 0) {
          setSelectedEmployeeId(
            (prev) => prev || String(employeeRows[0].employee_id),
          );
        }

        const failedMessages = [
          attendanceSummaryResult,
          reimbursementsResult,
          payrollSettingsResult,
          employeeReferenceResult,
          managerAdjustmentsResult,
        ]
          .filter((item) => item.status === "rejected")
          .map((item) => item.reason?.message)
          .filter(Boolean);

        if (failedMessages.length) {
          setError(failedMessages[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingReferenceData(false);
      }
    };

    loadReferenceData();
  }, [periodMonth, periodYear, isAppealRevisionMode]);

  const selectedManagerAdjustment = useMemo(() => {
    const currentEmployeeId = String(selectedEmployeeId || "");
    if (!currentEmployeeId) return null;

    const rows = managerAdjustments.filter(
      (item) => String(item.employee_id) === currentEmployeeId,
    );
    if (!rows.length) return null;

    const priority = {
      submitted: 1,
      approved: 2,
      draft: 3,
      rejected: 4,
    };

    const sortedRows = [...rows].sort((a, b) => {
      const scoreA = priority[String(a.status || "").toLowerCase()] || 99;
      const scoreB = priority[String(b.status || "").toLowerCase()] || 99;
      if (scoreA !== scoreB) return scoreA - scoreB;

      const dateA = new Date(a.submitted_at || a.updated_at || 0).getTime();
      const dateB = new Date(b.submitted_at || b.updated_at || 0).getTime();
      return dateB - dateA;
    });

    return sortedRows[0] || null;
  }, [managerAdjustments, selectedEmployeeId]);

  useEffect(() => {
    const loadCurrentEmployeePayrollRows = async () => {
      if (!selectedEmployeeId) {
        setCurrentEmployeePayrollRows([]);
        return;
      }

      try {
        const rows = await financeApi.getPayrollByEmployee(selectedEmployeeId, {
          month: Number(periodMonth),
          year: Number(periodYear),
        });
        setCurrentEmployeePayrollRows(rows);
      } catch (err) {
        setCurrentEmployeePayrollRows([]);
      }
    };

    loadCurrentEmployeePayrollRows();
  }, [selectedEmployeeId, periodMonth, periodYear, latestGenerated]);

  useEffect(() => {
    const loadMonthlyRows = async () => {
      try {
        setLoadingMonthlyRows(true);
        const rows = await financeApi.getPayrollList({
          month: Number(recapMonth),
          year: Number(periodYear),
        });

        setMonthlyPayrollRows(rows || []);
      } catch (err) {
        setMonthlyPayrollRows([]);
      } finally {
        setLoadingMonthlyRows(false);
      }
    };

    loadMonthlyRows();
  }, [recapMonth, periodYear, latestGenerated]);

  const selectedEmployeeSummary = useMemo(() => {
    return (
      attendanceSummaryData.find(
        (item) => String(item.employee_id) === String(selectedEmployeeId),
      ) || null
    );
  }, [attendanceSummaryData, selectedEmployeeId]);

  const selectedEmployeeReference = useMemo(() => {
    return (
      employeeReferenceData.find(
        (item) => String(item.employee_id) === String(selectedEmployeeId),
      ) || null
    );
  }, [employeeReferenceData, selectedEmployeeId]);

  const selectedEmployeeCurrentPayroll = useMemo(() => {
    if (
      latestGenerated?.payroll_id &&
      String(latestGenerated?.employee?.id) === String(selectedEmployeeId)
    ) {
      return null;
    }

    return currentEmployeePayrollRows[0] || null;
  }, [currentEmployeePayrollRows, latestGenerated, selectedEmployeeId]);

  const selectedBasicSalary = useMemo(() => {
    if (
      latestGenerated?.details?.basic_salary &&
      String(latestGenerated?.employee?.id) === String(selectedEmployeeId)
    ) {
      return Number(latestGenerated.details.basic_salary);
    }

    return Number(
      selectedEmployeeReference?.basic_salary ||
        selectedEmployeeCurrentPayroll?.basic_salary ||
        0,
    );
  }, [
    latestGenerated,
    selectedEmployeeReference,
    selectedEmployeeCurrentPayroll,
    selectedEmployeeId,
  ]);

  const autoTaxDeduction = useMemo(() => {
    return Number(
      (selectedBasicSalary * Number(payrollSettings.tax || AUTO_TAX_RATE)).toFixed(2),
    );
  }, [selectedBasicSalary, payrollSettings.tax]);

  const autoLateDeductionPercentage = useMemo(() => {
    return Number(
      payrollSettings.late_deduction_percentage ||
        defaultPayrollSettings.late_deduction_percentage,
    );
  }, [payrollSettings.late_deduction_percentage]);

  const autoAlphaDeductionPercentage = useMemo(() => {
    return Number(
      payrollSettings.alpha_deduction_percentage ||
        defaultPayrollSettings.alpha_deduction_percentage,
    );
  }, [payrollSettings.alpha_deduction_percentage]);

  const autoPayrollId = useMemo(() => {
    if (
      latestGenerated?.payroll_id &&
      String(latestGenerated?.employee?.id) === String(selectedEmployeeId)
    ) {
      return String(latestGenerated.payroll_id);
    }

    return selectedEmployeeCurrentPayroll?.id
      ? String(selectedEmployeeCurrentPayroll.id)
      : "";
  }, [latestGenerated, selectedEmployeeCurrentPayroll, selectedEmployeeId]);

  const selectedEmployeeAvatarUrl = useMemo(() => {
    const dbPhoto = resolvePhotoUrl(selectedEmployeeReference?.photo);
    if (dbPhoto) {
      return dbPhoto;
    }

    const name =
      selectedEmployeeReference?.employee_name ||
      selectedEmployeeSummary?.employee_name ||
      "Pegawai";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
  }, [selectedEmployeeReference, selectedEmployeeSummary]);

  const filteredEmployeeReimbursements = useMemo(() => {
    const targetMonth = Number(periodMonth);
    const targetYear = Number(periodYear);
    const employeeId = Number(selectedEmployeeId);

    return reimbursements.filter((item) => {
      const createdDate = item.created_at ? new Date(item.created_at) : null;
      if (!createdDate) return false;

      return (
        Number(item.employee_id) === employeeId &&
        createdDate.getMonth() + 1 === targetMonth &&
        createdDate.getFullYear() === targetYear
      );
    });
  }, [reimbursements, selectedEmployeeId, periodMonth, periodYear]);

  const reimbursementOverview = useMemo(() => {
    return filteredEmployeeReimbursements.reduce(
      (accumulator, item) => {
        const amount = Number(item.amount || 0);
        if (
          item.status === "approved" ||
          item.status === "included_in_payroll"
        ) {
          accumulator.total += amount;
          accumulator.included += amount;
        }

        if (item.status === "pending") {
          accumulator.pending += amount;
        }

        return accumulator;
      },
      { total: 0, included: 0, pending: 0 },
    );
  }, [filteredEmployeeReimbursements]);

  const manualBonus = useMemo(
    () => Number(manualInput.bonus || 0),
    [manualInput.bonus],
  );

  const manualOtherAllowance = useMemo(
    () => Number(manualInput.other_allowance || 0),
    [manualInput.other_allowance],
  );

  const manualOtherDeduction = useMemo(
    () => Number(manualInput.other_deduction || 0),
    [manualInput.other_deduction],
  );

  useEffect(() => {
    if (isAppealRevisionMode) return;

    if (selectedManagerAdjustment) {
      setManualInput({
        bonus: String(Number(selectedManagerAdjustment.bonus || 0)),
        other_allowance: String(
          Number(
            selectedManagerAdjustment.other_allowance ??
              fixedOtherAllowance ??
              0,
          ),
        ),
        other_deduction: String(
          Number(selectedManagerAdjustment.other_deduction || 0),
        ),
      });
      return;
    }

    if (selectedEmployeeCurrentPayroll) {
      setManualInput({
        bonus: String(Number(selectedEmployeeCurrentPayroll.bonus || 0)),
        other_allowance: String(fixedOtherAllowance || 0),
        other_deduction: String(
          Number(selectedEmployeeCurrentPayroll.other_deduction || 0),
        ),
      });
      return;
    }

    setManualInput({
      bonus: "0",
      other_allowance: String(fixedOtherAllowance || 0),
      other_deduction: "0",
    });
  }, [
    isAppealRevisionMode,
    selectedManagerAdjustment,
    selectedEmployeeCurrentPayroll,
    selectedEmployeeId,
    periodMonth,
    periodYear,
    fixedOtherAllowance,
  ]);

  const totalApprovedAdjustment = useMemo(() => {
    return getApprovedReviewItemsFromAppeal(revisionAppealDetail).reduce(
      (total, item) => total + Number(item.adjustment_amount || 0),
      0,
    );
  }, [revisionAppealDetail]);

  const payrollPreview = useMemo(() => {
    const approvedItemsForPreview = isAppealRevisionMode
      ? getApprovedReviewItemsFromAppeal(revisionAppealDetail)
      : [];
    const approvedRevisionTargetKeys = new Set(
      approvedItemsForPreview
        .map((item) => findRevisionComponentDefinition(item)?.key)
        .filter(Boolean),
    );
    const shouldUseOriginalValueBeforeRevision = (key) =>
      isAppealRevisionMode && approvedRevisionTargetKeys.has(key);

    const resolveInputValue = (inputValue, fallbackValue) => {
      if (
        inputValue === "" ||
        inputValue === null ||
        inputValue === undefined
      ) {
        return Number(fallbackValue || 0);
      }

      const parsed = Number(inputValue);
      return Number.isFinite(parsed) ? parsed : Number(fallbackValue || 0);
    };

    const latestGeneratedForSelected =
      latestGenerated?.payroll_id &&
      String(latestGenerated?.employee?.id) === String(selectedEmployeeId)
        ? latestGenerated
        : null;

    if (!latestGeneratedForSelected && selectedEmployeeCurrentPayroll) {
      const dbPreview = mapPayrollRowToPreview(selectedEmployeeCurrentPayroll);
      if (dbPreview) {
        const latestLateMinutes = Number(
          selectedEmployeeSummary?.total_late_minutes ??
            dbPreview.totalLateMinutes ??
            0,
        );
        const latestReimbursement = Number(
          reimbursementOverview.included || dbPreview.reimbursement || 0,
        );
        const editedBonus = shouldUseOriginalValueBeforeRevision("bonus")
          ? Number(dbPreview.bonus || 0)
          : resolveInputValue(
              manualInput.bonus,
              selectedEmployeeCurrentPayroll.bonus,
            );
        const editedOtherAllowance = shouldUseOriginalValueBeforeRevision(
          "otherAllowance",
        )
          ? Number(dbPreview.otherAllowance || 0)
          : resolveInputValue(
              manualInput.other_allowance,
              selectedEmployeeCurrentPayroll.other_allowance,
            );
        const editedOtherDeduction = shouldUseOriginalValueBeforeRevision(
          "otherDeduction",
        )
          ? Number(dbPreview.otherDeduction || 0)
          : resolveInputValue(
              manualInput.other_deduction,
              selectedEmployeeCurrentPayroll.other_deduction,
            );

        const allowanceWithoutEditable =
          Number(dbPreview.allowanceTotal || 0) -
          Number(dbPreview.bonus || 0) -
          Number(dbPreview.otherAllowance || 0);
        const allowanceTotal = Number(
          (
            allowanceWithoutEditable +
            editedBonus +
            editedOtherAllowance
          ).toFixed(2),
        );
        const grossSalary = Number(
          (Number(dbPreview.basicSalary || 0) + allowanceTotal).toFixed(2),
        );
        const totalIncome = Number(
          (grossSalary + latestReimbursement).toFixed(2),
        );

        const deductionWithoutEditable =
          Number(dbPreview.totalDeduction || 0) -
          Number(dbPreview.otherDeduction || 0);
        const totalDeduction = Number(
          (deductionWithoutEditable + editedOtherDeduction).toFixed(2),
        );
        const netSalary = Number((totalIncome - totalDeduction).toFixed(2));
        return applyApprovedRevisionAdjustmentsToPreview(
          {
            ...dbPreview,
            totalLateMinutes: latestLateMinutes,
            reimbursement: latestReimbursement,
            bonus: editedBonus,
            otherAllowance: editedOtherAllowance,
            allowanceTotal,
            grossSalary,
            totalIncome,
            otherDeduction: editedOtherDeduction,
            totalDeduction,
            netSalary,
          },
          approvedItemsForPreview,
        );
      }
    }

    if (latestGeneratedForSelected?.details) {
      return applyApprovedRevisionAdjustmentsToPreview(
        {
          mode: "actual",
          basicSalary: Number(
            latestGeneratedForSelected.details.basic_salary || 0,
          ),
          transportAllowance: Number(
            latestGeneratedForSelected.details?.allowances?.transport || 0,
          ),
          mealAllowance: Number(
            latestGeneratedForSelected.details?.allowances?.meal || 0,
          ),
          healthAllowance: Number(
            latestGeneratedForSelected.details?.allowances?.health || 0,
          ),
          bonus: Number(
            latestGeneratedForSelected.details?.allowances?.bonus || 0,
          ),
          otherAllowance: Number(
            latestGeneratedForSelected.details?.allowances?.other || 0,
          ),
          allowanceTotal: Number(
            latestGeneratedForSelected.details?.allowances?.total || 0,
          ),
          grossSalary: Number(
            latestGeneratedForSelected.details?.income?.gross_salary || 0,
          ),
          reimbursement: Number(
            latestGeneratedForSelected.details?.reimbursement_total || 0,
          ),
          totalIncome: Number(
            latestGeneratedForSelected.details?.income?.total_income || 0,
          ),
          lateDeduction: Number(
            latestGeneratedForSelected.details?.late_deduction || 0,
          ),
          absentDeduction: Number(
            latestGeneratedForSelected.details?.absent_deduction || 0,
          ),
          bpjsDeduction: Number(
            latestGeneratedForSelected.details?.bpjs_deduction || 0,
          ),
          taxDeduction: Number(
            latestGeneratedForSelected.details?.tax_deduction || 0,
          ),
          otherDeduction: Number(
            latestGeneratedForSelected.details?.other_deduction || 0,
          ),
          totalDeduction: Number(
            latestGeneratedForSelected.details?.total_deduction || 0,
          ),
          netSalary: Number(
            latestGeneratedForSelected.details?.net_salary || 0,
          ),
          presentDays: Number(
            latestGeneratedForSelected.details?.present_days || 0,
          ),
          alphaDays: Number(
            latestGeneratedForSelected.details?.attendance_summary
              ?.total_alpha_days || 0,
          ),
          permissionDays: Number(
            latestGeneratedForSelected.details?.attendance_summary
              ?.total_izin_days || 0,
          ),
          sickDays: Number(
            latestGeneratedForSelected.details?.attendance_summary
              ?.total_sakit_days || 0,
          ),
          deductibleAbsentDays: Number(
            latestGeneratedForSelected.details?.attendance_summary
              ?.total_deductible_absent_days ||
              Number(
                latestGeneratedForSelected.details?.attendance_summary
                  ?.total_alpha_days || 0,
              ) +
                Number(
                  latestGeneratedForSelected.details?.attendance_summary
                    ?.total_izin_days || 0,
                ) +
                Number(
                  latestGeneratedForSelected.details?.attendance_summary
                    ?.total_sakit_days || 0,
                ),
          ),
          totalLateMinutes: Number(
            latestGeneratedForSelected.details?.attendance_summary
              ?.total_late_minutes || 0,
          ),
        },
        approvedItemsForPreview,
      );
    }

    const presentDays = Number(selectedEmployeeSummary?.present_days || 0);
    const alphaDays = Number(selectedEmployeeSummary?.alpha_days || 0);
    const unpaidLeaveDays = Number(
      selectedEmployeeSummary?.unpaid_leave_days || 0,
    );
    const permissionDays = Number(
      selectedEmployeeSummary?.permission_days || 0,
    );
    const sickDays = Number(selectedEmployeeSummary?.sick_days || 0);
    const deductibleAbsentDays = alphaDays + unpaidLeaveDays;
    const totalLateMinutes = Number(
      selectedEmployeeSummary?.total_late_minutes || 0,
    );
    const basicSalary = Number(selectedBasicSalary || 0);

    const transportAllowance = Number(
      (presentDays * Number(payrollSettings.transport_per_day || 0)).toFixed(2),
    );
    const mealAllowance = Number(
      (presentDays * Number(payrollSettings.meal_per_day || 0)).toFixed(2),
    );
    const healthAllowance = Number(
      (basicSalary * Number(payrollSettings.health_percentage || 0)).toFixed(2),
    );
    const allowanceTotal = Number(
      (
        transportAllowance +
        mealAllowance +
        healthAllowance +
        manualBonus +
        manualOtherAllowance
      ).toFixed(2),
    );
    const grossSalary = Number((basicSalary + allowanceTotal).toFixed(2));
    const reimbursement = Number(reimbursementOverview.included || 0);
    const totalIncome = Number((grossSalary + reimbursement).toFixed(2));

    const workdaysInPeriod = calculateWorkdaysInMonth(
      Number(periodMonth),
      Number(periodYear),
    );
    const dailySalary = basicSalary / Math.max(workdaysInPeriod, 1);
    const hourlyRate = dailySalary / DEFAULT_WORKING_HOURS_PER_DAY;
    const lateDeduction = Math.round(
      (totalLateMinutes / 60) * hourlyRate * autoLateDeductionPercentage,
    );
    const alphaDeduction = Math.round(
      alphaDays * dailySalary * autoAlphaDeductionPercentage,
    );
    const unpaidLeaveDeduction = Math.round(
      unpaidLeaveDays * dailySalary * autoAlphaDeductionPercentage,
    );
    const absentDeduction = Math.round(
      deductibleAbsentDays * dailySalary * autoAlphaDeductionPercentage,
    );
    const bpjsDeduction = Number(
      (basicSalary * Number(payrollSettings.bpjs_percentage || 0)).toFixed(2),
    );
    const taxDeduction = Number(autoTaxDeduction || 0);
    const otherDeduction = Number(manualOtherDeduction || 0);
    const totalDeduction = Number(
      (
        lateDeduction +
        absentDeduction +
        bpjsDeduction +
        taxDeduction +
        otherDeduction
      ).toFixed(2),
    );
    const netSalary = Number((totalIncome - totalDeduction).toFixed(2));
    return applyApprovedRevisionAdjustmentsToPreview(
      {
        mode: "estimated",
        basicSalary,
        transportAllowance,
        mealAllowance,
        healthAllowance,
        bonus: manualBonus,
        otherAllowance: manualOtherAllowance,
        allowanceTotal,
        grossSalary,
        reimbursement,
        totalIncome,
        lateDeduction,
        absentDeduction,
        alphaDeduction,
        unpaidLeaveDeduction,
        bpjsDeduction,
        taxDeduction,
        otherDeduction,
        totalDeduction,
        netSalary,
        presentDays,
        alphaDays,
        unpaidLeaveDays,
        permissionDays,
        sickDays,
        deductibleAbsentDays,
        totalLateMinutes,
        workdaysInPeriod,
      },
      approvedItemsForPreview,
    );
  }, [
    latestGenerated,
    selectedEmployeeCurrentPayroll,
    selectedEmployeeId,
    isAppealRevisionMode,
    revisionAppealDetail,
    totalApprovedAdjustment,
    selectedEmployeeSummary,
    selectedBasicSalary,
    payrollSettings,
    manualInput.bonus,
    manualInput.other_allowance,
    manualInput.other_deduction,
    manualBonus,
    manualOtherAllowance,
    manualOtherDeduction,
    reimbursementOverview,
    autoTaxDeduction,
    autoLateDeductionPercentage,
    autoAlphaDeductionPercentage,
    periodMonth,
    periodYear,
  ]);

  const approvedRevisionItems = useMemo(() => {
    return getApprovedReviewItemsFromAppeal(revisionAppealDetail).map(
      (item) => ({
        ...item,
        payroll_value: Number(item.adjustment_amount || 0),
      }),
    );
  }, [revisionAppealDetail]);

  const approvedRevisionItemsWithTarget = useMemo(() => {
    return approvedRevisionItems.map((item) => {
      const targetComponent = findRevisionComponentDefinition(item);
      return {
        ...item,
        target_key: targetComponent?.key || "",
        target_label: targetComponent?.label || item.label || "Komponen Revisi",
      };
    });
  }, [approvedRevisionItems]);

  const originalPayrollPreview = useMemo(
    () => mapPayrollRowToPreview(selectedEmployeeCurrentPayroll),
    [selectedEmployeeCurrentPayroll],
  );

  const revisionTotalComparisons = useMemo(() => {
    if (!isAppealRevisionMode || !originalPayrollPreview || !payrollPreview) {
      return [];
    }

    return [
      {
        label: "Gaji Yang Diterima",
        before: originalPayrollPreview.netSalary,
        after: payrollPreview.netSalary,
        highlight: true,
      },
      {
        label: "Total Pendapatan",
        before: originalPayrollPreview.totalIncome,
        after: payrollPreview.totalIncome,
      },
      {
        label: "Total Potongan",
        before: originalPayrollPreview.totalDeduction,
        after: payrollPreview.totalDeduction,
      },
    ].map((item) => ({
      ...item,
      difference: Number((Number(item.after || 0) - Number(item.before || 0)).toFixed(2)),
    }));
  }, [isAppealRevisionMode, originalPayrollPreview, payrollPreview]);

  const revisionComponentComparisons = useMemo(() => {
    if (!isAppealRevisionMode || !originalPayrollPreview || !payrollPreview) {
      return [];
    }

    return revisionComponentDefinitions.map(({ label, key, group }) => {
      const before = Number(originalPayrollPreview?.[key] || 0);
      const after = Number(payrollPreview?.[key] || 0);
      const approvedItem = approvedRevisionItemsWithTarget.find(
        (item) => item.target_key === key,
      );

      return {
        label,
        group,
        before,
        after,
        difference: Number((after - before).toFixed(2)),
        approvedItem,
        isApprovedRevision: Boolean(approvedItem),
      };
    });
  }, [
    isAppealRevisionMode,
    originalPayrollPreview,
    payrollPreview,
    approvedRevisionItemsWithTarget,
  ]);

  const isManualFieldDisabled = () => {
    return true;
  };

  const handleGenerate = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!selectedEmployeeId || !periodMonth || !periodYear) {
      setError("Pegawai, bulan, dan tahun wajib dipilih");
      return;
    }

    try {
      setLoadingGenerate(true);

      if (isAppealRevisionMode && appealRevisionId) {
        const revisedFinalAmount = Number(
          Number(payrollPreview?.netSalary || 0).toFixed(2),
        );

        await financeApi.createRevisedPayroll(appealRevisionId, {
          final_amount: revisedFinalAmount,
          basic_salary: Number(payrollPreview?.basicSalary || 0),
          transport_allowance: Number(payrollPreview?.transportAllowance || 0),
          meal_allowance: Number(payrollPreview?.mealAllowance || 0),
          health_allowance: Number(payrollPreview?.healthAllowance || 0),
          bonus: Number(manualInput.bonus || 0),
          other_allowance: Number(manualInput.other_allowance || 0),
          other_deduction: Number(manualInput.other_deduction || 0),
          allowance: Number(payrollPreview?.allowanceTotal || 0),
          gross_salary: Number(payrollPreview?.grossSalary || 0),
          reimbursement_total: Number(payrollPreview?.reimbursement || 0),
          total_income: Number(payrollPreview?.totalIncome || 0),
          deduction: Number(payrollPreview?.totalDeduction || 0),
          late_deduction: Number(payrollPreview?.lateDeduction || 0),
          absent_deduction: Number(payrollPreview?.absentDeduction || 0),
          bpjs_deduction: Number(payrollPreview?.bpjsDeduction || 0),
          tax_deduction: Number(payrollPreview?.taxDeduction || 0),
          total_late_days: Number(
            selectedEmployeeCurrentPayroll?.total_late_days || 0,
          ),
          total_absent_days: Number(payrollPreview?.deductibleAbsentDays || 0),
          total_sakit_days: Number(payrollPreview?.sickDays || 0),
          total_izin_days: Number(payrollPreview?.permissionDays || 0),
          present_days: Number(payrollPreview?.presentDays || 0),
          notes: "Revisi payroll dari banding gaji yang telah disetujui",
        });

        const refreshedRows = await financeApi.getPayrollByEmployee(
          selectedEmployeeId,
          {
            month: Number(periodMonth),
            year: Number(periodYear),
          },
        );
        const refreshedMonthlyRows = await financeApi.getPayrollList({
          month: Number(periodMonth),
          year: Number(periodYear),
        });
        setMonthlyPayrollRows(refreshedMonthlyRows || []);
        setCurrentEmployeePayrollRows(refreshedRows || []);
        setLatestGenerated(null);
        setSuccessMessage(
          "Slip revisi berhasil diperbarui (ID tetap) dan masuk ke rekap draf siap dikirim",
        );
        navigate(
          `/app/payroll?month=${Number(periodMonth)}&year=${Number(periodYear)}`,
          { replace: true },
        );
        return;
      }

      const payload = {
        employee_id: Number(selectedEmployeeId),
        period_month: Number(periodMonth),
        period_year: Number(periodYear),
        bonus: Number(manualInput.bonus || 0),
        other_allowance: Number(fixedOtherAllowance || 0),
        tax_deduction: autoTaxDeduction,
        other_deduction: Number(manualInput.other_deduction || 0),
      };

      const result = await financeApi.generatePayroll(payload);
      setLatestGenerated(result);
      setSuccessMessage(
        "Slip gaji berhasil dibuat, perhitungan payroll tampil di bawah",
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingGenerate(false);
    }
  };

  const handlePublishAll = async () => {
    setError("");
    setSuccessMessage("");

    const draftRows = monthlyPayrollRows.filter(
      (item) => item.status === "draft",
    );

    if (!draftRows.length) {
      setError("Tidak ada slip draf yang perlu dipublikasikan");
      return;
    }

    try {
      setLoadingPublishAll(true);
      await Promise.all(
        draftRows.map((item) => financeApi.publishPayroll(item.id)),
      );
      setSuccessMessage(
        "Semua slip bulan ini berhasil dipublikasikan ke akun masing-masing pegawai",
      );

      const refreshedRows = await financeApi.getPayrollList({
        month: Number(recapMonth),
        year: Number(periodYear),
      });
      setMonthlyPayrollRows(refreshedRows);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingPublishAll(false);
    }
  };

  const openPayrollPdf = async (payrollId) => {
    try {
      setError("");
      const blob = await financeApi.getPayrollPdfBlob(payrollId);
      const url = window.URL.createObjectURL(blob);
      setSelectedPayrollPdf({ url, title: "Slip Gaji" });
    } catch (err) {
      setError(err.message);
    }
  };

  const closePayrollPdfModal = () => {
    if (selectedPayrollPdf?.url) {
      window.URL.revokeObjectURL(selectedPayrollPdf.url);
    }
    setSelectedPayrollPdf(null);
  };

  const handleViewRow = (row) => {
    openPayrollPdf(row.id);
  };

  const handleEditRow = (row) => {
    setSelectedEmployeeId(String(row.employee_id));
    setPeriodMonth(String(row.period_month));
    setPeriodYear(String(row.period_year));
    setManualInput({
      bonus: String(row.bonus || ""),
      other_allowance: String(fixedOtherAllowance || 0),
      other_deduction: String(row.other_deduction || ""),
    });
    setLatestGenerated(null);
    setError("");
    setSuccessMessage(
      "Data slip dimuat ke form. Silakan ubah nilai lalu klik Buat Slip Gaji",
    );
  };

  const handleDeleteRow = async (row) => {
    if (row.status !== "draft") {
      setError("Hanya slip berstatus draf yang bisa dihapus");
      return;
    }

    const confirmed = await confirmPopup({
      title: "Hapus Slip Payroll",
      subtitle: "Slip draf akan dihapus dari rekap payroll",
      badge: "Konfirmasi",
      message: `Hapus slip payroll ID ${row.id} untuk ${row.employee_name}?`,
      confirmLabel: "Hapus Slip",
      cancelLabel: "Batal",
      variant: "warning",
    });

    if (!confirmed) return;

    try {
      setError("");
      await financeApi.deletePayroll(row.id);
      setSuccessMessage("Slip draf berhasil dihapus");

      const updatedRows = monthlyPayrollRows.filter(
        (item) => item.id !== row.id,
      );
      setMonthlyPayrollRows(updatedRows);

      if (String(selectedEmployeeId) === String(row.employee_id)) {
        const employeeRows = await financeApi.getPayrollByEmployee(
          row.employee_id,
          {
            month: Number(periodMonth),
            year: Number(periodYear),
          },
        );
        setCurrentEmployeePayrollRows(employeeRows || []);
      }

      if (String(latestGenerated?.payroll_id) === String(row.id)) {
        setLatestGenerated(null);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const doneEmployeeIds = new Set(
    monthlyPayrollRows.map((item) => String(item.employee_id)),
  );
  const recapPayrollRows = monthlyPayrollRows.filter(
    (item) => String(item.status || "").toLowerCase() !== "claimed",
  );
  const recapPagination = useTablePagination(recapPayrollRows);
  const hasDraftToPublish = monthlyPayrollRows.some(
    (item) => item.status === "draft",
  );

  return (
    <>
      {popup}
      {(error || successMessage) && (
        <div className="mb-4">
          {error && (
            <div className="alert alert-error mb-2">
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {successMessage && (
        <div className="toast toast-top toast-end z-50">
          <div className="alert alert-success">
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <TitleCard
          title={isRevisionPage ? "Revisi Slip Gaji" : "Payroll"}
          topMargin="mt-0"
          TopSideButtons={
            isRevisionPage ? (
              <button
                type="button"
                className="btn btn-sm btn-primary rounded-full "
                onClick={() => navigate("/app/salary-appeals")}
              >
                Kembali
              </button>
            ) : null
          }
        >
          <form onSubmit={handleGenerate} className="grid grid-cols-1 gap-4">
            {isAppealRevisionMode ? (
              <div className="rounded-2xl border border-info/20 bg-info/10 p-4 text-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-info">
                      Revisi banding gaji
                    </p>
                    <p className="mt-1 opacity-80">
                      Appeal ID: {appealRevisionId || "-"} untuk periode{" "}
                      {periodMonth}/{periodYear}.
                    </p>
                  </div>
                  <span className="badge badge-info badge-outline">
                    Mode Revisi
                  </span>
                </div>
              </div>
            ) : (
              <>
                <label className="form-control">
                  <span className="label-text mb-1">Pegawai</span>
                  <select
                    className="select select-bordered w-full"
                    value={selectedEmployeeId}
                    onChange={(event) =>
                      setSelectedEmployeeId(event.target.value)
                    }
                    disabled={loadingReferenceData}
                  >
                    <option value="">Pilih pegawai</option>
                    {!employeeReferenceData.length && (
                      <option value="">Data pegawai belum tersedia</option>
                    )}
                    {employeeReferenceData.map((item) => (
                      <option key={item.employee_id} value={item.employee_id}>
                        {item.employee_name} ({item.employee_code})
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="form-control">
                    <span className="label-text mb-1">Bulan</span>
                    <select
                      className="select select-bordered w-full"
                      value={periodMonth}
                      onChange={(event) => setPeriodMonth(event.target.value)}
                    >
                      <option value="">Pilih bulan</option>
                      {monthOptions.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="form-control">
                    <span className="label-text mb-1">Tahun</span>
                    <input
                      className="input input-bordered w-full"
                      value={periodYear}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Contoh: 2026"
                      onChange={(event) => setPeriodYear(event.target.value)}
                    />
                  </label>
                </div>
              </>
            )}

            {!selectedEmployeeId || !periodMonth || !periodYear ? (
              !isAppealRevisionMode && (
                <div className="alert alert-info text-sm">
                  <span>
                    Pilih pegawai, bulan, dan tahun terlebih dahulu untuk
                    menampilkan detail perhitungan payroll.
                  </span>
                </div>
              )
            ) : null}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {isAppealRevisionMode && (
                <>
                  <input
                    className="input input-bordered w-full"
                    value={`Pegawai: ${selectedEmployeeReference?.employee_name || "-"} (${selectedEmployeeReference?.employee_code || "-"})`}
                    disabled
                  />
                  <input
                    className="input input-bordered w-full"
                    value={`Periode: ${periodMonth}/${periodYear}`}
                    disabled
                  />
                </>
              )}
            </div>

            {isAppealRevisionMode && revisionAppealDetail && (
              <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
                <div className="border-b border-base-300 bg-gradient-to-r from-primary/10 via-base-100 to-base-100 px-4 py-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-base font-semibold">
                        Detail yang Direvisi
                      </p>
                      <p className="text-xs opacity-70">
                        Komponen hasil persetujuan banding gaji.
                      </p>
                    </div>
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {selectedEmployeeCurrentPayroll
                        ? `Payroll ${selectedEmployeeCurrentPayroll.id || "-"}`
                        : "Payroll belum tersedia"}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3 text-sm">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-base-300 bg-base-200/50 px-4 py-3">
                      <p className="text-[10px] uppercase tracking-[0.18em] opacity-50">
                        Nominal Perbaikan HR
                      </p>
                      <p className="mt-1 font-semibold tabular-nums">
                        {formatCurrency(revisionAppealDetail.expected_amount || 0)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-base-300 bg-base-200/50 px-4 py-3">
                      <p className="text-[10px] uppercase tracking-[0.18em] opacity-50">
                        Periode
                      </p>
                      <p className="mt-1 font-semibold">
                        {periodMonth}/{periodYear}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                      {approvedRevisionItems.map((item, index) => (
                        <div
                          key={`${item.label || "approved"}-${index}`}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-base-300 bg-base-200/50 px-4 py-3"
                        >
                          <span className="text-sm opacity-80">
                            {item.label || "Komponen Revisi"}
                          </span>
                          <span className="text-sm font-semibold tabular-nums">
                            {formatCurrency(item.payroll_value || 0)}
                          </span>
                        </div>
                      ))}
                      {approvedRevisionItems.length === 0 && (
                        <div className="rounded-2xl border border-base-300 bg-base-200/50 px-4 py-3 text-center opacity-70">
                          Belum ada komponen yang disetujui HR
                        </div>
                      )}
                      {!selectedEmployeeCurrentPayroll &&
                        approvedRevisionItems.length > 0 && (
                          <div className="rounded-2xl border border-warning/20 bg-warning/10 px-4 py-3 text-center text-warning-content">
                            Data slip payroll belum tersedia untuk periode ini
                          </div>
                        )}
                  </div>
                </div>
              </div>
            )}

            {isAppealRevisionMode && originalPayrollPreview && (
              <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
                <div className="border-b border-base-300 bg-gradient-to-r from-primary/10 via-base-100 to-base-100 px-4 py-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-base font-semibold">
                        Sebelum dan Sesudah Revisi
                      </p>
                      <p className="text-xs opacity-70">
                        Perbandingan slip asal dengan hasil revisi banding gaji.
                      </p>
                    </div>
                    <span className="rounded-full border border-base-300 bg-base-200 px-3 py-1 text-xs font-medium">
                      Payroll {selectedEmployeeCurrentPayroll?.id || "-"}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
                    <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold">
                          Komponen Disetujui untuk Direvisi
                        </p>
                        <p className="text-xs opacity-70">
                          Pendapatan ditambah nominal disetujui, potongan dikurangi nominal disetujui.
                        </p>
                      </div>
                      <span className="badge badge-primary badge-sm">
                        {approvedRevisionItemsWithTarget.length} komponen
                      </span>
                    </div>

                    <div className="grid gap-2 md:grid-cols-2">
                      {approvedRevisionItemsWithTarget.map((item, index) => (
                        <div
                          key={`${item.target_label || item.label}-${index}`}
                          className="rounded-xl border border-primary/20 bg-base-100 px-3 py-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium">
                                {item.target_label || item.label || "Komponen Revisi"}
                              </p>
                              {item.label &&
                                item.label !== item.target_label && (
                                  <p className="mt-1 text-xs opacity-60">
                                    Pengajuan: {item.label}
                                  </p>
                                )}
                            </div>
                            <span className="badge badge-primary badge-sm shrink-0">
                              Direvisi
                            </span>
                          </div>
                          <div className="mt-3 flex items-center justify-between gap-3 border-t border-base-300 pt-2 text-sm">
                            <span className="opacity-70">
                              Nominal penyesuaian
                            </span>
                            <span className="font-semibold tabular-nums text-right">
                              {formatCurrency(item.payroll_value || 0)}
                            </span>
                          </div>
                        </div>
                      ))}

                      {approvedRevisionItemsWithTarget.length === 0 && (
                        <div className="rounded-xl border border-base-300 bg-base-100 px-3 py-3 text-sm opacity-70 md:col-span-2">
                          Belum ada komponen yang disetujui HR untuk revisi.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    {revisionTotalComparisons.map((item) => (
                      <div
                        key={item.label}
                        className={`rounded-2xl border p-4 ${
                          item.highlight
                            ? "border-primary/20 bg-primary/10"
                            : "border-base-300 bg-base-200/60"
                        }`}
                      >
                        <p className="text-[10px] uppercase tracking-[0.18em] opacity-50">
                          {item.label}
                        </p>
                        <div className="mt-3 space-y-2 text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <span className="opacity-70">Sebelum</span>
                            <span className="font-semibold tabular-nums text-right">
                              {formatCurrency(item.before)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="opacity-70">Sesudah</span>
                            <span className="font-bold tabular-nums text-right">
                              {formatCurrency(item.after)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3 border-t border-base-300 pt-2">
                            <span className="opacity-70">Selisih</span>
                            <span
                              className={`font-semibold tabular-nums text-right ${
                                item.difference > 0
                                  ? "text-success"
                                  : item.difference < 0
                                    ? "text-error"
                                    : ""
                              }`}
                            >
                              {formatCurrency(item.difference)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-base-300">
                    <table className="table table-zebra w-full text-sm">
                      <thead>
                        <tr>
                          <th>Komponen</th>
                          <th>Kategori</th>
                          <th>Status Revisi</th>
                          <th className="text-right">Sebelum Revisi</th>
                          <th className="text-right">Sesudah Revisi</th>
                          <th className="text-right">Selisih</th>
                        </tr>
                      </thead>
                      <tbody>
                        {revisionComponentComparisons.map((item) => (
                          <tr
                            key={`${item.group}-${item.label}`}
                            className={
                              item.isApprovedRevision
                                ? "bg-primary/10"
                                : item.difference !== 0
                                  ? "bg-primary/5"
                                  : ""
                            }
                          >
                            <td className="font-medium">{item.label}</td>
                            <td>
                              <span
                                className={`badge badge-sm ${
                                  item.group === "Pendapatan"
                                    ? "badge-success"
                                    : "badge-error"
                                }`}
                              >
                                {item.group}
                              </span>
                            </td>
                            <td>
                              {item.isApprovedRevision ? (
                                <div className="flex flex-col gap-1">
                                  <span className="badge badge-primary badge-sm w-fit">
                                    Direvisi
                                  </span>
                                  <span className="text-xs opacity-70">
                                    Penyesuaian:{" "}
                                    {formatCurrency(
                                      item.approvedItem?.payroll_value || 0,
                                    )}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs opacity-50">-</span>
                              )}
                            </td>
                            <td className="text-right tabular-nums">
                              {formatCurrency(item.before)}
                            </td>
                            <td className="text-right font-semibold tabular-nums">
                              {formatCurrency(item.after)}
                            </td>
                            <td
                              className={`text-right font-semibold tabular-nums ${
                                item.difference > 0
                                  ? "text-success"
                                  : item.difference < 0
                                    ? "text-error"
                                    : ""
                              }`}
                            >
                              {formatCurrency(item.difference)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {selectedEmployeeSummary && (
              <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
                <div className="border-b border-base-300 bg-gradient-to-r from-primary/10 via-base-100 to-base-100 px-4 py-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-base font-semibold">Pegawai</p>
                    </div>
                    <span className="badge badge-outline badge-sm">
                      {selectedEmployeeReference?.employment_status || "Aktif"}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-stretch">
                    <div className="flex items-center gap-4 rounded-2xl border border-base-300 bg-base-200/40 px-4 py-4 xl:flex-[1.2]">
                      <div className="avatar">
                        <div className="w-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                          <img
                            src={selectedEmployeeAvatarUrl}
                            alt={selectedEmployeeSummary.employee_name}
                          />
                        </div>
                      </div>

                      <div className="min-w-0">
                        <h2 className="text-lg font-bold leading-tight">
                          {selectedEmployeeReference?.employee_name ||
                            selectedEmployeeSummary?.employee_name ||
                            "-"}
                        </h2>
                        <p className="text-sm opacity-70">
                          {selectedEmployeeReference?.position_name || "-"}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                          <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-medium text-primary">
                            {selectedEmployeeReference?.employee_code ||
                              selectedEmployeeSummary?.employee_code ||
                              "-"}
                          </span>
                          <span className="inline-flex items-center rounded-full border border-base-300 bg-base-100 px-3 py-1 text-base-content/70">
                            {selectedEmployeeReference?.department_name || "-"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm xl:flex-[1]">
                      {[
                        ["Level", selectedEmployeeReference?.position_level || "-"],
                        ["Status", selectedEmployeeReference?.user_status || "-"],
                        ["Posisi", selectedEmployeeReference?.position_name || "-"],
                        [
                          "Departemen",
                          selectedEmployeeReference?.department_name || "-",
                        ],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="min-w-[160px] flex-1 rounded-2xl border border-base-300 bg-base-100 px-4 py-3 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[10px] uppercase tracking-[0.22em] opacity-50 whitespace-nowrap">
                              {label}
                            </span>
                            <span className="h-2 w-2 rounded-full bg-primary/70 shrink-0" />
                          </div>
                          <p className="mt-2 break-words text-sm font-semibold leading-snug text-base-content/90">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-primary/15 bg-primary/10 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs uppercase tracking-[0.18em] opacity-60">
                        Gaji Pokok
                      </span>
                      <span className="text-lg font-black text-primary tabular-nums">
                        {selectedBasicSalary
                          ? formatCurrency(selectedBasicSalary)
                          : "Belum tersedia"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedEmployeeId && periodMonth && periodYear && (
              <div className="grid gap-3 text-sm lg:grid-cols-2">
                <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-semibold">Kehadiran</p>
                    <span className="text-xs opacity-60">Bulanan</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {[
                      ["Hadir", `${payrollPreview.presentDays || 0} hari`],
                      ["Alpha", `${payrollPreview.alphaDays || 0} hari`],
                      [
                        "Terlambat",
                        formatLateDuration(payrollPreview.totalLateMinutes),
                      ],
                      ["Izin", `${payrollPreview.permissionDays || 0} hari`],
                      ["Sakit", `${payrollPreview.sickDays || 0} hari`],
                      [
                        "Reimbursement",
                        formatCurrency(payrollPreview.reimbursement),
                      ],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-base-300 bg-base-200/60 px-3 py-3"
                      >
                        <p className="text-[10px] uppercase tracking-[0.18em] opacity-50">
                          {label}
                        </p>
                        <p className="mt-1 font-semibold leading-tight tabular-nums">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-semibold">Parameter</p>
                    <span className="text-xs opacity-60">Otomatis</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["Pajak", formatCurrency(autoTaxDeduction)],
                      [
                        "Transport",
                        formatCurrency(payrollSettings.transport_per_day),
                      ],
                      ["Makan", formatCurrency(payrollSettings.meal_per_day)],
                      [
                        "Kesehatan",
                        formatPercent(payrollSettings.health_percentage || 0),
                      ],
                      [
                        "BPJS",
                        formatPercent(payrollSettings.bpjs_percentage || 0),
                      ],
                      ["Bonus", formatCurrency(manualInput.bonus || 0)],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-base-300 bg-base-200/60 px-3 py-3"
                      >
                        <p className="text-[10px] uppercase tracking-[0.18em] opacity-50">
                          {label}
                        </p>
                        <p className="mt-1 font-semibold leading-tight tabular-nums">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div
                      className={`rounded-2xl border px-3 py-3 ${
                        isManualFieldDisabled("other_allowance")
                          ? "border-base-300 bg-base-200/60"
                          : "border-primary/20 bg-primary/10"
                      }`}
                    >
                      <p className="text-[10px] uppercase tracking-[0.18em] opacity-50">
                        Tunjangan Jabatan
                      </p>
                      <p className="mt-1 font-semibold leading-tight tabular-nums">
                        {formatCurrency(manualInput.other_allowance || 0)}
                      </p>
                    </div>
                    <div
                      className={`rounded-2xl border px-3 py-3 ${
                        isManualFieldDisabled("other_deduction")
                          ? "border-base-300 bg-base-200/60"
                          : "border-error/20 bg-error/10"
                      }`}
                    >
                      <p className="text-[10px] uppercase tracking-[0.18em] opacity-50">
                        Potongan Lain
                      </p>
                      <p className="mt-1 font-semibold leading-tight tabular-nums">
                        {formatCurrency(manualInput.other_deduction || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!isAppealRevisionMode && (
              <div className="alert alert-info text-sm">
                <span>
                  Nilai bonus dan potongan lain terisi otomatis dari adjustment
                  atasan (atau slip terakhir jika belum ada adjustment). Nilai
                  tunjangan lain dipatok otomatis sesuai jabatan dan bersifat
                  read-only.
                </span>
              </div>
            )}

            {selectedEmployeeId && periodMonth && periodYear && (
              <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
                <div className="border-b border-base-300 bg-gradient-to-r from-primary/10 via-base-100 to-base-100 px-4 py-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-base font-semibold">
                        Pratinjau Perhitungan Payroll
                      </p>
                      <p className="text-xs opacity-70">
                        Ringkasan otomatis sebelum slip dibuat.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl bg-primary/10 p-4 border border-primary/15">
                      <p className="text-xs uppercase tracking-wide opacity-70">
                        Gaji Yang Diterima
                      </p>
                      <p className="mt-1 text-2xl font-black leading-tight text-primary">
                        {formatCurrency(payrollPreview.netSalary)}
                      </p>
                      <p className="mt-1 text-xs opacity-70">
                        Nominal akhir yang diterima pegawai.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-base-200 p-4 border border-base-300">
                      <p className="text-xs uppercase tracking-wide opacity-70">
                        Total Pendapatan
                      </p>
                      <p className="mt-1 text-xl font-bold leading-tight">
                        {formatCurrency(payrollPreview.totalIncome)}
                      </p>
                      <p className="mt-2 text-xs opacity-70">
                        Gaji pokok, tunjangan, bonus, dan reimbursement.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-base-200 p-4 border border-base-300">
                      <p className="text-xs uppercase tracking-wide opacity-70">
                        Total Potongan
                      </p>
                      <p className="mt-1 text-xl font-bold leading-tight">
                        {formatCurrency(payrollPreview.totalDeduction)}
                      </p>
                      <p className="mt-2 text-xs opacity-70">
                        Keterlambatan, alpha, pajak, dan potongan lain.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-2">
                    <div className="rounded-2xl border border-base-300 bg-base-200/60 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="font-semibold">Pendapatan</p>
                        <span className="text-xs opacity-60">
                          Detail komponen
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        {[
                          ["Gaji Pokok", payrollPreview.basicSalary],
                          [
                            "Tunjangan Transport",
                            payrollPreview.transportAllowance,
                          ],
                          ["Makan", payrollPreview.mealAllowance],
                          [
                            "Tunjangan Kesehatan",
                            payrollPreview.healthAllowance,
                          ],
                          ["Bonus", payrollPreview.bonus],
                          ["Tunjangan Jabatan", payrollPreview.otherAllowance],
                          ["Total Tunjangan", payrollPreview.allowanceTotal],
                          ["Gaji Kotor", payrollPreview.grossSalary],
                          [
                            "Total Reimbursement",
                            payrollPreview.reimbursement,
                          ],
                        ].map(([label, value], index) => (
                          <div
                            key={`${label}-${index}`}
                            className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2 ${
                              label === "Total Tunjangan" ||
                              label === "Gaji Kotor" ||
                              label === "Total Reimbursement"
                                ? "bg-base-100 font-semibold"
                                : "bg-base-100/70"
                            }`}
                          >
                            <span className="text-sm opacity-80">{label}</span>
                            <span className="text-sm font-medium text-right tabular-nums">
                              {formatCurrency(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-base-300 bg-base-200/60 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="font-semibold">Potongan</p>
                        <span className="text-xs opacity-60">
                          Detail komponen
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        {[
                          [
                            "Potongan Keterlambatan",
                            payrollPreview.lateDeduction,
                          ],
                          ["Potongan Alpha", payrollPreview.alphaDeduction],
                          [
                            "Potongan Cuti Tidak Dibayar",
                            payrollPreview.unpaidLeaveDeduction,
                          ],
                          ["Potongan BPJS", payrollPreview.bpjsDeduction],
                          ["Potongan Pajak", payrollPreview.taxDeduction],
                          ["Potongan Lain", payrollPreview.otherDeduction],
                          ["Total Potongan", payrollPreview.totalDeduction],
                        ].map(([label, value], index) => (
                          <div
                            key={`${label}-${index}`}
                            className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2 ${
                              label === "Total Potongan"
                                ? "bg-base-100 font-semibold"
                                : "bg-base-100/70"
                            }`}
                          >
                            <span className="text-sm opacity-80">{label}</span>
                            <span className="text-sm font-medium text-right tabular-nums">
                              {formatCurrency(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <input
              className="input input-bordered w-full"
              value={autoPayrollId ? `Payroll ID: ${autoPayrollId}` : ""}
              disabled
            />

            <button
              className={`btn btn-primary w-full ${loadingGenerate ? "loading" : ""}`}
              type="submit"
            >
              {isAppealRevisionMode
                ? "Kirim Revisi Slip Gaji"
                : "Buat Slip Gaji"}
            </button>
          </form>

          {latestGenerated?.payroll_id &&
            String(latestGenerated?.employee?.id) ===
              String(selectedEmployeeId) && (
              <div className="mt-5 rounded-2xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
                <div className="border-b border-base-300 bg-gradient-to-r from-primary/10 via-base-100 to-base-100 px-4 py-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-base font-semibold">Detail Slip Gaji</p>
                      <p className="text-xs opacity-70">
                        Ringkasan slip yang baru dibuat.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary shadow-md transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
                      onClick={() => openPayrollPdf(latestGenerated.payroll_id)}
                    >
                      Lihat PDF Slip
                    </button>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <div className="grid gap-3 lg:grid-cols-[1fr_1.1fr]">
                    <div className="rounded-2xl border border-base-300 bg-base-200/40 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.22em] opacity-50">
                            Slip
                          </p>
                          <p className="mt-1 text-lg font-bold leading-tight">
                            {latestGenerated?.employee?.name || "-"}
                          </p>
                          <p className="mt-1 text-sm opacity-70">
                            {latestGenerated?.period || "-"}
                          </p>
                        </div>
                        <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                          {latestGenerated.payroll_id}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        [
                          "Gaji Bersih",
                          formatCurrency(latestGenerated?.details?.net_salary),
                        ],
                        [
                          "Pendapatan",
                          formatCurrency(
                            latestGenerated?.details?.income?.total_income,
                          ),
                        ],
                        [
                          "Potongan",
                          formatCurrency(
                            latestGenerated?.details?.total_deduction,
                          ),
                        ],
                        [
                          "Reimbursement",
                          formatCurrency(
                            latestGenerated?.details?.reimbursement_total,
                          ),
                        ],
                      ].map(([label, value], index) => (
                        <div
                          key={label}
                          className={`rounded-2xl border px-4 py-3 ${
                            index === 0
                              ? "border-primary/15 bg-primary/10"
                              : "border-base-300 bg-base-200/50"
                          }`}
                        >
                          <p className="text-[10px] uppercase tracking-[0.22em] opacity-50">
                            {label}
                          </p>
                          <p
                            className={`mt-2 text-sm font-semibold leading-tight tabular-nums ${
                              index === 0 ? "text-primary text-base" : ""
                            }`}
                          >
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-semibold">Rincian Komponen</p>
                      <span className="text-xs opacity-60">
                        Perhitungan final
                      </span>
                    </div>
                    <div className="space-y-2">
                      {[
                        ["Gaji Pokok", latestGenerated?.details?.basic_salary],
                        [
                          "Tunjangan",
                          latestGenerated?.details?.allowances?.total,
                        ],
                        [
                          "Penggantian Dana",
                          latestGenerated?.details?.reimbursement_total,
                        ],
                        [
                          "Potongan Keterlambatan",
                          latestGenerated?.details?.late_deduction,
                        ],
                        [
                          "Potongan Alpha",
                          latestGenerated?.details?.alpha_deduction,
                        ],
                        [
                          "Potongan Cuti Tidak Dibayar",
                          latestGenerated?.details?.unpaid_leave_deduction,
                        ],
                        ["Potongan BPJS", latestGenerated?.details?.bpjs_deduction],
                        ["Potongan Pajak", latestGenerated?.details?.tax_deduction],
                        ["Potongan Lain", latestGenerated?.details?.other_deduction],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="flex items-center justify-between gap-4 rounded-2xl border border-base-300 bg-base-200/50 px-4 py-3"
                        >
                          <span className="text-sm opacity-80">{label}</span>
                          <span className="text-sm font-semibold tabular-nums">
                            {formatCurrency(value)}
                          </span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between gap-4 rounded-2xl border border-primary/15 bg-primary/10 px-4 py-3">
                        <span className="text-sm font-semibold">
                          Gaji Diterima
                        </span>
                        <span className="text-base font-black text-primary tabular-nums">
                          {formatCurrency(latestGenerated?.details?.net_salary)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </TitleCard>

        {!isAppealRevisionMode && !isRevisionPage && (
          <TitleCard
            title="Rekap Slip Gaji Bulan Ini & Publish"
            topMargin="mt-0"
          >
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="badge badge-outline">
                Pegawai aktif: {employeeReferenceData.length}
              </span>
              <span
                className={`badge ${
                  employeeReferenceData.length > 0 &&
                  doneEmployeeIds.size === employeeReferenceData.length
                    ? "badge-success"
                    : "badge-warning"
                }`}
              >
                Slip dibuat: {doneEmployeeIds.size}/
                {employeeReferenceData.length}
              </span>
              <span className="badge badge-info">
                Draf:{" "}
                {
                  monthlyPayrollRows.filter((item) => item.status === "draft")
                    .length
                }
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <label className="form-control">
                <span className="label-text mb-1">Filter Bulan Rekap</span>
                <select
                  className="select select-bordered w-full"
                  value={recapMonth}
                  onChange={(event) => setRecapMonth(event.target.value)}
                >
                  {monthOptions.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-control">
                <span className="label-text mb-1">Tahun Rekap</span>
                <input
                  className="input input-bordered w-full"
                  value={periodYear}
                  onChange={(event) => setPeriodYear(event.target.value)}
                />
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="table table-zebra table-sm">
                <thead>
                  <tr>
                    <th>Payroll ID</th>
                    <th>Pegawai</th>
                    <th>Gaji Pokok</th>
                    <th>Reimbursement</th>
                    <th>Net Salary</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {recapPagination.paginatedItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.employee_name}</td>
                      <td>{formatCurrency(item.basic_salary)}</td>
                      <td>{formatCurrency(item.reimbursement_total)}</td>
                      <td>
                        {formatCurrency(item.final_amount || item.net_salary)}
                      </td>
                      <td>
                        <span
                          className={`badge ${statusBadgeClass[item.status] || "badge-outline"}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="btn btn-xs btn-outline"
                            onClick={() => handleViewRow(item)}
                          >
                            View
                          </button>
                          <button
                            type="button"
                            className="btn btn-xs btn-outline btn-info"
                            onClick={() => handleEditRow(item)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-xs btn-outline btn-error"
                            onClick={() => handleDeleteRow(item)}
                            disabled={item.status !== "draft"}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!recapPayrollRows.length && !loadingMonthlyRows && (
                    <tr>
                      <td colSpan={7} className="text-center opacity-70">
                        Belum ada slip gaji bulan ini
                      </td>
                    </tr>
                  )}
                  {loadingMonthlyRows && (
                    <tr>
                      <td colSpan={7} className="text-center opacity-70">
                        Memuat rekap payroll bulan ini...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <Pagination
                page={recapPagination.page}
                totalPages={recapPagination.totalPages}
                onChangePage={recapPagination.setPage}
                itemsPerPage={recapPagination.itemsPerPage}
              />
            </div>

            <button
              className={`btn btn-secondary w-full mt-4 ${loadingPublishAll ? "loading" : ""}`}
              onClick={handlePublishAll}
              disabled={!hasDraftToPublish || loadingPublishAll}
            >
              Publikasikan Semua Slip Bulan Ini
            </button>
          </TitleCard>
        )}
      </div>

      {latestGenerated?.payroll_id && false && (
        <TitleCard
          title="Ringkasan Slip Gaji (Preview Pemula)"
          topMargin="mt-6"
        >
          <div className="grid md:grid-cols-2 grid-cols-1 gap-4 text-sm">
            <div className="rounded-lg bg-base-200 p-4">
              <p>
                <span className="font-semibold">Payroll ID:</span>{" "}
                {latestGenerated.payroll_id}
              </p>
              <p>
                <span className="font-semibold">Pegawai:</span>{" "}
                {latestGenerated?.employee?.name}
              </p>
              <p>
                <span className="font-semibold">Periode:</span>{" "}
                {latestGenerated?.period}
              </p>
            </div>
            <div className="rounded-lg bg-base-200 p-4">
              <p>
                <span className="font-semibold">Net Salary:</span>{" "}
                {formatCurrency(latestGenerated?.details?.net_salary)}
              </p>
              <p>
                <span className="font-semibold">Total Income:</span>{" "}
                {formatCurrency(latestGenerated?.details?.income?.total_income)}
              </p>
              <p>
                <span className="font-semibold">Total Deduction:</span>{" "}
                {formatCurrency(latestGenerated?.details?.total_deduction)}
              </p>
            </div>
          </div>
          <div className="overflow-x-auto mt-4">
            <table className="table table-zebra table-sm">
              <tbody>
                <tr>
                  <td>Gaji Pokok</td>
                  <td className="text-right">
                    {formatCurrency(latestGenerated?.details?.basic_salary)}
                  </td>
                </tr>
                <tr>
                  <td>Tunjangan Total</td>
                  <td className="text-right">
                    {formatCurrency(
                      latestGenerated?.details?.allowances?.total,
                    )}
                  </td>
                </tr>
                <tr>
                  <td>Reimbursement</td>
                  <td className="text-right">
                    {formatCurrency(
                      latestGenerated?.details?.reimbursement_total,
                    )}
                  </td>
                </tr>
                <tr>
                  <td>Total Potongan</td>
                  <td className="text-right">
                    {formatCurrency(latestGenerated?.details?.total_deduction)}
                  </td>
                </tr>
                <tr>
                  <td>Potongan Telat</td>
                  <td className="text-right">
                    {formatCurrency(latestGenerated?.details?.late_deduction)}
                  </td>
                </tr>
                <tr>
                  <td>Potongan Alpha</td>
                  <td className="text-right">
                    {formatCurrency(latestGenerated?.details?.alpha_deduction)}
                  </td>
                </tr>
                <tr>
                  <td>Potongan Cuti Tidak Dibayar</td>
                  <td className="text-right">
                    {formatCurrency(
                      latestGenerated?.details?.unpaid_leave_deduction,
                    )}
                  </td>
                </tr>
                <tr>
                  <td>Potongan BPJS</td>
                  <td className="text-right">
                    {formatCurrency(latestGenerated?.details?.bpjs_deduction)}
                  </td>
                </tr>
                <tr>
                  <td>Potongan Pajak</td>
                  <td className="text-right">
                    {formatCurrency(latestGenerated?.details?.tax_deduction)}
                  </td>
                </tr>
                <tr>
                  <td>Potongan Lain</td>
                  <td className="text-right">
                    {formatCurrency(latestGenerated?.details?.other_deduction)}
                  </td>
                </tr>
                <tr className="font-semibold">
                  <td>Take Home Pay</td>
                  <td className="text-right">
                    {formatCurrency(latestGenerated?.details?.net_salary)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </TitleCard>
      )}

      <input
        type="checkbox"
        id="finance-revision-payroll-pdf-modal"
        className="modal-toggle"
        checked={!!selectedPayrollPdf}
        onChange={closePayrollPdfModal}
      />
      <div className="modal">
        <div className="modal-box max-w-4xl">
          <button
            type="button"
            className="btn btn-sm btn-circle absolute right-2 top-2"
            onClick={closePayrollPdfModal}
          >
            x
          </button>
          <h3 className="font-semibold text-xl mb-4">
            {selectedPayrollPdf?.title || "Slip Gaji"}
          </h3>
          <div className="w-full min-h-[420px] bg-base-200 rounded-lg overflow-hidden flex items-center justify-center">
            {selectedPayrollPdf?.url ? (
              <iframe
                title="Slip Gaji PDF"
                src={selectedPayrollPdf.url}
                className="w-full h-[70vh] border-0"
              />
            ) : (
              <p className="opacity-70">Tidak ada file slip gaji.</p>
            )}
          </div>
        </div>
        <label
          className="modal-backdrop"
          htmlFor="finance-revision-payroll-pdf-modal"
          onClick={closePayrollPdfModal}
        >
          Close
        </label>
      </div>
    </>
  );
}

export default FinancePayroll;
