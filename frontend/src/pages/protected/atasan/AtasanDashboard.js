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

function AtasanDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);
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
      const result = await atasanApi.getDashboard({
        month: Number(selectedMonth),
        year: Number(selectedYear),
      });
      setDashboard(result);
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
      <div className="text-center py-10 text-lg">
        Memuat dashboard atasan...
      </div>
    );
  }

  if (error) {
    return (
      <TitleCard title="Dashboard Atasan" topMargin="mt-0">
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
        <button className="btn btn-primary" onClick={loadDashboard}>
          Muat Ulang
        </button>
      </TitleCard>
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
    },
    {
      title: "Hadir Hari Ini",
      value: today.present || 0,
      detail: `Terlambat: ${today.late || 0} | Tidak Hadir: ${today.absent || 0}`,
      path: "/app/team-attendance",
    },
    {
      title: "Approval Pending",
      value: approvals.total || 0,
      detail: `Cuti/Izin: ${approvals.leave_requests || 0} | Reimbursement: ${approvals.reimbursements || 0}`,
      path: "/app/leave-requests",
    },
    {
      title: "Total Terlambat Bulan Ini",
      value: summary.total_late || 0,
      detail: `Rekap ${summary.total_records || 0} catatan kehadiran`,
      path: "/app/team-attendance",
    },
  ];

  return (
    <>
      <div className="alert bg-base-100 border border-base-300 mb-4">
        <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold">Scope Tim:</span>
            <span className="badge badge-primary badge-outline">
              {scopeInfo.department_name || "Departemen belum terdefinisi"}
            </span>
            <span className="opacity-70">•</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              className="select select-bordered select-sm"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
            >
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
            <select
              className="select select-bordered select-sm"
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
        {statCards.map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={() => navigate(item.path)}
            className="card w-full bg-base-100 shadow-lg text-left hover:bg-base-200/60 transition"
          >
            <div className="card-body p-2 sm:p-4 lg:p-6">
              <p className="text-xs leading-tight opacity-70">{item.title}</p>
              <p className="text-xl sm:text-2xl font-bold text-primary mt-1">
                {item.value}
              </p>
              <p className="text-xs opacity-70 mt-1 hidden sm:block">
                {item.detail}
              </p>
              <p className="text-xs opacity-60 mt-0.5">Klik &rarr;</p>
            </div>
          </button>
        ))}
      </div>

      <TitleCard
        title={`Daftar Nama Anggota Departemen ${scopeInfo.department_name || "Departemen belum terdefinisi"}`}
        topMargin="mt-6"
      >
        <div className="overflow-x-auto">
          <table className="table table-zebra table-sm">
            <thead>
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
                  key={
                    member.id ||
                    member.employee_id ||
                    `${member.employee_code || "member"}-${member.position_name || "pos"}`
                  }
                >
                  <td className="font-semibold">
                    <span
                      className="cursor-pointer hover:underline"
                      onClick={() =>
                        navigate('/app/employees', { state: { employeeId: member.id || member.employee_id } })
                      }
                    >
                      {member.employee_name || member.name || "-"}
                    </span>
                  </td>
                  <td>
                    <span
                      className="cursor-pointer hover:underline"
                      onClick={() =>
                        navigate('/app/employees', { state: { employeeId: member.id || member.employee_id } })
                      }
                    >
                      {member.employee_code || "-"}
                    </span>
                  </td>
                  <td>{member.department_name || scopeInfo.department_name || "-"}</td>
                  <td>
                    <span
                      className="cursor-pointer hover:underline"
                      onClick={() =>
                        navigate('/app/employees', { state: { employeeId: member.id || member.employee_id } })
                      }
                    >
                      {member.position_name || "-"}
                    </span>
                  </td>
                  <td>
                    <span
                      className="cursor-pointer hover:underline"
                      onClick={() =>
                        navigate('/app/employees', { state: { employeeId: member.id || member.employee_id } })
                      }
                    >
                      {member.level || member.level_name || "-"}
                    </span>
                  </td>
                </tr>
              ))}
              {teamMembers.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center opacity-70">
                    Belum ada anggota tim
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {teamMembers.length > 0 && (
          <div className="mt-2">
            <Pagination
              page={teamPage}
              totalPages={totalTeamPages}
              onChangePage={setTeamPage}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </TitleCard>

      <div className="grid lg:grid-cols-3 grid-cols-1 gap-6 mt-6">
        <TitleCard title={`Top 5 Pegawai Sering Terlambat (${monthLabel(selectedMonth)} ${selectedYear})`} topMargin="mt-0">
          <div className="overflow-x-auto">
            <table className="table table-zebra table-sm">
              <thead>
                <tr>
                  <th>Nama Pegawai</th>
                  <th>Total Keterlambatan</th>
                  <th>Jumlah Hari Telat</th>
                </tr>
              </thead>
              <tbody>
                {topLateEmployees.slice(0, 5).map((employee) => (
                  <tr
                    key={employee.id || employee.employee_code || employee.name}
                  >
                    <td>
                      <div
                        className="font-semibold cursor-pointer hover:underline"
                        onClick={() =>
                          navigate('/app/employees', { state: { employeeId: employee.id || employee.employee_code } })
                        }
                      >
                        {employee.name || "-"}
                      </div>
                      <div className="text-xs opacity-70">
                        {employee.employee_code || "-"}
                      </div>
                    </td>
                    <td className="font-semibold">
                      {formatLateDuration(employee.total_late_minutes)}
                    </td>
                    <td>
                      {Number(employee.late_count) ||
                        (employee.late_per_day || []).length ||
                        0}{" "}
                      hari
                    </td>
                  </tr>
                ))}
                {topLateEmployees.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center opacity-70">
                      Belum ada pegawai yang terlambat
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TitleCard>

        <TitleCard title="Riwayat Aksi Persetujuan Terbaru" topMargin="mt-0">
          <div className="overflow-y-auto max-h-[320px]">
            <table className="table table-zebra table-sm">
              <thead>
                <tr>
                  <th>Tipe</th>
                  <th>Pegawai</th>
                  <th>Detail</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {recentActions.slice(0, 5).map((item) => (
                  <tr
                    key={`${item.type}-${item.id}`}
                    onClick={() => {
                      if (item.type === "leave") navigate('/app/leave-requests-history', { state: { requestId: item.id } });
                      else if (item.type === "reimbursement") navigate('/app/reimbursements-history', { state: { reimbursementId: item.id } });
                    }}
                    className={item.type === "leave" || item.type === "reimbursement" ? "cursor-pointer hover:bg-base-200/50" : undefined}
                  >
                    <td>
                      <span className="badge badge-ghost badge-sm">
                        {item.type}
                      </span>
                    </td>
                    <td>
                      <div
                        className="font-semibold cursor-pointer hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/app/employees', { state: { employeeId: item.employee_id || item.employee_code } });
                        }}
                      >
                        {item.employee_name}
                      </div>
                      <div className="text-xs opacity-70">
                        {item.employee_code}
                      </div>
                    </td>
                    <td>{item.type === "leave" ? humanizeType(item.detail) : item.detail || "-"}</td>
                    <td>
                      <span
                        className={`badge badge-sm ${item.status === "approved" ? "badge-success" : "badge-error"}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      {item.action_date
                        ? new Date(item.action_date).toLocaleString("id-ID")
                        : "-"}
                    </td>
                  </tr>
                ))}
                {recentActions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center opacity-70">
                      Belum ada riwayat persetujuan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {recentActions.length > 5 ? (
            <div className="text-right mt-3">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate("/app/leave-requests")}
              >
                Lihat Semua
              </button>
            </div>
          ) : null}
        </TitleCard>

        <TitleCard title="Pegawai yang Terlambat Hari Ini" topMargin="mt-0">
          {lateRows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table table-zebra table-sm">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama</th>
                    <th>Kode</th>
                    <th>Tanggal</th>
                    <th className="whitespace-nowrap">Terlambat</th>
                  </tr>
                </thead>
                <tbody>
                  {lateRows.slice(0, 5).map((row) => (
                    <tr key={row.key}>
                      <td>{row.no}</td>
                      <td className="font-semibold">{row.name}</td>
                      <td>{row.employee_code || "-"}</td>
                      <td>
                        {row.date
                          ? new Date(row.date).toLocaleDateString("id-ID")
                          : "-"}
                      </td>
                      <td className="whitespace-nowrap">
                        {formatLateDuration(row.minutes)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {lateRows.length > 5 ? (
                <div className="text-right mt-3">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => navigate("/app/team-attendance")}
                  >
                    Lihat Semua
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="text-center opacity-70 py-10">
              Belum ada yang terlambat hari ini
            </div>
          )}
        </TitleCard>
      </div>

      <div className="grid lg:grid-cols-2 grid-cols-1 gap-6 mt-6">
        <TitleCard title={`Permohonan Cuti/Izin Pending (${monthLabel(selectedMonth)} ${selectedYear})`} topMargin="mt-0">
          <div className="overflow-x-auto">
            <table className="table table-zebra table-sm">
              <thead>
                <tr>
                  <th>Pegawai</th>
                  <th>Tipe</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingLeaves.slice(0, 5).map((item) => (
                  <tr key={item.id} onClick={() => navigate('/app/leave-requests', { state: { requestId: item.id } })} className="cursor-pointer hover:bg-base-200/50">
                    <td>
                      <div
                        className="font-semibold cursor-pointer hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/app/employees', { state: { employeeId: item.employee_id || item.employee_code } });
                        }}
                      >
                        {item.employee_name}
                      </div>
                      <div className="text-xs opacity-70">
                        {item.employee_code}
                      </div>
                    </td>
                    <td>{humanizeType(item.leave_type)}</td>
                    <td>
                      {new Date(item.start_date).toLocaleDateString("id-ID")} -{" "}
                      {new Date(item.end_date).toLocaleDateString("id-ID")}
                    </td>
                    <td>
                      <span className="badge badge-warning badge-sm">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {pendingLeaves.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center opacity-70">
                      Tidak ada pengajuan cuti/izin pending
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {pendingLeaves.length > 5 ? (
            <div className="text-right mt-3">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate("/app/leave-requests")}
              >
                Lihat Semua
              </button>
            </div>
          ) : null}
        </TitleCard>

        <TitleCard title={`Reimbursement Pending (${monthLabel(selectedMonth)} ${selectedYear})`} topMargin="mt-0">
          <div className="overflow-x-auto">
            <table className="table table-zebra table-sm">
              <thead>
                <tr>
                  <th>Pegawai</th>
                  <th>Jenis</th>
                  <th>Jumlah</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingReimbursements.slice(0, 5).map((item) => (
                  <tr key={item.id} onClick={() => navigate('/app/reimbursements', { state: { reimbursementId: item.id } })} className="cursor-pointer hover:bg-base-200/50">
                    <td>
                      <div
                        className="font-semibold cursor-pointer hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/app/employees', { state: { employeeId: item.employee_id || item.employee_code } });
                        }}
                      >
                        {item.employee_name}
                      </div>
                      <div className="text-xs opacity-70">
                        {item.employee_code}
                      </div>
                    </td>
                    <td>{item.reimbursement_type || "-"}</td>
                    <td className="font-semibold">
                      Rp {(Number(item.amount) || 0).toLocaleString("id-ID")}
                    </td>
                    <td>
                      <span className="badge badge-warning badge-sm">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {pendingReimbursements.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center opacity-70">
                      Tidak ada reimbursement pending
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {pendingReimbursements.length > 5 ? (
            <div className="text-right mt-3">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate("/app/reimbursements")}
              >
                Lihat Semua
              </button>
            </div>
          ) : null}
        </TitleCard>
      </div>
    </>
  );
}

export default AtasanDashboard;

