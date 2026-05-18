import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../../features/common/headerSlice";
import TitleCard from "../../../components/Cards/TitleCard";
import Pagination from "../../../components/Pagination/Pagination";
import { adminApi } from "../../../features/admin/api";

const INITIAL_FILTERS = {
  date: "",
  user: "",
  action: "",
  module: "",
  status: "",
  page: 1,
  limit: 10,
};

const MODULE_OPTIONS = [
  { value: "attendance", label: "Kehadiran" },
  { value: "leave_requests", label: "Cuti / Izin" },
  { value: "reimbursements", label: "Reimbursement" },
  { value: "payroll", label: "Gaji" },
  { value: "salary_appeals", label: "Banding Gaji" },
  { value: "employees", label: "Pegawai" },
  { value: "job_openings", label: "Lowongan" },
  { value: "auth", label: "Login / Logout" },
];

// 🎯 Badge helpers
const getActionBadge = (action) => {
  switch (action?.toUpperCase()) {
    case "CREATE":
    case "TAMBAH":
      return "badge-success";
    case "UPDATE":
    case "EDIT":
      return "badge-info";
    case "DELETE":
    case "HAPUS":
      return "badge-error";
    default:
      return "badge-ghost";
  }
};

const getModuleBadge = (module) => {
  switch (module?.toLowerCase()) {
    case "attendance":
    case "kehadiran":
      return "badge-success";
    case "leave":
    case "leave_requests":
    case "cuti":
      return "badge-secondary";
    case "permit":
    case "izin":
      return "badge-warning";
    case "reimbursement":
    case "reimbursements":
      return "badge-accent";
    case "payroll":
    case "gaji":
      return "badge-info";
    case "salary_appeals":
    case "banding gaji":
      return "badge-error";
    case "auth":
    case "login":
    case "logout":
      return "badge-primary";
    default:
      return "badge-ghost";
  }
};

const formatDescription = (description) => {
  const text = String(description || "");

  const exactMatches = [
    [/^Successful login$/i, "Login berhasil"],
    [/^User logged out$/i, "Pengguna keluar"],
    [/^Blocked login - account inactive$/i, "Login diblokir - akun nonaktif"],
    [/^Failed login attempt - user not found$/i, "Percobaan login gagal - pengguna tidak ditemukan"],
    [/^Failed login attempt - invalid password$/i, "Percobaan login gagal - kata sandi salah"],
    [/^Check-in$/i, "Check-in"],
    [/^Check-in failed$/i, "Check-in gagal"],
    [/^Check-out$/i, "Check-out"],
    [/^Check-out failed$/i, "Check-out gagal"],
    [/^Leave request submitted$/i, "Pengajuan cuti dikirim"],
    [/^Leave request auto-approved$/i, "Pengajuan cuti disetujui otomatis"],
    [/^Leave request approved$/i, "Pengajuan cuti disetujui"],
    [/^Leave request rejected$/i, "Pengajuan cuti ditolak"],
    [/^Reimbursement submitted$/i, "Pengajuan reimbursement dikirim"],
    [/^Reimbursement approved by manager$/i, "Reimbursement disetujui atasan"],
    [/^Reimbursement rejected by manager$/i, "Reimbursement ditolak atasan"],
    [/^Reimbursement validated and included in payroll$/i, "Reimbursement divalidasi dan dimasukkan ke payroll"],
    [/^Reimbursement rejected by HR$/i, "Reimbursement ditolak HR"],
    [/^Attendance record edited by atasan$/i, "Data kehadiran diedit oleh atasan"],
    [/^Attendance status updated to (.+)$/i, "Status kehadiran diperbarui menjadi $1"],
    [/^Updated employee data for ID: (.+)$/i, "Data pegawai diperbarui untuk ID: $1"],
    [/^Deleted employee ID: (.+)$/i, "Pegawai dihapus dengan ID: $1"],
    [/^Created department: (.+)$/i, "Departemen dibuat: $1"],
    [/^Updated department: (.+)$/i, "Departemen diperbarui: $1"],
    [/^Deleted department: (.+)$/i, "Departemen dihapus: $1"],
    [/^Created position: (.+)$/i, "Posisi dibuat: $1"],
    [/^Updated position ID: (.+)$/i, "Posisi diperbarui untuk ID: $1"],
    [/^Deleted position ID: (.+)$/i, "Posisi dihapus untuk ID: $1"],
    [/^Created new staff account: (.+)$/i, "Akun staf baru dibuat: $1"],
    [/^Updated user ID: (.+)$/i, "User diperbarui untuk ID: $1"],
    [/^Soft deleted user ID: (.+)$/i, "User dihapus sementara untuk ID: $1"],
  ];

  for (const [pattern, replacement] of exactMatches) {
    if (pattern.test(text)) {
      return text.replace(pattern, replacement);
    }
  }

  return text;
};

const getModuleLabel = (module) => {
  if (!module) return "";
  const key = String(module).toLowerCase();
  const found = MODULE_OPTIONS.find((o) => o.value.toLowerCase() === key || o.label.toLowerCase() === key);
  if (found) return found.label;

  const fallback = {
    attendance: "Kehadiran",
    kehadiran: "Kehadiran",
    leave: "Cuti / Izin",
    cuti: "Cuti / Izin",
    reimbursements: "Reimbursement",
    reimbursement: "Reimbursement",
    payroll: "Gaji",
    salary_appeals: "Banding Gaji",
    employees: "Pegawai",
    job_openings: "Lowongan",
    auth: "Login / Logout",
  };

  return fallback[key] || String(module);
};

function AdminActivityLogs() {
  const dispatch = useDispatch();
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [logs, setLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async (customFilters = INITIAL_FILTERS) => {
    try {
      setLoading(true);
      setError("");
      const params = {
        ...customFilters,
        search: customFilters.user || undefined,
        startDate: customFilters.date || undefined,
        endDate: customFilters.date || undefined,
      };

      const [logsData] = await Promise.all([
        adminApi.getActivityLogs(params),
      ]);

      setLogs(logsData.data || []);
      setPagination(logsData.pagination || { page: 1, totalPages: 1 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadEmployees = useCallback(async () => {
    try {
      const employeeData = await adminApi.getEmployees();
      setEmployees(employeeData || []);
    } catch (err) {
      console.error("Failed to load employees for activity log filter:", err);
    }
  }, []);

  useEffect(() => {
    dispatch(setPageTitle({ title: "Log Aktivitas" }));
  }, [dispatch]);

  useEffect(() => {
    loadData(filters);
  }, [filters, loadData]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const employeeOptions = employees
    .map((employee) => {
      const label = employee.full_name || employee.name || employee.username;
      const value = employee.username || employee.full_name || employee.name;

      return label && value ? { label, value } : null;
    })
    .filter(Boolean)
    .sort((left, right) => left.label.localeCompare(right.label));

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const changePage = (nextPage) => {
    const validPage = Math.max(
      1,
      Math.min(nextPage, pagination.totalPages || 1),
    );
    const nextFilters = { ...filters, page: validPage, limit: 10 };
    setFilters(nextFilters);
  };

  return (
    <>
      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      {/* 📋 LOG TABLE */}
      <TitleCard title="Log Aktivitas" topMargin="mt-6">
        <p className="text-sm opacity-70 mb-4">
          Memantau aktivitas tambah, edit, hapus pada kehadiran, cuti, izin,
          reimbursement, gaji, dan banding gaji
        </p>

        {/* 🔍 FILTER */}
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
          <label className="form-control w-full">
            <span className="label-text mb-1 text-sm font-medium text-base-content/70">
              Tanggal
            </span>

            <input
              type="date"
              className="input input-bordered w-full"
              value={filters.date}
              onChange={(e) => handleFilterChange("date", e.target.value)}
            />
          </label>

          <label className="form-control w-full">
            <span className="label-text mb-1 text-sm font-medium text-base-content/70">
              Nama User
            </span>

            <select
              className="select select-bordered w-full"
              value={filters.user}
              onChange={(e) => handleFilterChange("user", e.target.value)}
            >
              <option value="">Semua Pengguna</option>
              {employeeOptions.map((employee) => (
                <option key={employee.value} value={employee.value}>
                  {employee.label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-control w-full">
            <span className="label-text mb-1 text-sm font-medium text-base-content/70">
              Modul
            </span>

            <select
              className="select select-bordered w-full"
              value={filters.module}
              onChange={(e) => handleFilterChange("module", e.target.value)}
            >
              <option value="">Semua Modul</option>
              {MODULE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-control w-full">
            <span className="label-text mb-1 text-sm font-medium text-base-content/70">
              Aksi
            </span>

            <select
              className="select select-bordered w-full"
              value={filters.action}
              onChange={(e) => handleFilterChange("action", e.target.value)}
            >
              <option value="">Semua Aksi</option>
              <option value="CREATE">Ditambahkan</option>
              <option value="UPDATE">Diperbarui</option>
              <option value="DELETE">Dihapus</option>
            </select>
          </label>

          <label className="form-control w-full">
            <span className="label-text mb-1 text-sm font-medium text-base-content/70">
              Status
            </span>

            <select
              className="select select-bordered w-full"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="success">Berhasil</option>
              <option value="failed">Gagal</option>
            </select>
          </label>

            <button
            className="btn btn-secondary rounded-full px-6 min-h-12 self-start md:self-end md:mt-6"
              onClick={handleResetFilters}
            >
              Reset Filter
            </button>
        </div>

        {/* 📊 TABLE */}
        {loading ? (
          <div>Memuat...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Waktu</th>
                    <th>Pengguna</th>
                    <th>Modul</th>
                    <th>Aksi</th>
                    <th>Status</th>
                    <th>Deskripsi</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="text-sm">
                        {new Date(log.created_at).toLocaleString("id-ID")}
                      </td>

                      <td>
                        <div className="font-medium">{log.username}</div>
                        <div className="text-xs opacity-60">{log.role}</div>
                      </td>

                      <td>
                        <span className={`badge ${getModuleBadge(log.module)}`}>
                          {getModuleLabel(log.module)}
                        </span>
                      </td>

                      <td>
                        <span className={`badge ${getActionBadge(log.action)}`}>
                          {log.action}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`badge ${log.status === "success" ? "badge-success" : "badge-error"}`}
                        >
                          {log.status}
                        </span>
                      </td>

                      <td className="max-w-xs truncate text-sm">
                        {formatDescription(log.description)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 🔄 PAGINATION */}
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onChangePage={changePage}
              itemsPerPage={10}
            />
          </>
        )}
      </TitleCard>
    </>
  );
}

export default AdminActivityLogs;

