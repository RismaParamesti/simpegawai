import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { setPageTitle } from "../../../features/common/headerSlice";
import TitleCard from "../../../components/Cards/TitleCard";
import Pagination from "../../../components/Pagination/Pagination";
import { pegawaiApi } from "../../../features/pegawai/api";
import { calculateWorkdaysInMonth } from "../../../utils/attendanceUtils";

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const ATTENDANCE_BADGE_CLASS = {
  hadir: "badge-success",
  izin: "badge-warning",
  sakit: "badge-info",
  alpha: "badge-error",
  libur: "badge-neutral",
};

const formatDurationFromHours = (hoursValue) => {
  if (hoursValue === null || hoursValue === undefined || hoursValue === "")
    return "-";

  const totalSeconds = Math.max(0, Math.round(Number(hoursValue) * 3600));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return `${hours} jam ${minutes} menit`;
};

const parseTimeToSeconds = (timeValue) => {
  if (!timeValue || typeof timeValue !== "string") return null;
  const [hourPart = "0", minutePart = "0", secondPart = "0"] =
    timeValue.split(":");
  const hours = Number(hourPart);
  const minutes = Number(minutePart);
  const seconds = Number(secondPart);

  if ([hours, minutes, seconds].some((num) => Number.isNaN(num))) return null;
  return hours * 3600 + minutes * 60 + seconds;
};

const formatTimeLabel = (timeValue) =>
  timeValue ? String(timeValue).slice(0, 5) : "-";

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
    label: `${formatTimeLabel(checkInTime)} - ${formatTimeLabel(checkOutTime)}`,
  };
};

const formatDurationFromCheckTimes = (checkIn, checkOut, fallbackHours) => {
  const startSeconds = parseTimeToSeconds(checkIn);
  const endSeconds = parseTimeToSeconds(checkOut);

  if (startSeconds === null || endSeconds === null) {
    return formatDurationFromHours(fallbackHours);
  }

  let durationSeconds = endSeconds - startSeconds;
  if (durationSeconds < 0) {
    durationSeconds += 24 * 3600;
  }

  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);

  return `${hours} jam ${minutes} menit `;
};

const formatDurationFromMinutes = (minutesValue) => {
  if (
    minutesValue === null ||
    minutesValue === undefined ||
    minutesValue === ""
  )
    return "0 jam 0 menit ";

  const totalSeconds = Math.max(0, Math.round(Number(minutesValue) * 60));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return `${hours} jam ${minutes} menit `;
};

const isLeaveOrPermissionStatus = (statusValue) => {
  const normalizedStatus = String(statusValue || "").toLowerCase();
  return (
    normalizedStatus === "izin" ||
    normalizedStatus === "sakit" ||
    normalizedStatus === "libur"
  );
};

const getPermissionLabel = (item) => {
  // Prefer explicit leave_type, then cuti_khusus_option, then approved_special_permission
  const leaveType = String(
    item?.leave_type ||
      item?.cuti_khusus_option ||
      item?.approved_special_permission?.cuti_khusus_option ||
      item?.approved_special_permission?.leave_type ||
      "",
  ).toLowerCase();

  const specialTime =
    item?.special_permission_time ||
    item?.approved_special_permission?.special_permission_time ||
    null;

  if (leaveType) {
    if (leaveType === "izin_terlambat" || leaveType.includes("terlambat")) {
      return specialTime
        ? `Izin Terlambat (sampai ${formatTimeLabel(specialTime)})`
        : "Izin Terlambat";
    }

    if (
      leaveType === "pulang_cepat" ||
      leaveType === "pulang_cepat_khusus" ||
      leaveType.includes("pulang") ||
      leaveType.includes("cepat")
    ) {
      return specialTime
        ? `Izin Pulang Cepat (sampai ${formatTimeLabel(specialTime)})`
        : "Izin Pulang Cepat";
    }

    if (leaveType === "cuti_khusus" || leaveType === "cuti_khusus_option") {
      return "Cuti Khusus";
    }

    // fallback to a humanized leave type
    return leaveType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // If leave_type absent, infer from special permission time and status
  if (specialTime) {
    // If check_in is missing it's likely izin terlambat, else izin pulang cepat
    if (!item?.check_in) {
      return `Izin Terlambat (sampai ${formatTimeLabel(specialTime)})`;
    }

    if (!item?.check_out) {
      return `Izin Pulang Cepat (sampai ${formatTimeLabel(specialTime)})`;
    }
  }

  // final fallbacks
  if (item?.note) return item.note;
  return `Status ${String(item?.status || "").toLowerCase()}`;
};

const hasPermissionInfo = (item) => {
  if (!item) return false;
  if (item.leave_type) return true;
  if (item.cuti_khusus_option) return true;
  if (item.approved_special_permission) return true;
  if (item.special_permission_time) return true;
  const note = String(item.note || "").toLowerCase();
  if (note.includes("izin") || note.includes("pulang cepat") || note.includes("terlambat")) return true;
  return false;
};

const formatOvertimeDisplay = ({
  status,
  checkIn,
  checkOut,
  overtimeHours,
  workingHours,
}) => {
  if (isLeaveOrPermissionStatus(status)) return "-";
  if (!checkIn || !checkOut) return "-";

  const overtimeValue = Number(overtimeHours);
  if (Number.isFinite(overtimeValue) && overtimeValue > 0) {
    return formatDurationFromHours(overtimeValue);
  }

  const workingValue = Number(workingHours);
  if (Number.isFinite(workingValue) && workingValue > 8) {
    return formatDurationFromHours(workingValue - 8);
  }

  return "-";
};

const alphaSanctionLabelMap = {
  none: "Belum Ada SP",
  sp1: "SP1",
  sp2: "SP2",
  sp3: "SP3",
  evaluasi_hr: "Tindak Lanjut",
  tindak_lanjut: "Tindak Lanjut",
  nonaktif: "Evaluasi HR",
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

function EmployeeAttendance() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [today, setToday] = useState({});
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState({});
  const [warningLetters, setWarningLetters] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const attendanceTodayCardRef = useRef(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [statusFilter, setStatusFilter] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const totalWorkdays = calculateWorkdaysInMonth(selectedMonth, selectedYear);

  const availableYears = Array.from(
    { length: 5 },
    (_, index) => now.getFullYear() - index,
  );

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [todayData, historyData, summaryData, warningLettersData] =
        await Promise.all([
          pegawaiApi.getAttendanceToday(),
          pegawaiApi.getAttendanceHistory({
            month: selectedMonth,
            year: selectedYear,
            status: statusFilter || undefined,
            limit: 200,
          }),
          pegawaiApi.getAttendanceSummary({
            month: selectedMonth,
            year: selectedYear,
          }),
          pegawaiApi.getMyWarningLetters(),
        ]);
      setToday(todayData || {});
      setHistory(historyData?.data || []);
      setSummary(summaryData?.data || {});
      setWarningLetters(warningLettersData?.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, statusFilter]);

  const presentDays = Number(summary.present_days || 0);
  const alphaDays = Number(summary.alpha_days ?? summary.absent_days ?? 0);
  const latePenaltyDays = Number(summary.late_penalty_days || 0);
  const effectiveAbsentDays = Number(
    summary.effective_absent_days ?? alphaDays + latePenaltyDays,
  );

  const approvedSpecialPermission = today?.approved_special_permission || null;
  const specialPermissionOption = String(
    today?.cuti_khusus_option ||
      approvedSpecialPermission?.cuti_khusus_option ||
      "",
  ).toLowerCase();
  // Backend indicates whether attendance is allowed for today (can_attendance).
  // Treat it as authoritative (covers half-day and izin_terlambat even without special time).
  const hasApprovedSpecialPermission = Boolean(today?.can_attendance);
  const isLatePermission =
    Boolean(today?.special_permission_time) ||
    String(today?.leave_type) === "izin_terlambat";
  const isEarlyPermission =
    String(specialPermissionOption) === "pulang_cepat" ||
    String(today?.leave_type) === "pulang_cepat_khusus";
  const specialPermissionSeconds = today?.special_permission_time
    ? (() => {
        const [hours = "0", minutes = "0", seconds = "0"] = String(
          today.special_permission_time,
        ).split(":");
        return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
      })()
    : null;
  const isLeaveIntegratedToday =
    ["izin", "sakit", "libur"].includes(
      String(today?.status || "").toLowerCase(),
    ) && !hasApprovedSpecialPermission;
  const attendanceDate = today?.date ? new Date(today.date) : new Date();
  const isSundayToday = attendanceDate.getDay() === 0;
  const attendanceWindow = getAttendanceWorkingHoursWindow(today);
  const [currentSeconds, setCurrentSeconds] = useState(() => {
    const now = new Date();
    return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  });

  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      setCurrentSeconds(
        now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds(),
      );
    }, 15000);
    return () => clearInterval(id);
  }, []);
  const checkInStartSeconds = attendanceWindow.checkInSeconds;
  const checkInCutoffSeconds = attendanceWindow.checkOutSeconds;
  const isCheckInTooEarly =
    currentSeconds < checkInStartSeconds && !today?.check_in;
  const isCheckInCutoffPassed =
    currentSeconds > checkInCutoffSeconds && !today?.check_in;
  const isOutsideWorkingHours =
    currentSeconds < checkInStartSeconds ||
    currentSeconds > checkInCutoffSeconds;
  const isAfterCutoff = currentSeconds > checkInCutoffSeconds;

  const canCheckInNow =
    !actionLoading &&
    !today.check_in &&
    !isSundayToday &&
    !isLeaveIntegratedToday &&
    !isAfterCutoff &&
    (!isOutsideWorkingHours ||
      (isLatePermission &&
        specialPermissionSeconds !== null &&
        currentSeconds >= specialPermissionSeconds));
  const canCheckOutNow =
    !actionLoading &&
    !!today.check_in &&
    !today.check_out &&
    !isSundayToday &&
    !isLeaveIntegratedToday &&
    (!isOutsideWorkingHours ||
      (isEarlyPermission &&
        specialPermissionSeconds !== null &&
        currentSeconds >= specialPermissionSeconds));

  const isAfterCutoffOut = currentSeconds > checkInCutoffSeconds;
  // ensure check-out is also disabled after cutoff
  const canCheckOutNowFinal = canCheckOutNow && !isAfterCutoffOut;

  const shouldShowCheckoutNotification = Boolean(
    today?.check_in && !today?.check_out && isAfterCutoffOut,
  );

  // Pagination logic
  const itemsPerPage = 10;
  const totalHistoryPages = Math.ceil(history.length / itemsPerPage);
  const startIndex = (historyPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedHistory = history.slice(startIndex, endIndex);

  useEffect(() => {
    dispatch(setPageTitle({ title: "Absensi Pegawai" }));
    loadData();
  }, [dispatch, loadData]);

  useEffect(() => {
    if (loading) return;
    if (!location.state?.focusAttendanceToday) return;

    attendanceTodayCardRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [loading, location.state]);

  const runCheckin = async () => {
    try {
      setActionLoading(true);
      setError("");
      await pegawaiApi.checkIn();
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const runCheckout = async () => {
    try {
      setActionLoading(true);
      setError("");
      await pegawaiApi.checkOut();
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Memuat data absensi...</div>;
  }

  return (
    <>
      {error ? (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      ) : null}

      <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-6">
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Hari Kerja Bulan Ini</div>
          <div className="stat-value text-primary">{totalWorkdays}</div>
        </div>
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Hadir</div>
          <div className="stat-value text-success">{presentDays}</div>
        </div>
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Terlambat</div>
          <div className="stat-value text-warning">
            {summary.late_days || 0}
          </div>
        </div>
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Tidak Hadir</div>
          <div className="stat-value text-error">{alphaDays}</div>
        </div>
      </div>

      <div ref={attendanceTodayCardRef}>
        <TitleCard title="Absensi Hari Ini" topMargin="mt-6">
          {isSundayToday ? (
            <div className="alert alert-info mb-4">
              <span>Hari ini hari libur, anda tidak perlu absen!</span>
            </div>
          ) : null}

          {isLeaveIntegratedToday && !isCheckInCutoffPassed ? (
            <div className="alert alert-info mb-4">
              <span>
                Hari ini status kamu <b>{today.status}</b>. Anda tidak perlu
                absen.
              </span>
            </div>
          ) : hasApprovedSpecialPermission && !isCheckInCutoffPassed ? (
            <div className="alert alert-success mb-4">
              <span>
                Hari ini status kamu <b>{today.status || "izin"}</b>. Kamu dapat
                melakukan absensi.
                {today?.special_permission_time ? (
                  <>
                    {" "}
                    Lakukan absensi sebelum pukul{" "}
                    <b>{formatTimeLabel(today.special_permission_time)}</b>.
                  </>
                ) : (
                  " Lakukan absensi sesuai jadwal yang disetujui."
                )}
              </span>
            </div>
          ) : null}

          {shouldShowCheckoutNotification ? (
            <div className="alert alert-warning mb-4 flex justify-between items-center">
              <div>Anda belum absen pulang. Silakan absen pulang sekarang.</div>
              <div className="flex gap-2">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => {
                    attendanceTodayCardRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                    setShowCheckoutModal(true);
                  }}
                >
                  Absen Pulang Sekarang
                </button>
                <button
                  className="btn btn-sm"
                  onClick={() => {
                    attendanceTodayCardRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                >
                  Buka Halaman Absensi
                </button>
              </div>
            </div>
          ) : null}

          {!isSundayToday && !isLeaveIntegratedToday && isCheckInTooEarly ? (
            <div className="alert alert-warning mb-4">
              <span>
                Absensi hanya bisa dilakukan pada jam kerja{" "}
                {attendanceWindow.label}.
              </span>
            </div>
          ) : null}

          {!isSundayToday && isCheckInCutoffPassed ? (
            <div className="alert alert-warning mb-4">
              <span>
                Jam absensi sudah berakhir pada pukul{" "}
                {formatTimeLabel(attendanceWindow.checkOutTime)}.
              </span>
            </div>
          ) : null}

          <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
            <div className="p-4 rounded-lg bg-base-200">
              <p className="text-sm opacity-70">Tanggal</p>
              <p className="text-lg font-semibold">{formatDate(today.date)}</p>
            </div>
            <div className="p-4 rounded-lg bg-base-200">
              <p className="text-sm opacity-70">Status</p>
              <p className="text-lg font-semibold">{today.status || "-"}</p>
            </div>
            <div className="p-4 rounded-lg bg-base-200">
              <p className="text-sm opacity-70">Jam Kerja</p>
              <p className="text-lg font-semibold">{attendanceWindow.label}</p>
            </div>
            <div className="p-4 rounded-lg bg-base-200">
              <p className="text-sm opacity-70">Durasi Kerja</p>
              <p className="text-lg font-semibold">
                {formatDurationFromHours(today.working_hours)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-base-200">
              <p className="text-sm opacity-70">Absen Masuk</p>
              <p className="text-lg font-semibold">{today.check_in || "-"}</p>
            </div>
            <div className="p-4 rounded-lg bg-base-200">
              <p className="text-sm opacity-70">Absen Pulang</p>
              <p className="text-lg font-semibold">{today.check_out || "-"}</p>
            </div>
            <div className="p-4 rounded-lg bg-base-200">
              <p className="text-sm opacity-70">Lembur</p>
              <p className="text-lg font-semibold">
                {formatOvertimeDisplay({
                  status: today.status,
                  checkIn: today.check_in,
                  checkOut: today.check_out,
                  overtimeHours: today.overtime_hours,
                  workingHours: today.working_hours,
                })}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-base-200">
              <p className="text-sm opacity-70">Terlambat</p>
              <p className="text-lg font-semibold">
                {isLeaveOrPermissionStatus(today.status)
                  ? "-"
                  : formatDurationFromMinutes(today.late_minutes)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              className={`
      btn btn-primary
      disabled:bg-gray-300
      disabled:text-gray-600
      disabled:border-0
      disabled:opacity-80
      disabled:cursor-not-allowed
      ${actionLoading ? "loading" : ""}
    `}
              onClick={runCheckin}
              disabled={!canCheckInNow}
            >
              Absen Masuk
            </button>

            <button
              className={`
      btn btn-secondary
      disabled:bg-gray-300
      disabled:text-gray-600
      disabled:border-0
      disabled:opacity-80
      disabled:cursor-not-allowed
      ${actionLoading ? "loading" : ""}
    `}
              onClick={runCheckout}
              disabled={!canCheckOutNowFinal}
            >
              Absen Pulang
            </button>
          </div>
        </TitleCard>
      </div>

      {showCheckoutModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Konfirmasi Absen Pulang</h3>
            <p className="py-4">Apakah Anda ingin absen pulang sekarang?</p>
            <div className="modal-action">
              <button
                className={`btn btn-primary ${actionLoading ? "loading" : ""}`}
                onClick={async () => {
                  setShowCheckoutModal(false);
                  try {
                    await runCheckout();
                  } catch (e) {
                    // runCheckout handles errors
                  }
                }}
              >
                Ya, Absen Pulang
              </button>
              <button className="btn" onClick={() => setShowCheckoutModal(false)}>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      <TitleCard title="Riwayat Absensi" topMargin="mt-6">
        <div className="grid md:grid-cols-3 grid-cols-1 gap-3 mb-4">
          <select
            className="select select-bordered"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="hadir">Hadir</option>
            <option value="izin">Izin</option>
            <option value="sakit">Sakit</option>
            <option value="alpha">Alpha</option>
            <option value="libur">Libur</option>
          </select>

          <select
            className="select select-bordered"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, index) => {
              const monthNumber = index + 1;
              return (
                <option key={monthNumber} value={monthNumber}>
                  {new Date(2000, index, 1).toLocaleString("id-ID", {
                    month: "long",
                  })}
                </option>
              );
            })}
          </select>

          <select
            className="select select-bordered"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Status</th>
                <th>Keterangan</th>
                <th>Jam Masuk</th>
                <th>Jam Pulang</th>
                <th>Durasi Kerja</th>
                <th>Lembur</th>
                <th>Terlambat</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center opacity-60">
                    Tidak ada data absensi pada filter yang dipilih
                  </td>
                </tr>
              ) : (
                paginatedHistory.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDate(item.date)}</td>
                    <td>
                      <span
                        className={`badge ${
                          ATTENDANCE_BADGE_CLASS[item.status?.toLowerCase()] ||
                          "badge-ghost"
                        }`}
                      >
                        {item.status?.toUpperCase() || "-"}
                      </span>
                    </td>
                    <td>
                      {isLeaveOrPermissionStatus(item.status) || hasPermissionInfo(item)
                        ? getPermissionLabel(item)
                        : "-"}
                    </td>
                    <td>{item.check_in || "-"}</td>
                    <td>{item.check_out || "-"}</td>
                    <td>
                      {formatDurationFromCheckTimes(
                        item.check_in,
                        item.check_out,
                        item.working_hours,
                      )}
                    </td>
                    <td>
                      {formatOvertimeDisplay({
                        status: item.status,
                        checkIn: item.check_in,
                        checkOut: item.check_out,
                        overtimeHours: item.overtime_hours,
                        workingHours: item.working_hours,
                      })}
                    </td>
                    <td>
                      {isLeaveOrPermissionStatus(item.status)
                        ? "-"
                        : formatDurationFromMinutes(item.late_minutes)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={historyPage}
          totalPages={totalHistoryPages}
          onChangePage={setHistoryPage}
          itemsPerPage={itemsPerPage}
        />
      </TitleCard>
    </>
  );
}

export default EmployeeAttendance;
