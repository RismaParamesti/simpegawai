import { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setPageTitle } from "../../../features/common/headerSlice";
import TitleCard from "../../../components/Cards/TitleCard";
import MiniCalendar from "../../../components/Calendar/MiniCalendar";
import { pegawaiApi } from "../../../features/pegawai/api";
import {
  calculateAccuratePercentage,
  calculateWorkdaysInMonth,
} from "../../../utils/attendanceUtils";

const SP_ALERT_STORAGE_KEY = "lastSeenWarningLetterId";
const EMPLOYEE_WELCOME_DISMISSED_KEY = "employeeWelcomeDismissed";
const EMPLOYEE_WELCOME_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

const formatTime = (value) => {
  if (!value) return "-";
  return String(value).slice(0, 5);
};

const parseTimeToSeconds = (value) => {
  if (!value || typeof value !== "string") return null;
  const [hourPart = "0", minutePart = "0", secondPart = "0"] = value.split(":");
  const hours = Number(hourPart);
  const minutes = Number(minutePart);
  const seconds = Number(secondPart);
  if ([hours, minutes, seconds].some((num) => Number.isNaN(num))) return null;
  return hours * 3600 + minutes * 60 + seconds;
};

const getAttendanceWorkingHoursWindow = (attendance = {}) => {
  const schedule = attendance?.working_hours_schedule || {};
  const checkInTime =
    attendance?.standard_check_in || schedule.check_in_time || "08:00:00";
  const checkOutTime =
    attendance?.standard_check_out || schedule.check_out_time || "17:00:00";

  return {
    checkInTime,
    checkOutTime,
    checkInSeconds: parseTimeToSeconds(checkInTime) ?? 0,
    checkOutSeconds: parseTimeToSeconds(checkOutTime) ?? 0,
    label: `${formatTime(checkInTime)} - ${formatTime(checkOutTime)}`,
  };
};

const formatDateKey = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeSanctionLevel = (value) => {
  const raw = String(value || "")
    .toLowerCase()
    .trim();
  if (!raw || raw === "none" || raw === "0" || raw === "-") return "none";

  if (/^\d+$/.test(raw)) {
    return `sp${Number.parseInt(raw, 10)}`;
  }

  const spMatch = raw.match(/^sp\s*[-_]?\s*(\d+)$/i);
  if (spMatch) {
    return `sp${Number.parseInt(spMatch[1], 10)}`;
  }

  return raw.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "none";
};

const formatSanctionLabel = (value) => {
  const raw = String(value || "").trim();
  if (!raw || raw.toLowerCase() === "none") return "Belum Ada SP";
  const spMatch = raw.match(/^\s*sp\s*[-_]?\s*(\d+)\s*$/i);
  if (spMatch) return `SP${spMatch[1]}`;
  return raw
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getMatchingWarningRule = (rules, sanctionLevel) => {
  const normalizedSanction = normalizeSanctionLevel(sanctionLevel);
  return (
    rules.find(
      (rule) =>
        normalizeSanctionLevel(rule.sanction_level) === normalizedSanction,
    ) || null
  );
};

const getRuleThresholdSummary = (rule) => {
  if (!rule) return "";

  const alphaParts = [];
  const lateParts = [];

  if (Number(rule.min_consecutive_alpha || 0) > 0) {
    alphaParts.push(`${Number(rule.min_consecutive_alpha)} alpha berturut`);
  }
  if (Number(rule.min_accumulated_alpha || 0) > 0) {
    alphaParts.push(`${Number(rule.min_accumulated_alpha)} alpha akumulasi`);
  }
  if (Number(rule.min_consecutive_late || 0) > 0) {
    lateParts.push(`${Number(rule.min_consecutive_late)} terlambat berturut`);
  }
  if (Number(rule.min_accumulated_late || 0) > 0) {
    lateParts.push(`${Number(rule.min_accumulated_late)} terlambat akumulasi`);
  }

  const summary = [];
  if (alphaParts.length > 0) summary.push(`Alpha: ${alphaParts.join(" / ")}`);
  if (lateParts.length > 0) summary.push(`Telat: ${lateParts.join(" / ")}`);

  return summary.join(" • ");
};

const alphaSanctionBadgeMap = {
  none: "badge-ghost",
  sp1: "badge-info",
  sp2: "badge-warning",
  sp3: "badge-error",
  evaluasi_hr: "badge-secondary",
  tindak_lanjut: "badge-secondary",
  nonaktif: "badge-secondary",
};

function EmployeeDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState({});
  const [dashboard, setDashboard] = useState({});
  const [attendanceSummary, setAttendanceSummary] = useState({});
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState({});
  const [warningRules, setWarningRules] = useState([]);
  const [showWarningPopup, setShowWarningPopup] = useState(false);
  const [showEmployeeWelcome, setShowEmployeeWelcome] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    const [
      profileResult,
      dashboardResult,
      summaryResult,
      historyResult,
      todayResult,
      warningRulesResult,
    ] = await Promise.allSettled([
      pegawaiApi.getProfile(),
      pegawaiApi.getDashboard(),
      pegawaiApi.getAttendanceSummary({
        month: currentMonth,
        year: currentYear,
      }),
      pegawaiApi.getAttendanceHistory({
        month: currentMonth,
        year: currentYear,
        limit: 200,
      }),
      pegawaiApi.getAttendanceToday(),
      pegawaiApi.getAttendanceWarningRulesPublic(),
    ]);

    if (profileResult.status === "fulfilled") {
      setProfile(profileResult.value || {});
    } else {
      setProfile({});
    }

    if (dashboardResult.status === "fulfilled") {
      setDashboard(dashboardResult.value || {});
    } else {
      setDashboard({
        summary: {},
        payrolls: [],
        reimbursements: [],
        salary_appeals: [],
        leave_requests: [],
      });
    }

    if (summaryResult.status === "fulfilled") {
      setAttendanceSummary(summaryResult.value?.data || {});
    } else {
      setAttendanceSummary({});
    }

    if (historyResult.status === "fulfilled") {
      setAttendanceHistory(historyResult.value?.data || []);
    } else {
      setAttendanceHistory([]);
    }

    if (todayResult.status === "fulfilled") {
      setTodayAttendance(todayResult.value || {});
    } else {
      setTodayAttendance({});
    }

    if (warningRulesResult.status === "fulfilled") {
      setWarningRules(warningRulesResult.value?.data || []);
    } else {
      setWarningRules([]);
    }

    const historyData =
      historyResult.status === "fulfilled"
        ? historyResult.value?.data || []
        : [];
    const nowDate = new Date();
    const isCurrentPeriod =
      Number(currentMonth) === nowDate.getMonth() + 1 &&
      Number(currentYear) === nowDate.getFullYear();

    if (isCurrentPeriod && historyData.length === 0) {
      const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

      const [previousSummaryResult, previousHistoryResult] =
        await Promise.allSettled([
          pegawaiApi.getAttendanceSummary({
            month: previousMonth,
            year: previousYear,
          }),
          pegawaiApi.getAttendanceHistory({
            month: previousMonth,
            year: previousYear,
            limit: 200,
          }),
        ]);

      const previousHistoryData =
        previousHistoryResult.status === "fulfilled"
          ? previousHistoryResult.value?.data || []
          : [];

      if (previousHistoryData.length > 0) {
        setCurrentMonth(previousMonth);
        setCurrentYear(previousYear);
        setAttendanceHistory(previousHistoryData);
        setAttendanceSummary(
          previousSummaryResult.status === "fulfilled"
            ? previousSummaryResult.value?.data || {}
            : {},
        );
      }
    }

    if (
      profileResult.status === "rejected" &&
      dashboardResult.status === "rejected" &&
      summaryResult.status === "rejected" &&
      historyResult.status === "rejected" &&
      todayResult.status === "rejected"
    ) {
      setError("Semua data dashboard gagal dimuat");
    }

    setLoading(false);
  }, [currentMonth, currentYear]);

  const handleCheckIn = async () => {
    try {
      await pegawaiApi.checkIn();
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCheckOut = async () => {
    try {
      await pegawaiApi.checkOut();
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  useEffect(() => {
    dispatch(setPageTitle({ title: "Dashboard Pegawai" }));
    loadDashboard();
  }, [dispatch, loadDashboard]);

  useEffect(() => {
    const sanctionLevel = normalizeSanctionLevel(
      attendanceSummary?.alpha_discipline?.alpha_sanction_level,
    );
    const currentRule = getMatchingWarningRule(warningRules, sanctionLevel);

    if (!currentRule || sanctionLevel === "none") {
      setShowWarningPopup(false);
      return;
    }

    const currentNoticeKey = `${sanctionLevel}:${currentRule.id}:${attendanceSummary?.alpha_discipline?.alpha_last_evaluated_at || ""}`;
    const lastSeenId = localStorage.getItem(SP_ALERT_STORAGE_KEY);
    if (lastSeenId !== currentNoticeKey) {
      setShowWarningPopup(true);
    }
  }, [attendanceSummary, warningRules]);

  useEffect(() => {
    const convertedAt = new Date(
      profile?.converted_at || profile?.employee?.created_at,
    ).getTime();
    const storageKey = `${EMPLOYEE_WELCOME_DISMISSED_KEY}:${profile?.user?.id || ""}`;
    const isWithinWelcomePeriod =
      Number.isFinite(convertedAt) &&
      Date.now() - convertedAt >= 0 &&
      Date.now() - convertedAt < EMPLOYEE_WELCOME_DURATION_MS;

    setShowEmployeeWelcome(
      Boolean(
        profile?.converted_from_candidate &&
          isWithinWelcomePeriod &&
          !localStorage.getItem(storageKey),
      ),
    );
  }, [profile]);

  if (loading) {
    return (
      <div className="text-center py-10 text-lg">
        Memuat dashboard pegawai...
      </div>
    );
  }

  const summary = dashboard?.summary || {};
  const payrolls = dashboard?.payrolls || [];
  const leaveRequests = dashboard?.leave_requests || [];

  const hasSummaryFromApi =
    Number(attendanceSummary?.present_days || 0) > 0 ||
    Number(attendanceSummary?.late_days || 0) > 0 ||
    Number(attendanceSummary?.permission_days || 0) > 0 ||
    Number(attendanceSummary?.absent_days || 0) > 0;
  const fallbackSummaryFromHistory = attendanceHistory.reduce(
    (accumulator, item) => {
      const normalizedStatus = String(item?.status || "").toLowerCase();
      const lateMinutes = Number(item?.late_minutes || 0);

      if (normalizedStatus === "hadir") accumulator.present_days += 1;
      if (normalizedStatus === "izin" || normalizedStatus === "sakit") {
        accumulator.permission_days += 1;
      }
      if (normalizedStatus === "alpha") accumulator.absent_days += 1;
      if (lateMinutes > 60) {
        accumulator.late_days += 1;
      }

      return accumulator;
    },
    {
      present_days: 0,
      late_days: 0,
      permission_days: 0,
      absent_days: 0,
    },
  );

  const displayedSummary = hasSummaryFromApi
    ? attendanceSummary
    : fallbackSummaryFromHistory;

  const presentDays = Number(displayedSummary?.present_days || 0);
  const lateDays = Number(displayedSummary?.late_days || 0);
  const consecutiveLate = (() => {
    try {
      const hist = (attendanceHistory || []).slice().sort((a, b) => {
        const da = new Date(a.date || 0).getTime();
        const db = new Date(b.date || 0).getTime();
        return db - da;
      });
      let cnt = 0;
      for (const item of hist) {
        const isLate =
          Number(item?.late_minutes || 0) > 0 || Boolean(item?.is_late);
        if (isLate) cnt += 1;
        else break;
      }
      return cnt;
    } catch (e) {
      return 0;
    }
  })();
  const permissionDays = Number(displayedSummary?.permission_days || 0);
  const absentDays = Number(displayedSummary?.absent_days || 0);
  const discipline = displayedSummary?.alpha_discipline || {};
  const sanctionLevel = normalizeSanctionLevel(
    discipline?.alpha_sanction_level,
  );
  const sanctionLabel =
    discipline?.alpha_sanction_label || formatSanctionLabel(sanctionLevel);
  const sanctionBadgeClass =
    discipline?.alpha_sanction_badge ||
    alphaSanctionBadgeMap[sanctionLevel] ||
    "badge-ghost";
  const currentWarningRule = getMatchingWarningRule(
    warningRules,
    sanctionLevel,
  );
  const currentWarningRuleLabel =
    currentWarningRule?.sanction_label ||
    formatSanctionLabel(currentWarningRule?.sanction_level || sanctionLevel);
  const currentWarningRuleThresholdSummary =
    getRuleThresholdSummary(currentWarningRule);
  const currentNoticeKey = `${sanctionLevel}:${currentWarningRule?.id || "none"}:${discipline?.alpha_last_evaluated_at || ""}`;
  const totalWorkdays = calculateWorkdaysInMonth(currentMonth, currentYear);
  const performancePercent = calculateAccuratePercentage(
    presentDays,
    currentMonth,
    currentYear,
  );

  const hasCheckedIn = !!todayAttendance?.check_in;
  const hasCheckedOut = !!todayAttendance?.check_out;
  const hasApprovedSpecialPermission = Boolean(todayAttendance?.can_attendance);
  const specialPermissionSeconds = todayAttendance?.special_permission_time
    ? (() => {
        const [hours = "0", minutes = "0", seconds = "0"] = String(
          todayAttendance.special_permission_time,
        ).split(":");
        return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
      })()
    : null;

  const isLeaveIntegratedToday =
    ["izin", "sakit", "libur"].includes(
      String(todayAttendance?.status || "").toLowerCase(),
    ) && !hasApprovedSpecialPermission;
  const attendanceDate = todayAttendance?.date
    ? new Date(todayAttendance.date)
    : new Date();
  const isSundayToday = attendanceDate.getDay() === 0;
  const attendanceWindow = getAttendanceWorkingHoursWindow(todayAttendance);
  const now = new Date();
  const currentSeconds =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const checkInStartSeconds = attendanceWindow.checkInSeconds;
  const checkInCutoffSeconds = attendanceWindow.checkOutSeconds;
  const todayDateKey = formatDateKey(new Date());
  const activeApprovedLeaveToday = leaveRequests.find((item) => {
    if (String(item?.status || "").toLowerCase() !== "approved") return false;
    const startDate = formatDateKey(item?.start_date);
    const endDate = formatDateKey(item?.end_date);
    if (!startDate || !endDate) return false;
    return todayDateKey >= startDate && todayDateKey <= endDate;
  });
  const isCheckInTooEarly =
    currentSeconds < checkInStartSeconds && !hasCheckedIn;
  const isCheckInCutoffPassed =
    currentSeconds > checkInCutoffSeconds && !hasCheckedIn;
  const isOutsideWorkingHours =
    currentSeconds < checkInStartSeconds ||
    currentSeconds > checkInCutoffSeconds;
  const isAfterCutoff = currentSeconds > checkInCutoffSeconds;

  const canCheckInNow =
    !hasCheckedIn &&
    !isSundayToday &&
    !isLeaveIntegratedToday &&
    !isAfterCutoff &&
    (!isOutsideWorkingHours ||
      (hasApprovedSpecialPermission &&
        specialPermissionSeconds !== null &&
        currentSeconds >= specialPermissionSeconds));

  const canCheckOutNow =
    !!hasCheckedIn &&
    !hasCheckedOut &&
    !isSundayToday &&
    !isLeaveIntegratedToday &&
    !isAfterCutoff &&
    (!isOutsideWorkingHours ||
      (hasApprovedSpecialPermission &&
        specialPermissionSeconds !== null &&
        currentSeconds >= specialPermissionSeconds));

  const openAttendanceTodayCard = () => {
    navigate("/app/attendance", {
      state: { focusAttendanceToday: true },
    });
  };

  const DashboardHeroIllustration = () => (
    <div className="pointer-events-none absolute right-10 top-2 hidden h-32 w-80 lg:block">
      <div className="absolute bottom-2 right-0 h-20 w-72 rounded-full bg-orange-100/80 blur-[1px] dark:bg-orange-900/30" />
      <div className="absolute right-36 top-1 h-24 w-20 rotate-[-3deg] rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2 border-b border-orange-100 px-2 py-2 dark:border-slate-700">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-orange-500 dark:bg-orange-900/40 dark:text-orange-300">
            ✓
          </div>
          <div className="space-y-1">
            <div className="h-1.5 w-8 rounded-full bg-orange-400 dark:bg-orange-300" />
            <div className="h-1.5 w-6 rounded-full bg-slate-200 dark:bg-slate-600" />
          </div>
        </div>
        <div className="space-y-1.5 px-3 py-2">
          <div className="h-1.5 w-12 rounded-full bg-orange-300 dark:bg-orange-400" />
          <div className="h-1.5 w-10 rounded-full bg-emerald-200 dark:bg-emerald-400" />
          <div className="h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-600" />
          <div className="h-1.5 w-8 rounded-full bg-orange-200 dark:bg-orange-800" />
        </div>
      </div>
      <div className="absolute right-24 top-16 h-14 w-14 rounded-2xl bg-orange-400 shadow-md dark:bg-orange-500" />
      <div className="absolute right-8 top-8 h-14 w-14 rounded-2xl bg-emerald-200 shadow-sm dark:bg-emerald-500/70" />
      <div className="absolute right-12 top-20 h-2 w-20 rounded-full bg-slate-300 dark:bg-slate-600" />
      <div className="absolute right-14 top-24 h-8 w-2 rounded-full bg-slate-400 dark:bg-slate-500" />
      <div className="absolute right-28 top-24 h-8 w-2 rounded-full bg-slate-400 dark:bg-slate-500" />
    </div>
  );

  const attendanceCards = [
    {
      label: "Absen Masuk",
      value: formatTime(todayAttendance?.check_in),
      tone: "orange",
    },
    {
      label: "Absen Pulang",
      value: formatTime(todayAttendance?.check_out),
      tone: "emerald",
    },
    {
      label: "Status",
      value: todayAttendance?.status || "Belum absen",
      tone: "amber",
    },
    {
      label: "Durasi Kerja",
      value: todayAttendance?.working_hours
        ? `${todayAttendance.working_hours}j`
        : "-",
      tone: "slate",
    },
  ];

  const monthSummaryCards = [
    {
      label: "Hadir",
      value: `${presentDays} hari`,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    },
    {
      label: "Terlambat",
      value: `${lateDays} hari`,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
    {
      label: "Izin/Cuti",
      value: `${permissionDays} hari`,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      label: "Alpha",
      value: `${absentDays} hari`,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
    },
  ];

  return (
    <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white p-4 shadow-[0_20px_70px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-950 dark:shadow-[0_20px_70px_rgba(2,6,23,0.45)] sm:p-7">
      <div className="space-y-6">
        {showEmployeeWelcome && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-bold">Anda telah menjadi pegawai.</p>
                <p className="mt-1 text-sm">
                  Selamat bergabung. Gunakan dashboard ini untuk aktivitas
                  kepegawaian Anda.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm rounded-xl"
                aria-label="Tutup notifikasi selamat datang"
                onClick={() => {
                  localStorage.setItem(
                    `${EMPLOYEE_WELCOME_DISMISSED_KEY}:${profile?.user?.id || ""}`,
                    "true",
                  );
                  setShowEmployeeWelcome(false);
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-semibold">{error}</span>
              <button
                className="btn btn-sm rounded-xl border-none bg-red-500 text-white hover:bg-red-600"
                onClick={loadDashboard}
              >
                Muat Ulang
              </button>
            </div>
          </div>
        )}

        {/* HERO */}
        <div className="relative min-h-[130px] overflow-hidden rounded-[1.4rem] bg-gradient-to-r from-white via-white to-orange-50/80 px-5 py-6 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 sm:px-6">
          <DashboardHeroIllustration />

          <div className="relative z-10 max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600 dark:border-orange-900/60 dark:bg-orange-950/70 dark:text-orange-300">
              Dashboard Pegawai
            </div>

            <h1 className="text-[28px] font-extrabold leading-tight text-slate-900 dark:text-slate-50">
              Hai, {profile?.user?.name || profile?.user?.username || "Pegawai"}
              !
            </h1>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-xl">
              🕒
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">
                Absensi Hari Ini
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Kehadiran dan aktivitas absensi Anda hari ini
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {isSundayToday
                ? "Hari ini hari libur, kamu tidak perlu absen."
                : isCheckInCutoffPassed
                  ? `Jam absensi sudah berakhir pada pukul ${formatTime(
                      attendanceWindow.checkOutTime,
                    )}.`
                  : isLeaveIntegratedToday
                    ? `Hari ini status kamu ${
                        todayAttendance?.status ||
                        activeApprovedLeaveToday?.leave_type ||
                        "izin/cuti"
                      }. Kamu tidak perlu absen.`
                    : hasApprovedSpecialPermission
                      ? "Kamu memiliki izin khusus hari ini. Silakan absen sesuai waktu yang disetujui."
                      : isCheckInTooEarly
                        ? `Absensi hanya bisa dilakukan pada jam kerja ${attendanceWindow.label}.`
                        : !hasCheckedIn
                          ? "Hari ini kamu belum absen masuk."
                          : !hasCheckedOut
                            ? "Hari ini kamu belum absen pulang."
                            : "Hari ini kamu sudah menyelesaikan absensi."}
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              className="btn flex-1 rounded-2xl border-none bg-orange-500 text-white hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-500"
              disabled={!canCheckInNow}
              onClick={handleCheckIn}
            >
              Absen Masuk
            </button>

            <button
              className="btn flex-1 rounded-2xl border-none bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-500"
              disabled={!canCheckOutNow}
              onClick={handleCheckOut}
            >
              Absen Pulang
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <div
              className="cursor-pointer rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              onClick={openAttendanceTodayCard}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openAttendanceTodayCard();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Buka halaman Absensi Hari Ini"
            >
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">
                    Status Kehadiran Hari Ini
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Klik card ini untuk membuka detail absensi.
                  </p>
                </div>
                <span className="w-fit rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600 dark:border-orange-900/60 dark:bg-orange-950/70 dark:text-orange-300">
                  {attendanceWindow.label}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {attendanceCards.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-950/50"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {item.label}
                    </p>
                    <p className="mt-2 text-lg font-extrabold capitalize text-slate-900 dark:text-slate-50">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">
                    Ringkasan Bulan Ini
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Rekap kehadiran bulan{" "}
                    {new Date(currentYear, currentMonth - 1).toLocaleString(
                      "id-ID",
                      { month: "long" },
                    )}{" "}
                    {currentYear}.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {monthSummaryCards.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => navigate("/app/attendance")}
                    className={`rounded-2xl border ${item.border} ${item.bg} p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-950/50`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {item.label}
                    </p>
                    <p className={`mt-2 text-2xl font-extrabold ${item.color}`}>
                      {item.value}
                    </p>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => navigate("/app/attendance")}
                  className="rounded-2xl border border-orange-200 bg-orange-50 p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-orange-900/60 dark:bg-orange-950/30"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-600/80 dark:text-orange-300">
                    Persentase Kehadiran
                  </p>
                  <p className="mt-2 text-4xl font-extrabold text-orange-600 dark:text-orange-300">
                    {performancePercent}%
                  </p>
                  <p className="mt-1 text-xs font-medium text-orange-600/80 dark:text-orange-300/80">
                    dari {totalWorkdays} hari kerja
                  </p>
                </button>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-700 dark:bg-slate-950/50">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Status Sanksi Disiplin
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className={`badge ${sanctionBadgeClass}`}>
                      {sanctionLabel}
                    </span>
                    {currentWarningRuleThresholdSummary ? (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {currentWarningRuleThresholdSummary}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                      <p className="text-slate-500 dark:text-slate-400">
                        Alpha Berturut
                      </p>
                      <p className="mt-1 font-bold text-slate-900 dark:text-slate-50">
                        {Number(discipline?.alpha_consecutive_days || 0)} hari
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                      <p className="text-slate-500 dark:text-slate-400">
                        Terlambat
                      </p>
                      <p className="mt-1 font-bold text-slate-900 dark:text-slate-50">
                        {lateDays} kali
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between">
              <button
                className="rounded-xl px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                onClick={handlePreviousMonth}
                title="Bulan sebelumnya"
              >
                ←
              </button>
              <div className="text-center">
                <p className="text-lg font-extrabold text-slate-900 dark:text-slate-50">
                  {new Date(currentYear, currentMonth - 1).toLocaleString(
                    "id-ID",
                    { month: "long" },
                  )}
                </p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {currentYear}
                </p>
              </div>
              <button
                className="rounded-xl px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                onClick={handleNextMonth}
                title="Bulan berikutnya"
              >
                →
              </button>
            </div>
            <MiniCalendar
              month={currentMonth}
              year={currentYear}
              attendanceData={attendanceHistory}
            />

            <div className="mt-6 space-y-4 border-t border-slate-200 pt-5 dark:border-slate-700">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Keterangan Status Absensi
              </p>
              {[
                ["Hadir", presentDays, "progress-success"],
                ["Terlambat", lateDays, "progress-warning"],
                ["Izin/Cuti", permissionDays, "progress-info"],
                ["Alpha", absentDays, "progress-error"],
              ].map(([label, value, progressClass]) => (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-sm text-slate-600 dark:text-slate-300">
                    <span>{label}</span>
                    <span className="font-bold">{value}</span>
                  </div>
                  <progress
                    className={`progress ${progressClass} w-full`}
                    value={value}
                    max={Math.max(totalWorkdays, 1)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">
              Menunggu Persetujuan
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Permintaan yang masih perlu diproses.
            </p>
            <div className="mt-5 space-y-3">
              {[
                [
                  "Cuti/Izin",
                  summary.pending_leave_requests || 0,
                  "/app/leave-requests",
                  "bg-blue-50 text-blue-600 border-blue-200",
                ],
                [
                  "Reimbursement",
                  summary.pending_reimbursements || 0,
                  "/app/reimbursements",
                  "bg-emerald-50 text-emerald-600 border-emerald-200",
                ],
                [
                  "Banding Gaji",
                  summary.pending_salary_appeals || 0,
                  "/app/salary-appeals",
                  "bg-amber-50 text-amber-600 border-amber-200",
                ],
              ].map(([label, value, path, cls]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => navigate(path)}
                  className={`w-full rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${cls} dark:border-slate-700 dark:bg-slate-950/50`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
                    {label}
                  </p>
                  <p className="mt-1 text-2xl font-extrabold">{value}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">
              Slip Gaji Terbaru
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Ringkasan slip gaji terakhir yang tersedia.
            </p>
            <div className="mt-5 space-y-3">
              {payrolls.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Belum ada slip gaji
                </div>
              )}
              {payrolls.slice(0, 5).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate("/app/payroll")}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-left transition hover:bg-orange-50 dark:border-slate-700 dark:bg-slate-950/50 dark:hover:bg-slate-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-50">
                        {item.period_month}/{item.period_year}
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Rp{" "}
                        {Number(
                          item.final_amount || item.net_salary || 0,
                        ).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <span className="badge badge-outline capitalize text-xs">
                      {item.status}
                    </span>
                  </div>
                </button>
              ))}
              {payrolls.length > 5 ? (
                <div className="text-right pt-1">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm rounded-xl text-orange-600"
                    onClick={() => navigate("/app/payroll")}
                  >
                    Lihat Semua
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {showWarningPopup && currentWarningRule ? (
          <div className="modal modal-open backdrop-blur-sm">
            <div className="modal-box max-w-xl overflow-hidden rounded-3xl border border-red-200 p-0 shadow-2xl dark:border-red-900/60">
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5 text-white">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl shadow-md">
                    ⚠️
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      Peringatan Disiplin Pegawai
                    </h3>
                    <p className="mt-1 text-sm opacity-90">
                      Sistem mendeteksi pelanggaran kehadiran
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-950/30">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <div className="badge badge-error badge-lg">
                      {currentWarningRuleLabel}
                    </div>
                    <div className="badge badge-outline badge-warning">
                      {normalizeSanctionLevel(
                        currentWarningRule?.sanction_level || sanctionLevel,
                      ) === "tindak_lanjut" ||
                      normalizeSanctionLevel(
                        currentWarningRule?.sanction_level || sanctionLevel,
                      ) === "evaluasi_hr"
                        ? "Menghadap Atasan / HR"
                        : `Level ${formatSanctionLabel(currentWarningRule?.sanction_level || sanctionLevel)}`}
                    </div>
                  </div>
                  <h4 className="mb-1 text-base font-bold text-red-600 dark:text-red-300">
                    {currentWarningRule?.rule_name ||
                      "Aturan Peringatan Kehadiran"}
                  </h4>
                  <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                    {currentWarningRule?.description ||
                      currentWarningRule?.recommendation ||
                      "Deskripsi aturan tidak tersedia."}
                  </p>
                </div>
                <div className="flex flex-col justify-end gap-3 sm:flex-row">
                  <button
                    className="btn btn-outline btn-warning rounded-xl"
                    onClick={() => {
                      localStorage.setItem(
                        SP_ALERT_STORAGE_KEY,
                        currentNoticeKey,
                      );
                      setShowWarningPopup(false);
                      navigate("/app/warning-letters");
                    }}
                  >
                    Lihat Pelanggaran
                  </button>
                  <button
                    className="btn rounded-xl border-none bg-red-500 text-white hover:bg-red-600"
                    onClick={() => {
                      localStorage.setItem(
                        SP_ALERT_STORAGE_KEY,
                        currentNoticeKey,
                      );
                      setShowWarningPopup(false);
                    }}
                  >
                    Saya Mengerti
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default EmployeeDashboard;
