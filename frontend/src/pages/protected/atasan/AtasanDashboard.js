import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setPageTitle } from "../../../features/common/headerSlice";
import TitleCard from "../../../components/Cards/TitleCard";
import Pagination from "../../../components/Pagination/Pagination";
import { atasanApi } from "../../../features/atasan/api";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { getCurrentTheme, UI_PALETTE, toRgba } from "../../../utils/themePalette";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
);

const formatLateDuration = (lateMinutes) => {
  const minutes = Number(lateMinutes);
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return "00 jam 00 menit";
  }

  const totalSeconds = Math.round(minutes * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const remainingSeconds = totalSeconds % 3600;
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;

  const [hh, mm, ss] = [hours, mins, secs].map((value) =>
    String(value).padStart(2, "0"),
  );
  return `${hh} jam ${mm} menit ${ss} detik`;
};

const SummaryPagination = () => (
  <Pagination page={1} totalPages={1} onChangePage={() => {}} />
);

const formatDateLabel = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatViolationCounts = (item) => {
  const alphaConsecutive = Number(item?.alpha_consecutive_days || 0);
  const alphaAccumulated = Number(item?.alpha_accumulated_days || 0);
  const lateConsecutive = Number(item?.late_consecutive_days || 0);
  const lateAccumulated = Number(item?.late_accumulated_days || 0);

  const parts = [];
  if (alphaConsecutive > 0 || alphaAccumulated > 0) {
    parts.push(`Alpha ${alphaConsecutive} berturut / ${alphaAccumulated} akumulasi`);
  }
  if (lateConsecutive > 0 || lateAccumulated > 0) {
    parts.push(`Telat ${lateConsecutive} berturut / ${lateAccumulated} akumulasi`);
  }

  return parts.join(" | ") || "-";
};

const formatSanctionLabel = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "-";
  const spMatch = raw.match(/^sp\s*[-_]?\s*(\d+)$/i);
  if (spMatch) return `SP${spMatch[1]}`;
  return raw.replace(/[-_]+/g, " ");
};

const formatStatusLabel = (status) => {
  const normalized = String(status || "").toLowerCase().trim();
  if (normalized === "pending") return "Menunggu";
  if (normalized === "approved") return "Disetujui";
  if (normalized === "rejected") return "Ditolak";
  if (normalized === "active") return "Aktif";
  return status || "-";
};

function AtasanDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [activeViolations, setActiveViolations] = useState([]);
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    String(currentDate.getMonth() + 1),
  );
  const [selectedYear, setSelectedYear] = useState(
    String(currentDate.getFullYear()),
  );
  const itemsPerPage = 10;
  const [teamPage, setTeamPage] = useState(1);

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

  const monthLabel = (month) => {
    const found = monthOptions.find((m) => m.value === String(month));
    return found ? found.label : String(month);
  };

  const humanizeType = (raw) => {
    if (raw === null || raw === undefined) return "-";
    if (typeof raw !== "string") return String(raw);
    return raw.replace(/_/g, " ");
  };

  const yearOptions = Array.from({ length: 7 }, (_, index) =>
    String(currentDate.getFullYear() - 3 + index),
  );

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [dashboardResult, violationResult] = await Promise.allSettled([
        atasanApi.getDashboard({
          month: Number(selectedMonth),
          year: Number(selectedYear),
        }),
        atasanApi.getTeamWarningLetters(),
      ]);

      setDashboard(
        dashboardResult.status === "fulfilled" ? dashboardResult.value : null,
      );
      setActiveViolations(
        violationResult.status === "fulfilled"
          ? violationResult.value?.data || []
          : [],
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    setTeamPage(1);
  }, [selectedMonth, selectedYear]);

  const totalTeamPages = Math.ceil(
    (dashboard?.team_members || []).length / itemsPerPage,
  );

  useEffect(() => {
    if (teamPage > totalTeamPages && totalTeamPages > 0) {
      setTeamPage(totalTeamPages);
    }
  }, [teamPage, totalTeamPages]);

  const paginatedTeamMembers = (dashboard?.team_members || []).slice(
    (teamPage - 1) * itemsPerPage,
    teamPage * itemsPerPage,
  );

  // Memoize attendance/chart values so hooks depending on them are stable
  const summary = dashboard?.attendance_summary || {};
  const activeTheme = getCurrentTheme();
  const activePalette = UI_PALETTE[activeTheme] || UI_PALETTE.light;
  const isDarkMode = activeTheme === "dark";
  const descriptionTextColor = isDarkMode ? "#FFFFFF" : "#000000";

  const attendanceData = useMemo(
    () => [
      Number(summary.hadir || 0),
      Number(summary.izin || 0),
      Number(summary.sakit || 0),
      Number(summary.alpha || 0),
    ],
    [summary.hadir, summary.izin, summary.sakit, summary.alpha],
  );

  const hasAttendanceData = useMemo(
    () => attendanceData.some((v) => v > 0),
    [attendanceData],
  );

  const attendanceCompositionChart = useMemo(
    () => ({
      labels: ["Hadir", "Izin", "Sakit", "Alpha"],
      datasets: [
        {
          label: "Komposisi Kehadiran",
          data: attendanceData,
          backgroundColor: [
            toRgba("#3B82F6", 0.8),
            toRgba("#F59E0B", 0.8),
            toRgba("#10B981", 0.8),
            toRgba("#FF0000", 0.8),
          ],
          borderWidth: 1,
        },
      ],
    }),
    [attendanceData],
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      color: descriptionTextColor,
      plugins: {
        legend: {
          display: false,
          position: "top",
          labels: {
            color: descriptionTextColor,
            boxWidth: 14,
            boxHeight: 14,
            padding: 16,
            font: {
              size: 12,
              weight: "600",
            },
          },
        },
        tooltip: {
          titleColor: descriptionTextColor,
          bodyColor: descriptionTextColor,
          backgroundColor: isDarkMode
            ? "rgba(30, 30, 30, 0.96)"
            : "rgba(255, 255, 255, 0.96)",
          borderColor: activePalette.border,
          borderWidth: 1,
        },
      },
    }),
    [descriptionTextColor, isDarkMode, activePalette],
  );

  const topLateEmployees = useMemo(
    () => dashboard?.performance_alerts?.top_late_employees || [],
    [dashboard?.performance_alerts?.top_late_employees],
  );

  useEffect(() => {
    // Debug: inspect chart data to help diagnose render issues (open browser console)
    // eslint-disable-next-line no-console
    console.debug("Attendance chart debug:", {
      attendanceData,
      hasAttendanceData,
      attendanceCompositionChart,
      chartOptions,
    });
  }, [
    attendanceData,
    hasAttendanceData,
    attendanceCompositionChart,
    chartOptions,
  ]);

  useEffect(() => {
    dispatch(setPageTitle({ title: "Dashboard Atasan" }));
    loadDashboard();
  }, [dispatch, loadDashboard]);

  if (loading) {
    return (
      <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-950">
        <span className="loading loading-spinner loading-lg text-orange-500" />
        <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
          Memuat dashboard atasan...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 rounded-[1.5rem] border border-red-200 bg-red-50 p-6 shadow-sm dark:border-red-900/60 dark:bg-red-950/30">
        <p className="font-bold text-red-600 dark:text-red-300">Data gagal dimuat</p>
        <p className="mt-1 text-sm text-red-500 dark:text-red-300/80">{error}</p>
        <button
          className="btn mt-4 rounded-xl border-none bg-red-500 text-white hover:bg-red-600"
          onClick={loadDashboard}
        >
          Muat Ulang
        </button>
      </div>
    );
  }

  const team = dashboard?.team_overview || {};
  const scopeInfo = dashboard?.scope_info || {};
  const today = dashboard?.attendance_today || {};
  const approvals = dashboard?.pending_approvals || {};
  const pendingLeaves = dashboard?.pending_items?.leaves || [];
  const pendingReimbursements = dashboard?.pending_items?.reimbursements || [];
  const teamMembers = dashboard?.team_members || [];
  const recentActions = dashboard?.recent_actions || [];
  const todayLateRows = dashboard?.attendance_today_rows || [];
  const lateRows = (todayLateRows || []).slice(0, 8).map((item, idx) => ({
    key: `${item.id || item.name}-${item.date}`,
    no: idx + 1,
    name: item.name,
    employee_code: item.employee_code,
    date: item.date,
    minutes: item.late_minutes || item.minutes || 0,
  }));

  const statCards = [
    {
      title: "Total Anggota Tim",
      value: team.total_members || 0,
      detail: `Tetap: ${team.permanent || 0} | Kontrak: ${team.contract || 0}`,
      path: "/app/team-attendance",
      tone: "orange",
    },
    {
      title: "Hadir Hari Ini",
      value: today.present || 0,
      detail: `Terlambat: ${today.late || 0} | Tidak Hadir: ${today.absent || 0}`,
      path: "/app/team-attendance",
      tone: "emerald",
    },
    {
      title: "Persetujuan Menunggu",
      value: approvals.total || 0,
      detail: `Cuti/Izin: ${approvals.leave_requests || 0} | Reimbursement: ${approvals.reimbursements || 0}`,
      path: "/app/leave-requests",
      tone: "amber",
    },
    {
      title: "Total Terlambat Bulan Ini",
      value: summary.total_late || 0,
      detail: `Rekap ${summary.total_records || 0} catatan kehadiran`,
      path: "/app/team-attendance",
      tone: "red",
    },
  ];

  const toneClassMap = {
    orange: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/50 dark:bg-orange-950/30 dark:text-orange-300",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300",
    amber: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300",
    red: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300",
  };

  const DashboardHeroIllustration = () => (
    <div className="pointer-events-none absolute right-10 top-2 hidden h-32 w-80 lg:block">
      <div className="absolute bottom-2 right-0 h-20 w-72 rounded-full bg-orange-100/80 blur-[1px] dark:bg-orange-900/30" />
      <div className="absolute right-36 top-1 h-24 w-20 rotate-[-3deg] rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2 border-b border-orange-100 px-2 py-2 dark:border-slate-700">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-orange-500 dark:bg-orange-900/40 dark:text-orange-300">
            👥
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
    </div>
  );

  const CardTitle = ({ title, subtitle, children, action }) => (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </div>
  );

  return (
    <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white p-4 shadow-[0_20px_70px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-950 dark:shadow-[0_20px_70px_rgba(2,6,23,0.45)] sm:p-7">
      <div className="space-y-6">
        <div className="relative min-h-[130px] overflow-hidden rounded-[1.4rem] bg-gradient-to-r from-white via-white to-orange-50/80 px-5 py-6 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 sm:px-6">
          <DashboardHeroIllustration />
          <div className="relative z-10 max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600 dark:border-orange-900/60 dark:bg-orange-950/70 dark:text-orange-300">
              Dashboard Atasan
            </div>
            <h1 className="text-[28px] font-extrabold leading-tight text-slate-900 dark:text-slate-50">
              Ringkasan Tim {scopeInfo.department_name || "Departemen"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">
              Pantau kehadiran anggota tim, persetujuan yang menunggu, pelanggaran aktif,
              dan riwayat persetujuan dalam satu halaman yang mudah digunakan.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Scope Tim</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-sm font-bold text-orange-600 dark:border-orange-900/60 dark:bg-orange-950/70 dark:text-orange-300">
                  {scopeInfo.department_name || "Departemen belum terdefinisi"}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Periode {monthLabel(selectedMonth)} {selectedYear}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-[360px]">
              <select
                className="select select-bordered w-full rounded-xl bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
              >
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
              <select
                className="select select-bordered w-full rounded-xl bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                value={selectedYear}
                onChange={(event) => setSelectedYear(event.target.value)}
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={() => navigate(item.path)}
              className={`rounded-2xl border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${toneClassMap[item.tone]}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold opacity-80">{item.title}</p>
                  <p className="mt-2 text-3xl font-extrabold">{item.value}</p>
                  <p className="mt-1 text-xs font-medium opacity-80">{item.detail}</p>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-xl dark:bg-white/10">
                  {item.tone === "orange" ? "👥" : item.tone === "emerald" ? "✓" : item.tone === "amber" ? "⏳" : "⚠️"}
                </div>
              </div>
            </button>
          ))}
        </div>

        <CardTitle
          title={`Daftar Anggota Departemen ${scopeInfo.department_name || "-"}`}
          subtitle="Klik nama pegawai untuk melihat detail data pegawai."
        >
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="table table-sm w-full">
              <thead className="bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                <tr>
                  <th>Nama</th>
                  <th>Kode Pegawai</th>
                  <th>Departemen</th>
                  <th>Jabatan</th>
                  <th>Level</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTeamMembers.map((member) => (
                  <tr
                    key={member.id || member.employee_id || `${member.employee_code || "member"}-${member.position_name || "pos"}`}
                    className="hover:bg-orange-50/50 dark:hover:bg-slate-800/60"
                  >
                    <td className="font-semibold">
                      <span
                        className="cursor-pointer text-slate-900 hover:text-orange-600 dark:text-slate-100 dark:hover:text-orange-300"
                        onClick={() => navigate("/app/employees", { state: { employeeId: member.id || member.employee_id } })}
                      >
                        {member.employee_name || member.name || "-"}
                      </span>
                    </td>
                    <td>{member.employee_code || "-"}</td>
                    <td>{member.department_name || scopeInfo.department_name || "-"}</td>
                    <td>{member.position_name || "-"}</td>
                    <td><span className="badge badge-outline badge-sm">{member.level || member.level_name || "-"}</span></td>
                  </tr>
                ))}
                {teamMembers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400">Belum ada anggota tim</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <Pagination page={teamPage} totalPages={totalTeamPages} onChangePage={setTeamPage} itemsPerPage={itemsPerPage} />
          </div>
        </CardTitle>

        <CardTitle title="Pegawai dengan Pelanggaran Aktif" subtitle="Daftar anggota tim yang sedang memiliki surat peringatan aktif.">
          {activeViolations.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
              <table className="table table-sm w-full">
                <thead className="bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                  <tr>
                    <th>Pegawai</th>
                    <th>SP Aktif</th>
                    <th>Keterangan Pelanggaran</th>
                    <th>Berlaku Sampai</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeViolations.slice(0, 8).map((item) => (
                    <tr key={item.id} className="hover:bg-orange-50/50 dark:hover:bg-slate-800/60">
                      <td>
                        <div
                          className="cursor-pointer font-semibold text-slate-900 hover:text-orange-600 dark:text-slate-100 dark:hover:text-orange-300"
                          onClick={() => navigate("/app/employees", { state: { employeeId: item.employee_id } })}
                        >
                          {item.employee_name || "-"}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{item.employee_code || "-"} • {item.department_name || scopeInfo.department_name || "-"}</div>
                      </td>
                      <td><span className="badge badge-warning badge-sm">{formatSanctionLabel(item.sp_level)}</span></td>
                      <td className="text-xs leading-5">{formatViolationCounts(item)}</td>
                      <td className="text-sm">
                        {formatDateLabel(item.valid_until)}
                        {item.remaining_days !== null ? <div className="text-xs text-slate-500">{item.remaining_days} hari lagi</div> : null}
                      </td>
                      <td><span className="badge badge-success badge-sm">{formatStatusLabel("active")}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <SummaryPagination />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">Tidak ada pelanggaran aktif pada tim ini</div>
          )}
        </CardTitle>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <CardTitle title={`Top 5 Pegawai Sering Terlambat`} subtitle={`${monthLabel(selectedMonth)} ${selectedYear}`}>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
              <table className="table table-sm w-full">
                <thead className="bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                  <tr><th>Nama Pegawai</th><th>Total</th><th>Hari</th></tr>
                </thead>
                <tbody>
                  {topLateEmployees.slice(0, 5).map((employee) => (
                    <tr key={employee.id || employee.employee_code || employee.name} className="hover:bg-orange-50/50 dark:hover:bg-slate-800/60">
                      <td>
                        <div className="cursor-pointer font-semibold hover:text-orange-600" onClick={() => navigate("/app/employees", { state: { employeeId: employee.id || employee.employee_code } })}>{employee.name || "-"}</div>
                        <div className="text-xs text-slate-500">{employee.employee_code || "-"}</div>
                      </td>
                      <td className="font-semibold">{formatLateDuration(employee.total_late_minutes)}</td>
                      <td>{Number(employee.late_count) || (employee.late_per_day || []).length || 0} hari</td>
                    </tr>
                  ))}
                  {topLateEmployees.length === 0 && <tr><td colSpan={3} className="py-8 text-center text-slate-500">Belum ada pegawai yang terlambat</td></tr>}
                </tbody>
              </table>
              <SummaryPagination />
            </div>
          </CardTitle>

          <CardTitle title="Riwayat Aksi Terbaru" subtitle="Persetujuan cuti dan reimbursement terakhir.">
            <div className="max-h-[340px] overflow-x-auto overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700">
              <table className="table table-sm w-full min-w-[620px]">
                <thead className="sticky top-0 bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                  <tr><th>Tipe</th><th>Pegawai</th><th>Status</th><th>Tanggal</th></tr>
                </thead>
                <tbody>
                  {recentActions.slice(0, 5).map((item) => (
                    <tr
                      key={`${item.type}-${item.id}`}
                      onClick={() => {
                        if (item.type === "leave") navigate("/app/leave-requests-history", { state: { requestId: item.id } });
                        else if (item.type === "reimbursement") navigate("/app/reimbursements-history", { state: { reimbursementId: item.id } });
                      }}
                      className={item.type === "leave" || item.type === "reimbursement" ? "cursor-pointer hover:bg-orange-50/50 dark:hover:bg-slate-800/60" : undefined}
                    >
                      <td><span className="badge badge-ghost badge-sm">{item.type}</span></td>
                      <td>
                        <div className="font-semibold">{item.employee_name}</div>
                        <div className="text-xs text-slate-500">{item.employee_code}</div>
                      </td>
                      <td><span className={`badge badge-sm ${item.status === "approved" ? "badge-success" : "badge-error"}`}>{item.status}</span></td>
                      <td className="whitespace-nowrap text-xs">{item.action_date ? new Date(item.action_date).toLocaleString("id-ID") : "-"}</td>
                    </tr>
                  ))}
                  {recentActions.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-slate-500">Belum ada riwayat persetujuan</td></tr>}
                </tbody>
              </table>
              <SummaryPagination />
            </div>
          </CardTitle>

          <CardTitle title="Pegawai Terlambat Hari Ini" subtitle="Daftar keterlambatan hari ini.">
            {lateRows.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                <table className="table table-sm w-full">
                  <thead className="bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300"><tr><th>No</th><th>Nama</th><th>Terlambat</th></tr></thead>
                  <tbody>
                    {lateRows.slice(0, 5).map((row) => (
                      <tr key={row.key} className="hover:bg-orange-50/50 dark:hover:bg-slate-800/60">
                        <td>{row.no}</td>
                        <td><div className="font-semibold">{row.name}</div><div className="text-xs text-slate-500">{row.employee_code || "-"}</div></td>
                        <td className="whitespace-nowrap">{formatLateDuration(row.minutes)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <SummaryPagination />
                {lateRows.length > 5 ? <div className="p-3 text-right"><button className="btn btn-ghost btn-sm rounded-xl text-orange-600" onClick={() => navigate("/app/team-attendance")}>Lihat Semua</button></div> : null}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">Belum ada yang terlambat hari ini</div>
            )}
          </CardTitle>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CardTitle title="Permohonan Cuti/Izin Menunggu" subtitle={`${monthLabel(selectedMonth)} ${selectedYear}`}>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
              <table className="table table-sm w-full">
                <thead className="bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300"><tr><th>Pegawai</th><th>Tipe</th><th>Tanggal</th><th>Status</th></tr></thead>
                <tbody>
                  {pendingLeaves.slice(0, 5).map((item) => (
                    <tr key={item.id} onClick={() => navigate("/app/leave-requests", { state: { requestId: item.id } })} className="cursor-pointer hover:bg-orange-50/50 dark:hover:bg-slate-800/60">
                      <td><div className="font-semibold">{item.employee_name}</div><div className="text-xs text-slate-500">{item.employee_code}</div></td>
                      <td>{humanizeType(item.leave_type)}</td>
                      <td>{new Date(item.start_date).toLocaleDateString("id-ID")} - {new Date(item.end_date).toLocaleDateString("id-ID")}</td>
                      <td><span className="badge badge-warning badge-sm">{formatStatusLabel(item.status)}</span></td>
                    </tr>
                  ))}
                  {pendingLeaves.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-slate-500">Tidak ada pengajuan cuti/izin yang menunggu</td></tr>}
                </tbody>
              </table>
              <SummaryPagination />
            </div>
          </CardTitle>

          <CardTitle title="Reimbursement Menunggu" subtitle={`${monthLabel(selectedMonth)} ${selectedYear}`}>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
              <table className="table table-sm w-full">
                <thead className="bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300"><tr><th>Pegawai</th><th>Jenis</th><th>Jumlah</th><th>Status</th></tr></thead>
                <tbody>
                  {pendingReimbursements.slice(0, 5).map((item) => (
                    <tr key={item.id} onClick={() => navigate("/app/reimbursements", { state: { reimbursementId: item.id } })} className="cursor-pointer hover:bg-orange-50/50 dark:hover:bg-slate-800/60">
                      <td><div className="font-semibold">{item.employee_name}</div><div className="text-xs text-slate-500">{item.employee_code}</div></td>
                      <td>{item.reimbursement_type || "-"}</td>
                      <td className="font-semibold">Rp {(Number(item.amount) || 0).toLocaleString("id-ID")}</td>
                      <td><span className="badge badge-warning badge-sm">{formatStatusLabel(item.status)}</span></td>
                    </tr>
                  ))}
                  {pendingReimbursements.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-slate-500">Tidak ada reimbursement yang menunggu</td></tr>}
                </tbody>
              </table>
              <SummaryPagination />
            </div>
          </CardTitle>
        </div>
      </div>
    </div>
  );
}

export default AtasanDashboard;
