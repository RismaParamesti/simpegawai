import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setPageTitle } from "../../../features/common/headerSlice";
import { adminApi } from "../../../features/admin/api";
import Pagination from "../../../components/Pagination/Pagination";

const SummaryPagination = () => (
  <Pagination page={1} totalPages={1} onChangePage={() => {}} />
);

const AdminHeroIllustration = () => (
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
    <div className="absolute right-14 top-24 h-8 w-2 rounded-full bg-slate-400 dark:bg-slate-500" />
    <div className="absolute right-28 top-24 h-8 w-2 rounded-full bg-slate-400 dark:bg-slate-500" />
  </div>
);

function InternalPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);

  const getStatusBadgeClass = (status) => {
    const s = String(status || "").toLowerCase().trim();

    switch (s) {
      case "active":
      case "aktif":
        return "badge border-none bg-emerald-500 text-white";

      case "inactive":
      case "nonactive":
      case "non-active":
      case "tidak aktif":
      case "nonaktif":
        return "badge border-none bg-red-500 text-white";

      case "permanent":
      case "tetap":
        return "badge border-none bg-blue-500 text-white";

      case "contract":
      case "kontrak":
        return "badge border-none bg-amber-400 text-slate-900";

      case "intern":
      case "magang":
        return "badge border-none bg-orange-500 text-white";

      default:
        return "badge badge-outline";
    }
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await adminApi.getDashboard();
      setDashboard(result);
    } catch (err) {
      setError(err.message || "Gagal memuat dashboard admin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    dispatch(setPageTitle({ title: "Dashboard Admin" }));
    loadDashboard();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-950">
        <span className="loading loading-spinner loading-lg text-orange-500" />
        <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
          Memuat dashboard admin...
        </p>
      </div>
    );
  }

  const employees = dashboard?.overview?.employees || {};
  const users = dashboard?.overview?.users || {};
  const recentUsers = dashboard?.recent_activity?.new_users || [];
  const recentEmployees = dashboard?.recent_activity?.new_employees || [];
  const departmentStats = dashboard?.departments || [];
  const shiftStats = dashboard?.shifts || [];

  const statCards = [
    {
      title: "Total Pegawai",
      value: employees.total_employees || 0,
      description: "Seluruh data pegawai terdaftar",
      icon: "👥",
      path: "/app/employees",
      color: "orange",
    },
    {
      title: "Total User",
      value: users.total_users || 0,
      description: "Akun pengguna sistem",
      icon: "🧑‍💻",
      path: "/app/users",
      color: "blue",
    },
    {
      title: "User Aktif",
      value: users.active_users || 0,
      description: "Akun yang dapat mengakses sistem",
      icon: "✅",
      path: "/app/users?status=active",
      color: "emerald",
    },
    {
      title: "User Nonaktif",
      value: users.inactive_users || 0,
      description: "Akun yang tidak aktif",
      icon: "⛔",
      path: "/app/users?status=inactive",
      color: "red",
    },
  ];

  const colorClass = {
    orange:
      "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 dark:border-orange-900/50 dark:bg-orange-950/30 dark:text-orange-200",
    blue:
      "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200",
    emerald:
      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200",
    red:
      "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200",
  };

  const SectionCard = ({ title, subtitle, children, action }) => (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </div>
  );

  const EmptyState = ({ text }) => (
    <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
      {text}
    </div>
  );

  return (
    <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white p-4 shadow-[0_20px_70px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-950 dark:shadow-[0_20px_70px_rgba(2,6,23,0.45)] sm:p-7">
      <div className="space-y-6">
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
          <AdminHeroIllustration />

          <div className="relative z-10 max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600 dark:border-orange-900/60 dark:bg-orange-950/70 dark:text-orange-300">
              Dashboard Admin
            </div>

            <h1 className="text-[28px] font-extrabold leading-tight text-slate-900 dark:text-slate-50">
              Ringkasan Data Internal
            </h1>

            <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">
              Pantau data pegawai, akun pengguna, departemen, serta informasi
              jam kerja terbaru dari satu halaman yang mudah dipahami.
            </p>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={() => navigate(item.path)}
              className={`rounded-2xl border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                colorClass[item.color]
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold opacity-80">
                    {item.title}
                  </p>
                  <p className="mt-2 text-3xl font-extrabold">{item.value}</p>
                  <p className="mt-1 text-xs font-medium opacity-80">
                    {item.description}
                  </p>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/60 text-2xl shadow-sm dark:bg-white/10">
                  {item.icon}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* DEPARTMENT + SHIFT */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SectionCard
            title="Departemen Terbaru"
            subtitle="Daftar departemen dan jumlah posisi yang tersedia."
            action={
              departmentStats.length > 5 ? (
                <button
                  className="btn btn-ghost btn-sm rounded-xl text-orange-600"
                  onClick={() => navigate("/app/positions")}
                >
                  Lihat Semua
                </button>
              ) : null
            }
          >
            {departmentStats.length === 0 ? (
              <EmptyState text="Belum ada data departemen" />
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                <table className="table table-sm w-full">
                  <thead className="bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                    <tr>
                      <th>Departemen</th>
                      <th>Posisi</th>
                      <th>Pegawai</th>
                      <th>Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentStats.slice(0, 5).map((department) => (
                      <tr
                        key={department.id || `${department.name}-${department.code}`}
                        onClick={() =>
                          navigate(
                            department.id
                              ? `/app/positions/${department.id}`
                              : "/app/positions",
                          )
                        }
                        className="cursor-pointer hover:bg-orange-50/70 dark:hover:bg-slate-800"
                      >
                        <td>
                          <div className="font-bold text-slate-900 dark:text-slate-50">
                            {department.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {department.code || "-"}
                          </div>
                        </td>
                        <td>{department.position_count || 0}</td>
                        <td>{department.employee_count || 0}</td>
                        <td>
                          {department.created_at
                            ? new Date(department.created_at).toLocaleDateString(
                                "id-ID",
                              )
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <SummaryPagination />
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Informasi Jam Kerja"
            subtitle="Ringkasan shift yang digunakan pegawai."
            action={
              shiftStats.length > 5 ? (
                <button
                  className="btn btn-ghost btn-sm rounded-xl text-orange-600"
                  onClick={() => navigate("/app/attendance")}
                >
                  Lihat Semua
                </button>
              ) : null
            }
          >
            {shiftStats.length === 0 ? (
              <EmptyState text="Belum ada data shift" />
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                <table className="table table-sm w-full">
                  <thead className="bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                    <tr>
                      <th>Jenis</th>
                      <th>Jam Masuk</th>
                      <th>Jam Pulang</th>
                      <th>Pegawai</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shiftStats.slice(0, 5).map((shift) => (
                      <tr
                        key={`${shift.shift_name}-${shift.check_in_time}-${shift.check_out_time}`}
                        className="hover:bg-orange-50/70 dark:hover:bg-slate-800"
                      >
                        <td className="font-bold text-slate-900 dark:text-slate-50">
                          {shift.shift_name}
                        </td>
                        <td>{shift.check_in_time || "-"}</td>
                        <td>{shift.check_out_time || "-"}</td>
                        <td>{shift.employee_count || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <SummaryPagination />
              </div>
            )}
          </SectionCard>
        </div>

        {/* USERS + EMPLOYEES */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SectionCard
            title="User Terbaru"
            subtitle="Akun pengguna yang baru ditambahkan."
            action={
              recentUsers.length > 5 ? (
                <button
                  className="btn btn-ghost btn-sm rounded-xl text-orange-600"
                  onClick={() => navigate("/app/users")}
                >
                  Lihat Semua
                </button>
              ) : null
            }
          >
            {recentUsers.length === 0 ? (
              <EmptyState text="Belum ada user terbaru" />
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                <table className="table table-sm w-full">
                  <thead className="bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                    <tr>
                      <th>Nama</th>
                      <th>Email</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.slice(0, 5).map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-orange-50/70 dark:hover:bg-slate-800"
                      >
                        <td className="font-bold text-slate-900 dark:text-slate-50">
                          {user.name}
                        </td>
                        <td className="text-slate-500 dark:text-slate-400">
                          {user.email}
                        </td>
                        <td>
                          <span className={getStatusBadgeClass(user.status)}>
                            {user.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <SummaryPagination />
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Pegawai Terbaru"
            subtitle="Data pegawai yang baru masuk ke sistem."
            action={
              recentEmployees.length > 5 ? (
                <button
                  className="btn btn-ghost btn-sm rounded-xl text-orange-600"
                  onClick={() => navigate("/app/employees")}
                >
                  Lihat Semua
                </button>
              ) : null
            }
          >
            {recentEmployees.length === 0 ? (
              <EmptyState text="Belum ada pegawai terbaru" />
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                <table className="table table-sm w-full">
                  <thead className="bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                    <tr>
                      <th>Kode</th>
                      <th>Nama</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEmployees.slice(0, 5).map((employee) => (
                      <tr
                        key={employee.employee_code}
                        className="hover:bg-orange-50/70 dark:hover:bg-slate-800"
                      >
                        <td className="font-semibold text-slate-500 dark:text-slate-400">
                          {employee.employee_code}
                        </td>
                        <td className="font-bold text-slate-900 dark:text-slate-50">
                          {employee.name}
                        </td>
                        <td>
                          <span
                            className={getStatusBadgeClass(
                              employee.employment_status,
                            )}
                          >
                            {employee.employment_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <SummaryPagination />
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

export default InternalPage;
