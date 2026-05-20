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
  const currentWarningRuleLabel = currentWarningRule?.sanction_label || formatSanctionLabel(currentWarningRule?.sanction_level || sanctionLevel);
  const currentWarningRuleThresholdSummary = getRuleThresholdSummary(currentWarningRule);
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

  return (
    <div className="space-y-6">
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button className="btn btn-xs" onClick={loadDashboard}>
            Muat Ulang
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TitleCard
            title={`Hai, ${profile?.user?.name || profile?.user?.username || "Pegawai"}!`}
            topMargin="mt-0"
          >
            <p className="opacity-70">
              {isSundayToday
                ? "Hari ini hari libur, anda tidak perlu absen!"
                : isCheckInCutoffPassed
                  ? `Jam absensi sudah berakhir pada pukul ${formatTime(attendanceWindow.checkOutTime)}.`
                  : isLeaveIntegratedToday
                    ? `Hari ini status kamu ${todayAttendance?.status || activeApprovedLeaveToday?.leave_type || "izin/cuti"}. Anda tidak perlu absen.`
                    : hasApprovedSpecialPermission
                      ? `Hari ini status kamu ${todayAttendance?.status || activeApprovedLeaveToday?.leave_type || "izin/cuti"}. Kamu dapat melakukan absensi${todayAttendance?.special_permission_time ? ` sebelum pukul ${formatTime(todayAttendance.special_permission_time)}` : " sesuai jadwal yang disetujui"}.`
                      : isCheckInTooEarly
                        ? `Absensi hanya bisa dilakukan pada jam kerja ${attendanceWindow.label}.`
                        : !hasCheckedIn
                          ? "Hari ini kamu belum absen masuk."
                          : !hasCheckedOut
                            ? "Hari ini kamu belum absen pulang."
                            : "Hari ini kamu sudah absen pulang."}
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <button
                className="
      btn btn-primary
      disabled:bg-gray-300
      disabled:text-gray-600
      disabled:border-0
      disabled:opacity-80
      disabled:cursor-not-allowed
    "
                disabled={!canCheckInNow}
                onClick={handleCheckIn}
              >
                Absen Masuk
              </button>

              <button
                className="
      btn btn-secondary
      disabled:bg-gray-300
      disabled:text-gray-600
      disabled:border-0
      disabled:opacity-80
      disabled:cursor-not-allowed
    "
                disabled={!canCheckOutNow}
                onClick={handleCheckOut}
              >
                Absen Pulang
              </button>
            </div>
          </TitleCard>
          <div
            className="cursor-pointer"
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
            <TitleCard title="Status Kehadiran Hari Ini" topMargin="mt-6">
              <div className="grid md:grid-cols-4 grid-cols-2 gap-4">
                <div className="text-center p-3 bg-info/10 border border-info/25 rounded-lg">
                  <p className="text-sm opacity-70">Absen Masuk</p>
                  <p className="font-semibold">
                    {formatTime(todayAttendance?.check_in)}
                  </p>
                </div>
                <div className="text-center p-3 bg-success/10 border border-success/25 rounded-lg">
                  <p className="text-sm opacity-70">Absen Pulang</p>
                  <p className="font-semibold">
                    {formatTime(todayAttendance?.check_out)}
                  </p>
                </div>
                <div className="text-center p-3 bg-warning/10 border border-warning/25 rounded-lg">
                  <p className="text-sm opacity-70">Status</p>
                  <p className="font-semibold capitalize">
                    {todayAttendance?.status || "Belum absen"}
                  </p>
                </div>
                <div className="text-center p-3 bg-primary/10 border border-primary/25 rounded-lg">
                  <p className="text-sm opacity-70">Durasi Kerja</p>
                  <p className="font-semibold">
                    {todayAttendance?.working_hours
                      ? `${todayAttendance.working_hours}j`
                      : "-"}
                  </p>
                </div>
              </div>
            </TitleCard>
          </div>
          <TitleCard title="Ringkasan Bulan Ini" topMargin="mt-0">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <button
                type="button"
                onClick={() => navigate("/app/attendance")}
                className="p-3 bg-success/10 border border-success/25 rounded-lg text-left hover:bg-success/20 transition"
              >
                <p className="text-xs opacity-70 mb-1">Hadir</p>
                <p className="text-lg font-bold text-success">
                  {presentDays} hari
                </p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/app/attendance")}
                className="p-3 bg-warning/10 border border-warning/25 rounded-lg text-left hover:bg-warning/20 transition"
              >
                <p className="text-xs opacity-70 mb-1">Terlambat</p>
                <p className="text-lg font-bold text-warning">
                  {lateDays} hari
                </p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/app/attendance")}
                className="p-3 bg-info/10 border border-info/25 rounded-lg text-left hover:bg-info/20 transition"
              >
                <p className="text-xs opacity-70 mb-1">Izin/Cuti</p>
                <p className="text-lg font-bold text-info">
                  {permissionDays} hari
                </p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/app/attendance")}
                className="p-3 bg-error/10 border border-error/25 rounded-lg text-left hover:bg-error/20 transition"
              >
                <p className="text-xs opacity-70 mb-1">Alpha</p>
                <p className="text-lg font-bold text-error">
                  {absentDays} hari
                </p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/app/attendance")}
                className="col-span-2 p-3 bg-primary/10 border border-primary/25 rounded-lg text-center hover:bg-primary/20 transition"
              >
                <p className="text-xs opacity-70 mb-1">Persentase Kehadiran</p>
                <p className="text-2xl font-bold text-primary">
                  {performancePercent}%
                </p>
                <p className="text-xs opacity-70 mt-1">
                  dari {totalWorkdays} hari kerja
                </p>
              </button>
              <div className="col-span-2 p-3 bg-base-200 rounded-lg border border-base-300">
                <p className="text-xs opacity-70 mb-1">
                  Status Sanksi Disiplin Kehadiran
                </p>
                <div className="grid md:grid-cols-5 grid-cols-1 gap-2 text-xs mb-2">
                  <div className="bg-base-100 rounded px-2 py-2">
                    <p className="opacity-70">Sanksi Saat Ini</p>
                    <span className={`badge ${sanctionBadgeClass}`}>
                      {sanctionLabel}
                    </span>
                  </div>
                  <div className="bg-base-100 rounded px-2 py-2">
                    <p className="opacity-70">Alpha Berturut</p>
                    <p className="font-semibold">
                      {Number(discipline?.alpha_consecutive_days || 0)} hari
                    </p>
                  </div>
                  <div className="bg-base-100 rounded px-2 py-2">
                    <p className="opacity-70">Alpha Akumulasi</p>
                    <p className="font-semibold">
                      {Number(discipline?.alpha_accumulated_days || 0)} hari
                    </p>
                  </div>
                  <div className="bg-base-100 rounded px-2 py-2">
                    <p className="opacity-70">Terlambat Berturut</p>
                    <p className="font-semibold">{consecutiveLate} kali</p>
                  </div>
                  <div className="bg-base-100 rounded px-2 py-2">
                    <p className="opacity-70">Terlambat Akumulasi</p>
                    <p className="font-semibold">{lateDays} kali</p>
                  </div>
                </div>
              </div>
            </div>
          </TitleCard>
        </div>

        <TitleCard title="" topMargin="mt-0">
          <div className="mb-6 pb-6 border-b">
            <div className="flex items-center justify-center gap-2 mb-5">
              <button
                className="px-2 py-1 hover:bg-base-200 rounded transition text-sm"
                onClick={handlePreviousMonth}
                title="Bulan sebelumnya"
              >
                ←
              </button>
              <span className="text-sm font-bold">
                {new Date(currentYear, currentMonth - 1).toLocaleString(
                  "id-ID",
                  {
                    month: "long",
                  },
                )}
              </span>

              <span className="text-sm font-bold">{currentYear}</span>

              <button
                className="px-2 py-1 hover:bg-base-200 rounded transition text-sm"
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
          </div>

          <div className="space-y-4">
            {" "}
            <p className="text-[11px] uppercase tracking-wide opacity-70 mb-3">
              Keterangan Status Absensi
            </p>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Hadir</span>
                <span>{presentDays}</span>
              </div>
              <progress
                className="progress progress-success w-full"
                value={presentDays}
                max={Math.max(totalWorkdays, 1)}
              ></progress>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Terlambat</span>
                <span>{lateDays}</span>
              </div>
              <progress
                className="progress progress-warning w-full"
                value={lateDays}
                max={Math.max(totalWorkdays, 1)}
              ></progress>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Izin/Cuti</span>
                <span>{permissionDays}</span>
              </div>
              <progress
                className="progress progress-info w-full"
                value={permissionDays}
                max={Math.max(totalWorkdays, 1)}
              ></progress>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Alpha</span>
                <span>{absentDays}</span>
              </div>
              <progress
                className="progress progress-error w-full"
                value={absentDays}
                max={Math.max(totalWorkdays, 1)}
              ></progress>
            </div>
          </div>
        </TitleCard>
      </div>

      <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
        <TitleCard title="Pending Approval" topMargin="mt-0">
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => navigate("/app/leave-requests")}
              className="w-full bg-info/10 border border-info/25 p-3 rounded-lg text-left hover:bg-info/20 transition"
            >
              <p className="text-xs opacity-70">Cuti/Izin</p>
              <p className="text-2xl font-bold text-info">
                {summary.pending_leave_requests || 0}
              </p>
            </button>
            <button
              type="button"
              onClick={() => navigate("/app/reimbursements")}
              className="w-full bg-success/10 border border-success/25 p-3 rounded-lg text-left hover:bg-success/20 transition"
            >
              <p className="text-xs opacity-70">Reimbursement</p>
              <p className="text-2xl font-bold text-success">
                {summary.pending_reimbursements || 0}
              </p>
            </button>
            <button
              type="button"
              onClick={() => navigate("/app/salary-appeals")}
              className="w-full bg-warning/10 border border-warning/25 p-3 rounded-lg text-left hover:bg-warning/20 transition"
            >
              <p className="text-xs opacity-70">Banding Gaji</p>
              <p className="text-2xl font-bold text-warning">
                {summary.pending_salary_appeals || 0}
              </p>
            </button>
          </div>
        </TitleCard>

        <TitleCard title="Slip Gaji Terbaru" topMargin="mt-0">
          <div className="space-y-2">
            {payrolls.length === 0 && (
              <p className="opacity-60 text-sm text-center py-4">
                Belum ada slip gaji
              </p>
            )}
            {payrolls.slice(0, 5).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate("/app/payroll")}
                className="w-full border border-base-300 rounded-lg p-3 hover:bg-base-200/50 transition text-left"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">
                      {item.period_month}/{item.period_year}
                    </p>
                    <p className="text-xs opacity-70">
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
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigate("/app/payroll")}
                >
                  Lihat Semua
                </button>
              </div>
            ) : null}
          </div>
        </TitleCard>
      </div>
      {showWarningPopup && currentWarningRule ? (
        <div className="modal modal-open backdrop-blur-sm">
          <div className="modal-box max-w-xl p-0 overflow-hidden rounded-3xl shadow-2xl border border-error/30">
            {/* HEADER */}
            <div className="bg-gradient-to-r from-error to-red-600 text-white px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                    />
                  </svg>
                </div>

                <div>
                  <h3 className="text-xl font-bold">
                    Peringatan Disiplin Pegawai
                  </h3>

                  <p className="text-sm opacity-90 mt-1">
                    Sistem mendeteksi pelanggaran kehadiran
                  </p>
                </div>
              </div>
            </div>

            {/* BODY */}
            <div className="p-6">
              {/* INFO BOX */}
              <div className="rounded-2xl border border-error/20 bg-error/5 p-4 mb-5">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <div className="badge badge-error badge-lg">
                    {currentWarningRuleLabel}
                  </div>
                  <div className="badge badge-outline badge-warning">
                    {normalizeSanctionLevel(currentWarningRule?.sanction_level || sanctionLevel) === "tindak_lanjut" || normalizeSanctionLevel(currentWarningRule?.sanction_level || sanctionLevel) === "evaluasi_hr"
                      ? "Menghadap Atasan / HR"
                      : `Level ${formatSanctionLabel(currentWarningRule?.sanction_level || sanctionLevel)}`}
                  </div>
                </div>

                <h4 className="text-base font-bold text-error mb-1">
                  {currentWarningRule?.rule_name || "Aturan Peringatan Kehadiran"}
                </h4>

                <p className="text-sm leading-6 text-base-content/90">
                  {currentWarningRule?.description ||
                    currentWarningRule?.recommendation ||
                    "Deskripsi aturan tidak tersedia."}
                </p>

                <div className="mt-4 rounded-xl bg-base-100 p-3 border border-base-300">
                  <p className="text-xs uppercase font-bold opacity-60 mb-1">
                    Keterangan Pelanggaran
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-base-100 border p-3">
                      <p className="text-xs opacity-60">Alpha Berturut</p>
                      <p className="font-bold text-error">
                        {Number(discipline?.alpha_consecutive_days || 0)} hari
                      </p>
                    </div>

                    <div className="rounded-xl bg-base-100 border p-3">
                      <p className="text-xs opacity-60">Alpha Akumulasi</p>
                      <p className="font-bold text-error">
                        {Number(discipline?.alpha_accumulated_days || 0)} hari
                      </p>
                    </div>

                    <div className="rounded-xl bg-base-100 border p-3">
                      <p className="text-xs opacity-60">Terlambat Berturut</p>
                      <p className="font-bold text-error">{consecutiveLate} kali</p>
                    </div>

                    <div className="rounded-xl bg-base-100 border p-3">
                      <p className="text-xs opacity-60">Terlambat Akumulasi</p>
                      <p className="font-bold text-error">{lateDays} kali</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  className="btn btn-outline btn-warning rounded-xl flex-1 sm:flex-none"
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
                  className="btn btn-error rounded-xl flex-1 sm:flex-none"
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
  );
}

export default EmployeeDashboard;
