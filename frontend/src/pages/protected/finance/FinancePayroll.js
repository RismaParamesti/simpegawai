import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../../features/common/headerSlice";
import TitleCard from "../../../components/Cards/TitleCard";
import Pagination from "../../../components/Pagination/Pagination";
import { formatLateDuration } from "../../../components/Typography/LateDurationText";
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

const statusLabelMap = {
  draft: "Draf",
  published: "Dipublikasikan",
  claimed: "Diklaim",
  transferred: "Sudah Ditransfer",
  rejected: "Ditolak",
  approved: "Disetujui",
  submitted: "Menunggu",
};

const getStatusLabel = (status) =>
  statusLabelMap[String(status || "").toLowerCase()] || status || "-";

const DEFAULT_WORKING_HOURS_PER_DAY = 8;

const defaultPayrollSettings = {
  transport_per_day: 50000,
  meal_per_day: 25000,
  health_percentage: 0.01,
  bpjs_percentage: 0.01,
  tax: 0.03,
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

function FinancePayroll() {
  const dispatch = useDispatch();
  const { popup, confirmPopup } = useAppPopup();

  const period = getCurrentPeriod();
  const [error, setError] = useState("");
  const [setupWarning, setSetupWarning] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingPublishAll, setLoadingPublishAll] = useState(false);
  const [loadingReferenceData, setLoadingReferenceData] = useState(false);
  const [loadingMonthlyRows, setLoadingMonthlyRows] = useState(false);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [periodMonth, setPeriodMonth] = useState("");
  const [periodYear, setPeriodYear] = useState("");
  const [recapMonth, setRecapMonth] = useState(period.month);
  const [recapYear, setRecapYear] = useState(period.year);
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
  const [yearlyPayrollRows, setYearlyPayrollRows] = useState([]);
  const [payrollSummaryModal, setPayrollSummaryModal] = useState(null);
  const [selectedPayrollPdf, setSelectedPayrollPdf] = useState(null);
  const [employeeReferenceData, setEmployeeReferenceData] = useState([]);
  const [attendanceSummaryData, setAttendanceSummaryData] = useState([]);
  const [reimbursements, setReimbursements] = useState([]);
  const [managerAdjustments, setManagerAdjustments] = useState([]);
  const [payrollSettings, setPayrollSettings] = useState(
    defaultPayrollSettings,
  );

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
        title: "Payroll Keuangan",
      }),
    );
  }, [dispatch]);

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
        const hasSelectedPeriod = Boolean(periodMonth && periodYear);
        const [
          attendanceSummaryResult,
          reimbursementsResult,
          payrollSettingsResult,
          employeeReferenceResult,
          managerAdjustmentsResult,
        ] = await Promise.allSettled([
          hasSelectedPeriod
            ? financeApi.getAttendanceSummaryAll({
                month: Number(periodMonth),
                year: Number(periodYear),
              })
            : Promise.resolve([]),
          financeApi.getReimbursements(),
          financeApi.getPayrollSettings(),
          financeApi.getEmployeeReferences(),
          hasSelectedPeriod
            ? financeApi.getPayrollManagerAdjustments({
                month: Number(periodMonth),
                year: Number(periodYear),
              })
            : Promise.resolve({ data: [] }),
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
        const payrollSetupValidation = payrollSettingsRow?.validation || {};
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

        const missingPayrollSettings =
          Boolean(payrollSetupValidation.has_missing_payroll_settings) ||
          !payrollSettingsResult?.value?.id;

        // Hitung jumlah posisi commissioner dari data referensi employee (unique position ids)
        const commissionerPositionIds = new Set(
          (employeeRows || [])
            .filter((r) =>
              String(r.position_name || "")
                .toLowerCase()
                .includes("commissioner"),
            )
            .map((r) => String(r.position_id || r.position_id)),
        );

        const rawMissingBase = Number(
          payrollSetupValidation.missing_base_salary_count || 0,
        );
        const rawMissingAllowance = Number(
          payrollSetupValidation.missing_position_allowance_count || 0,
        );

        const adjustedMissingBaseCount = Math.max(
          0,
          rawMissingBase - commissionerPositionIds.size,
        );
        const adjustedMissingAllowanceCount = Math.max(
          0,
          rawMissingAllowance - commissionerPositionIds.size,
        );

        const missingPositionBaseSalary = adjustedMissingBaseCount > 0;
        const missingPositionAllowance = adjustedMissingAllowanceCount > 0;

        if (
          missingPayrollSettings ||
          missingPositionBaseSalary ||
          missingPositionAllowance
        ) {
          const warningParts = [];

          if (missingPayrollSettings) {
            warningParts.push("pengaturan payroll belum lengkap");
          }

          if (missingPositionBaseSalary) {
            warningParts.push(
              `${adjustedMissingBaseCount} posisi masih belum punya gaji pokok`,
            );
          }

          if (missingPositionAllowance) {
            warningParts.push(
              `${adjustedMissingAllowanceCount} posisi masih belum punya tunjangan jabatan`,
            );
          }

          setSetupWarning(
            `Komponen gaji belum lengkap. ${warningParts.join(
              "; ",
            )}. Silakan lengkapi komponen payroll terlebih dahulu sebelum membuat payroll.`,
          );
        } else {
          setSetupWarning("");
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
  }, [periodMonth, periodYear]);

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
      if (!selectedEmployeeId || !periodMonth || !periodYear) {
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
          year: Number(recapYear),
        });

        setMonthlyPayrollRows(rows || []);
      } catch (err) {
        setMonthlyPayrollRows([]);
      } finally {
        setLoadingMonthlyRows(false);
      }
    };

    loadMonthlyRows();
  }, [recapMonth, recapYear, latestGenerated]);

  useEffect(() => {
    const loadYearlyRows = async () => {
      try {
        const rows = await financeApi.getPayrollList();
        const selectedYear = String(recapYear || "").trim();
        setYearlyPayrollRows(
          (rows || []).filter(
            (item) => String(item.period_year || "") === selectedYear,
          ),
        );
      } catch (err) {
        setYearlyPayrollRows([]);
      }
    };

    loadYearlyRows();
  }, [recapYear, latestGenerated]);

  const hasPayrollFiltersSelected = Boolean(
    selectedEmployeeId && periodMonth && String(periodYear).trim(),
  );

  const sortedEmployeeReferenceData = useMemo(() => {
    const rows = [...employeeReferenceData];
    rows.sort((a, b) => {
      const codeA = String(a.employee_code || "").trim();
      const codeB = String(b.employee_code || "").trim();
      return codeA.localeCompare(codeB, "id", {
        numeric: true,
        sensitivity: "base",
      });
    });
    return rows;
  }, [employeeReferenceData]);

  const availableYearOptions = useMemo(() => {
    const currentYear = Number(getCurrentPeriod().year);
    return Array.from({ length: 6 }, (_, index) => String(currentYear + index));
  }, []);

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

  const existingPayrollForSelectedPeriod = useMemo(() => {
    return currentEmployeePayrollRows[0] || null;
  }, [currentEmployeePayrollRows]);

  const hasExistingPayrollForPeriod = Boolean(existingPayrollForSelectedPeriod);

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
      (selectedBasicSalary * Number(payrollSettings.tax || 0.03)).toFixed(2),
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
    if (selectedManagerAdjustment) {
      setManualInput({
        bonus: String(Number(selectedManagerAdjustment.bonus || 0)),
        other_allowance: String(fixedOtherAllowance || 0),
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
    selectedManagerAdjustment,
    selectedEmployeeCurrentPayroll,
    selectedEmployeeId,
    periodMonth,
    periodYear,
    fixedOtherAllowance,
  ]);

  const payrollPreview = useMemo(() => {
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
        const editedBonus = resolveInputValue(
          manualInput.bonus,
          selectedEmployeeCurrentPayroll.bonus,
        );
        const editedOtherAllowance = resolveInputValue(
          manualInput.other_allowance,
          selectedEmployeeCurrentPayroll.other_allowance,
        );
        const editedOtherDeduction = resolveInputValue(
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
        return {
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
        };
      }
    }

    if (latestGeneratedForSelected?.details) {
      return {
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
        netSalary: Number(latestGeneratedForSelected.details?.net_salary || 0),
        presentDays: Number(
          latestGeneratedForSelected.details?.present_days || 0,
        ),
        alphaDays: Number(
          latestGeneratedForSelected.details?.attendance_summary
            ?.total_alpha_days || 0,
        ),
        unpaidLeaveDays: Number(
          latestGeneratedForSelected.details?.attendance_summary
            ?.total_unpaid_leave_days || 0,
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
      };
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
    return {
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
    };
  }, [
    latestGenerated,
    selectedEmployeeCurrentPayroll,
    selectedEmployeeId,
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

  const isManualFieldDisabled = () => {
    return true;
  };

  const handleGenerate = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (setupWarning) {
      setError(setupWarning);
      return;
    }

    if (!selectedEmployeeId || !periodMonth || !periodYear) {
      setError("Pegawai, bulan, dan tahun wajib dipilih");
      return;
    }

    if (hasExistingPayrollForPeriod) {
      setError(
        "Slip gaji untuk pegawai dan periode ini sudah ada. Gunakan slip yang sudah tersedia.",
      );
      return;
    }

    try {
      setLoadingGenerate(true);

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
        "Slip gaji berhasil dibuat, silakan publikasikan slip gaji ini",
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
        year: Number(recapYear),
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

  const handleCancelSelection = () => {
    setSelectedEmployeeId("");
    setPeriodMonth("");
    setPeriodYear("");
    setLatestGenerated(null);
    setError("");
    setSuccessMessage("");
  };

  const doneEmployeeIds = new Set(
    monthlyPayrollRows.map((item) => String(item.employee_id)),
  );
  const employeesWithoutPayroll = employeeReferenceData.filter(
    (item) => !doneEmployeeIds.has(String(item.employee_id)),
  );
  const draftPayrollRows = yearlyPayrollRows.filter(
    (item) => String(item.status || "").toLowerCase() === "draft",
  );
  const payrollSummaryCards = [
    {
      key: "employees",
      title: "Total Pegawai",
      value: employeeReferenceData.length,
      description: "Pegawai aktif yang menjadi referensi payroll",
      tone:
        "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-200",
      rows: employeeReferenceData,
    },
    {
      key: "missing",
      title: "Belum Dibuat Slip",
      value: employeesWithoutPayroll.length,
      description: "Pegawai yang belum punya slip pada periode rekap",
      tone:
        "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/50 dark:bg-orange-950/20 dark:text-orange-200",
      rows: employeesWithoutPayroll,
    },
    {
      key: "draft",
      title: "Belum Dipublikasikan",
      value: draftPayrollRows.length,
      description: `Slip draf sepanjang tahun ${recapYear || "-"}`,
      tone:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-200",
      rows: draftPayrollRows,
    },
  ];
  const recapPayrollRows = monthlyPayrollRows.filter(
    (item) => String(item.status || "").toLowerCase() !== "claimed",
  );
  const recapPagination = useTablePagination(recapPayrollRows);
  const hasDraftToPublish = monthlyPayrollRows.some(
    (item) => item.status === "draft",
  );

  const openPayrollSummaryModal = (card) => {
    setPayrollSummaryModal(card);
  };

  const closePayrollSummaryModal = () => {
    setPayrollSummaryModal(null);
  };

  const handleSelectMissingPayrollEmployee = (employee) => {
    setSelectedEmployeeId(String(employee.employee_id || ""));
    setPeriodMonth(String(recapMonth || period.month));
    setPeriodYear(String(recapYear || period.year));
    setLatestGenerated(null);
    setError("");
    setSuccessMessage("");
    closePayrollSummaryModal();
  };

  return (
    <>
      {popup}
      {(error || setupWarning || successMessage) && (
        <div className="mb-4">
          {error && (
            <div className="alert alert-error mb-2">
              <span>{error}</span>
            </div>
          )}
          {!error && setupWarning && (
            <div className="alert alert-warning mb-2">
              <span>{setupWarning}</span>
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
        <section className="overflow-hidden rounded-[1.5rem] border border-orange-100 bg-gradient-to-r from-orange-50 via-white to-blue-50 p-5 shadow-sm dark:border-orange-900/40 dark:from-orange-950/20 dark:via-slate-950 dark:to-blue-950/20">
          <div className="mb-5">
            <span className="inline-flex rounded-full border border-orange-200 bg-white px-4 py-1 text-sm font-semibold text-orange-600 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-200">
              Payroll Finance
            </span>
            <h2 className="mt-4 text-2xl font-black leading-tight text-base-content">
              Ringkasan Payroll Bulanan
            </h2>
            <p className="mt-2 text-sm text-base-content/60">
              Pantau jumlah pegawai, slip yang belum dibuat, dan slip draf
              yang belum dipublikasikan dalam tahun rekap.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {payrollSummaryCards.map((card) => (
              <button
                key={card.key}
                type="button"
                className={`rounded-2xl border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${card.tone}`}
                onClick={() => openPayrollSummaryModal(card)}
              >
                <p className="text-sm font-semibold">{card.title}</p>
                <p className="mt-4 text-4xl font-black leading-none">
                  {card.value}
                </p>
                <p className="mt-3 text-sm opacity-80">{card.description}</p>
              </button>
            ))}
          </div>
        </section>

        <TitleCard title="Membuat Payroll" topMargin="mt-0">
          <form onSubmit={handleGenerate} className="grid grid-cols-1 gap-4">
            <label className="form-control">
              <span className="label-text mb-1">Pegawai</span>
              <select
                className="select select-bordered w-full"
                value={selectedEmployeeId}
                onChange={(event) => setSelectedEmployeeId(event.target.value)}
                disabled={loadingReferenceData}
              >
                <option value="">Pilih pegawai</option>
                {!employeeReferenceData.length && (
                  <option value="">Data pegawai belum tersedia</option>
                )}
                {sortedEmployeeReferenceData.map((item) => (
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
                  list="payroll-year-options"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Contoh: 2026"
                  onChange={(event) => setPeriodYear(event.target.value)}
                />
              </label>
            </div>

            <datalist id="payroll-year-options">
              {availableYearOptions.map((yearOption) => (
                <option key={yearOption} value={yearOption} />
              ))}
            </datalist>

            {!hasPayrollFiltersSelected && (
              <div className="alert alert-info text-sm">
                <span>
                  Pilih pegawai, bulan, dan tahun terlebih dahulu untuk
                  menampilkan detail perhitungan payroll.
                </span>
              </div>
            )}

            {hasPayrollFiltersSelected && selectedEmployeeSummary && (
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
                            {selectedEmployeeReference?.employee_code || "-"}
                          </span>
                          <span className="inline-flex items-center rounded-full border border-base-300 bg-base-100 px-3 py-1 text-base-content/70">
                            {selectedEmployeeReference?.department_name || "-"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm xl:flex-[1]">
                      {[
                        [
                          "Level",
                          selectedEmployeeReference?.position_level || "-",
                        ],
                        [
                          "Status",
                          selectedEmployeeReference?.user_status || "-",
                        ],
                        [
                          "Posisi",
                          selectedEmployeeReference?.position_name || "-",
                        ],
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
            {hasPayrollFiltersSelected && (
              <>
                {hasExistingPayrollForPeriod && (
                  <div className="alert alert-warning text-sm">
                    <span>
                      Slip gaji untuk pegawai dan periode ini sudah pernah
                      dibuat (ID: {existingPayrollForSelectedPeriod?.id}).
                      Pembuatan slip baru dinonaktifkan.
                    </span>
                  </div>
                )}

                <div className="grid gap-3 text-sm lg:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/20">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-semibold text-emerald-700 dark:text-emerald-200">
                        Kehadiran
                      </p>
                      <span className="rounded-full border border-emerald-200 bg-white/70 px-3 py-1 text-xs text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
                        Bulanan
                      </span>
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
                          className="rounded-2xl border border-emerald-100 bg-white px-3 py-3 shadow-sm dark:border-emerald-900/40 dark:bg-slate-900"
                        >
                          <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-700/70 dark:text-emerald-200/70">
                            {label}
                          </p>
                          <p className="mt-1 font-semibold leading-tight tabular-nums">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4 shadow-sm dark:border-sky-900/50 dark:bg-sky-950/20">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-semibold text-sky-700 dark:text-sky-200">
                        Parameter
                      </p>
                      <span className="rounded-full border border-sky-200 bg-white/70 px-3 py-1 text-xs text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-200">
                        Otomatis
                      </span>
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
                          className="rounded-2xl border border-sky-100 bg-white px-3 py-3 shadow-sm dark:border-sky-900/40 dark:bg-slate-900"
                        >
                          <p className="text-[10px] uppercase tracking-[0.18em] text-sky-700/70 dark:text-sky-200/70">
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

                <div className="alert alert-info text-sm">
                  <span>
                    Bonus dan potongan lain mengikuti penyesuaian manajer.
                    Tunjangan jabatan tetap otomatis dan hanya-baca.
                  </span>
                </div>

                <div className="overflow-hidden rounded-2xl border border-orange-200 bg-orange-50/30 shadow-sm dark:border-orange-900/50 dark:bg-orange-950/20">
                  <div className="border-b border-orange-200 bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 text-white dark:border-orange-900/50">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-base font-semibold">
                          Pratinjau Perhitungan Payroll
                        </p>
                        <p className="text-xs opacity-90">
                          Ringkasan otomatis sebelum slip dibuat.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                        <p className="text-xs uppercase tracking-wide text-emerald-700/70 dark:text-emerald-200/70">
                          Gaji Yang Diterima
                        </p>
                        <p className="mt-1 text-2xl font-black leading-tight text-emerald-700 dark:text-emerald-200">
                          {formatCurrency(payrollPreview.netSalary)}
                        </p>
                        <p className="mt-1 text-xs text-emerald-800/70 dark:text-emerald-100/70">
                          Nominal akhir yang diterima pegawai.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-900/50 dark:bg-sky-950/20">
                        <p className="text-xs uppercase tracking-wide text-sky-700/70 dark:text-sky-200/70">
                          Total Pendapatan
                        </p>
                        <p className="mt-1 text-xl font-bold leading-tight text-sky-800 dark:text-sky-100">
                          {formatCurrency(payrollPreview.totalIncome)}
                        </p>
                        <p className="mt-2 text-xs text-sky-800/70 dark:text-sky-100/70">
                          Gaji pokok, tunjangan, bonus, dan reimbursement.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
                        <p className="text-xs uppercase tracking-wide text-red-700/70 dark:text-red-200/70">
                          Total Potongan
                        </p>
                        <p className="mt-1 text-xl font-bold leading-tight text-red-800 dark:text-red-100">
                          {formatCurrency(payrollPreview.totalDeduction)}
                        </p>
                        <p className="mt-2 text-xs text-red-800/70 dark:text-red-100/70">
                          Keterlambatan, alpha, pajak, dan potongan lain.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-2">
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                        <div className="mb-3 flex items-center justify-between">
                          <p className="font-semibold text-emerald-700 dark:text-emerald-200">
                            Pendapatan
                          </p>
                          <span className="text-xs text-emerald-700/70 dark:text-emerald-200/70">
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
                            [
                              "Tunjangan Jabatan",
                              payrollPreview.otherAllowance,
                            ],
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
                                  ? "bg-white font-semibold shadow-sm dark:bg-slate-900"
                                  : "bg-white/70 dark:bg-slate-900/70"
                              }`}
                            >
                              <span className="text-sm opacity-80">
                                {label}
                              </span>
                              <span className="text-sm font-medium text-right tabular-nums">
                                {formatCurrency(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4 dark:border-red-900/50 dark:bg-red-950/20">
                        <div className="mb-3 flex items-center justify-between">
                          <p className="font-semibold text-red-700 dark:text-red-200">
                            Potongan
                          </p>
                          <span className="text-xs text-red-700/70 dark:text-red-200/70">
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
                                label === "Total Potongan" ||
                                label === "Gaji yang Diterima"
                                  ? "bg-white font-semibold shadow-sm dark:bg-slate-900"
                                  : "bg-white/70 dark:bg-slate-900/70"
                              }`}
                            >
                              <span className="text-sm opacity-80">
                                {label}
                              </span>
                              <span
                                className={`text-sm font-medium text-right tabular-nums ${
                                  label === "Gaji yang Diterima"
                                    ? "text-primary text-base font-bold"
                                    : ""
                                }`}
                              >
                                {formatCurrency(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <input
                  className="input input-bordered w-full"
                  value={autoPayrollId ? `ID Payroll: ${autoPayrollId}` : ""}
                  disabled
                />

                <button
                  className={`btn btn-primary w-full ${loadingGenerate ? "loading" : ""}`}
                  type="submit"
                  disabled={
                    loadingGenerate ||
                    hasExistingPayrollForPeriod ||
                    Boolean(setupWarning)
                  }
                >
                  {hasExistingPayrollForPeriod
                    ? "Slip Sudah Dibuat"
                    : setupWarning
                      ? "Lengkapi Komponen Gaji"
                      : "Buat Slip Gaji"}
                </button>

                <button
                  className="btn btn-error w-full"
                  type="button"
                  onClick={handleCancelSelection}
                >
                  Batal
                </button>
              </>
            )}
          </form>

          {hasPayrollFiltersSelected &&
            latestGenerated?.payroll_id &&
            String(latestGenerated?.employee?.id) ===
              String(selectedEmployeeId) && (
              <div className="mt-5 overflow-hidden rounded-2xl border border-indigo-200 bg-indigo-50/30 shadow-sm dark:border-indigo-900/50 dark:bg-indigo-950/20">
                <div className="border-b border-indigo-200 bg-gradient-to-r from-indigo-500 to-blue-500 px-4 py-3 text-white dark:border-indigo-900/50">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-base font-semibold">Detail Slip Gaji</p>
                      <p className="text-xs opacity-90">
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
                    <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm dark:border-indigo-900/40 dark:bg-slate-900">
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
                        <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-200">
                          {latestGenerated.payroll_id}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ["Gaji Bersih", formatCurrency(latestGenerated?.details?.net_salary)],
                        [
                          "Pendapatan",
                          formatCurrency(latestGenerated?.details?.income?.total_income),
                        ],
                        [
                          "Potongan",
                          formatCurrency(latestGenerated?.details?.total_deduction),
                        ],
                        [
                          "Reimbursement",
                          formatCurrency(latestGenerated?.details?.reimbursement_total),
                        ],
                      ].map(([label, value], index) => (
                        <div
                          key={label}
                          className={`rounded-2xl border px-4 py-3 ${
                            index === 0
                              ? "border-primary/15 bg-primary/10"
                              : "border-indigo-100 bg-white dark:border-indigo-900/40 dark:bg-slate-900"
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

                  <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm dark:border-indigo-900/40 dark:bg-slate-900">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-semibold">Rincian Komponen</p>
                      <span className="text-xs opacity-60">Perhitungan final</span>
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
                          className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60"
                        >
                          <span className="text-sm opacity-80">{label}</span>
                          <span className="text-sm font-semibold tabular-nums">
                            {formatCurrency(value)}
                          </span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                        <span className="text-sm font-semibold">Gaji Diterima</span>
                        <span className="text-base font-black text-emerald-700 tabular-nums dark:text-emerald-200">
                          {formatCurrency(latestGenerated?.details?.net_salary)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </TitleCard>

        <TitleCard title="Rekap Slip Gaji & Publikasi" topMargin="mt-0">
          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50/60 p-3 dark:border-blue-900/50 dark:bg-blue-950/20">
            <span className="badge border-blue-200 bg-white text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200">
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
              Slip dibuat: {doneEmployeeIds.size}/{employeeReferenceData.length}
            </span>
            <span className="badge border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200">
              Draf:{" "}
              {
                monthlyPayrollRows.filter((item) => item.status === "draft")
                  .length
              }
            </span>
          </div>

          <div className="mb-3 grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-900/50">
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
                value={recapYear}
                list="recap-year-options"
                inputMode="numeric"
                pattern="[0-9]*"
                onChange={(event) => setRecapYear(event.target.value)}
              />
            </label>
          </div>

          <datalist id="recap-year-options">
            {availableYearOptions.map((yearOption) => (
              <option key={`recap-${yearOption}`} value={yearOption} />
            ))}
          </datalist>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="table table-zebra table-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100">
                  <th>ID Payroll</th>
                  <th>Pegawai</th>
                  <th>Gaji Pokok</th>
                  <th>Penggantian Dana</th>
                  <th>Gaji Bersih</th>
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
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="btn btn-xs rounded-full border-blue-600 bg-blue-600 px-4 text-white hover:border-blue-700 hover:bg-blue-700"
                          onClick={() => handleViewRow(item)}
                        >
                          Lihat
                        </button>
                        <button
                          type="button"
                          className="btn btn-xs rounded-full border-amber-500 bg-amber-400 px-4 text-slate-900 hover:border-amber-600 hover:bg-amber-500"
                          onClick={() => handleEditRow(item)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-xs btn-error text-white rounded-full"
                          onClick={() => handleDeleteRow(item)}
                          disabled={item.status !== "draft"}
                        >
                          Hapus
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
            className={`btn w-full mt-4 rounded-2xl border-none bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md hover:from-orange-600 hover:to-amber-600 ${loadingPublishAll ? "loading" : ""}`}
            onClick={handlePublishAll}
            disabled={!hasDraftToPublish || loadingPublishAll}
          >
            Publikasikan Semua Slip Bulan Ini
          </button>
        </TitleCard>
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
                  <td>Potongan Keterlambatan</td>
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

      {payrollSummaryModal ? (
        <div className="modal modal-open">
          <div className="modal-box max-w-5xl">
            <button
              type="button"
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={closePayrollSummaryModal}
            >
              x
            </button>
            <div className="mb-4 pr-8">
              <h3 className="text-xl font-bold">
                {payrollSummaryModal.title}
              </h3>
              <p className="mt-1 text-sm text-base-content/60">
                {payrollSummaryModal.description}
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-base-200">
              <table className="table table-zebra table-sm">
                <thead>
                  <tr className="bg-base-200/80">
                    {payrollSummaryModal.key === "draft" ? (
                      <>
                        <th>ID Payroll</th>
                        <th>Pegawai</th>
                        <th>Periode</th>
                        <th>Gaji Bersih</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </>
                    ) : (
                      <>
                        <th>Kode</th>
                        <th>Nama Pegawai</th>
                        <th>Posisi</th>
                        <th>Departemen</th>
                        <th>Aksi</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {payrollSummaryModal.rows.length ? (
                    payrollSummaryModal.rows.map((item) =>
                      payrollSummaryModal.key === "draft" ? (
                        <tr key={`draft-${item.id}`}>
                          <td>{item.id}</td>
                          <td>{item.employee_name || "-"}</td>
                          <td>
                            {item.period_month}/{item.period_year}
                          </td>
                          <td>
                            {formatCurrency(
                              item.final_amount || item.net_salary,
                            )}
                          </td>
                          <td>
                            <span
                              className={`badge ${statusBadgeClass[item.status] || "badge-outline"}`}
                            >
                              {getStatusLabel(item.status)}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-xs rounded-full border-amber-500 bg-amber-400 px-4 text-slate-900 hover:border-amber-600 hover:bg-amber-500"
                              onClick={() => {
                                handleEditRow(item);
                                closePayrollSummaryModal();
                              }}
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ) : (
                        <tr key={`employee-${item.employee_id}`}>
                          <td>{item.employee_code || "-"}</td>
                          <td>{item.employee_name || "-"}</td>
                          <td>{item.position_name || "-"}</td>
                          <td>{item.department_name || "-"}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-xs rounded-full btn-primary px-4"
                              onClick={() =>
                                handleSelectMissingPayrollEmployee(item)
                              }
                            >
                              Pilih
                            </button>
                          </td>
                        </tr>
                      ),
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan={payrollSummaryModal.key === "draft" ? 6 : 5}
                        className="py-8 text-center text-base-content/60"
                      >
                        Tidak ada data untuk ditampilkan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <label
            className="modal-backdrop"
            onClick={closePayrollSummaryModal}
          >
            Close
          </label>
        </div>
      ) : null}

      <input
        type="checkbox"
        id="finance-payroll-pdf-modal"
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
          htmlFor="finance-payroll-pdf-modal"
          onClick={closePayrollPdfModal}
        >
          Close
        </label>
      </div>
    </>
  );
}

export default FinancePayroll;
