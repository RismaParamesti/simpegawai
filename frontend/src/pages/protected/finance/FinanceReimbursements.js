import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../../features/common/headerSlice";
import Pagination from "../../../components/Pagination/Pagination";
import { financeApi } from "../../../features/finance/api";
import useTablePagination from "../../../hooks/useTablePagination";

const formatCurrency = (value) =>
  `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const isIncludedInPayroll = (item) =>
  item.status === "included_in_payroll" && Number(item.payroll_id || 0) > 0;

const isReadyForPayroll = (item) =>
  item.status === "approved" ||
  (item.status === "included_in_payroll" && !isIncludedInPayroll(item));

const getFinanceStatusLabel = (item) => {
  if (isIncludedInPayroll(item)) return "Sudah Masuk Payroll";
  if (isReadyForPayroll(item)) return "Siap Masuk Payroll";

  const status = String(item.status || "").toLowerCase();
  const labelMap = {
    pending: "Menunggu",
    approved: "Disetujui",
    rejected: "Ditolak",
    paid: "Dibayar",
    cancelled: "Dibatalkan",
  };

  return labelMap[status] || item.status || "-";
};

const getFinanceStatusBadge = (item) => {
  if (isIncludedInPayroll(item)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300";
  }

  if (isReadyForPayroll(item)) {
    return "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-300";
  }

  switch (String(item.status || "").toLowerCase()) {
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300";
    case "approved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "rejected":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300";
    case "paid":
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300";
    case "cancelled":
      return "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";
    default:
      return "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300";
  }
};

const FinanceHeroIllustration = () => (
  <div className="pointer-events-none absolute right-10 top-2 hidden h-32 w-80 lg:block">
    <div className="absolute bottom-2 right-0 h-20 w-72 rounded-full bg-orange-100/80 blur-[1px] dark:bg-orange-900/30" />
    <div className="absolute right-36 top-1 h-24 w-20 rotate-[-3deg] rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-2 border-b border-orange-100 px-2 py-2 dark:border-slate-700">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-orange-500 dark:bg-orange-900/40 dark:text-orange-300">
          Rp
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

function FinanceReimbursements() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [items, setItems] = useState([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const result = await financeApi.getReimbursements();
      setItems(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err.message || "Gagal memuat data reimbursement");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    dispatch(setPageTitle({ title: "Reimbursement Finance" }));
    loadData();
  }, [dispatch, loadData]);

  const typeOptions = useMemo(
    () => Array.from(new Set(items.map((item) => item.reimbursement_type).filter(Boolean))),
    [items],
  );

  const employeeOptions = useMemo(
    () =>
      Array.from(
        new Set(
          items.map(
            (item) => `${item.employee_code || "-"}|${item.employee_name || "-"}`,
          ),
        ),
      ),
    [items],
  );

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const statusMatch =
        statusFilter === "ready_for_payroll"
          ? isReadyForPayroll(item)
          : statusFilter === "included_in_payroll"
            ? isIncludedInPayroll(item)
            : statusFilter
              ? item.status === statusFilter
              : true;

      const typeMatch = typeFilter ? item.reimbursement_type === typeFilter : true;
      const employeeKey = `${item.employee_code || "-"}|${item.employee_name || "-"}`;
      const employeeMatch = employeeFilter ? employeeKey === employeeFilter : true;

      return statusMatch && typeMatch && employeeMatch;
    });
  }, [employeeFilter, items, statusFilter, typeFilter]);

  const itemsPagination = useTablePagination(filteredItems);

  const readyCount = items.filter((item) => isReadyForPayroll(item)).length;
  const includedCount = items.filter((item) => isIncludedInPayroll(item)).length;
  const totalCount = readyCount + includedCount;
  const totalAmount = filteredItems.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  );

  const resetFilters = () => {
    setStatusFilter("");
    setTypeFilter("");
    setEmployeeFilter("");
  };

  if (loading) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
        <span className="loading loading-spinner loading-lg text-orange-500" />
        <p className="mt-3 text-sm font-semibold">Memuat data reimbursement...</p>
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white p-4 shadow-[0_20px_70px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-950 dark:shadow-[0_20px_70px_rgba(2,6,23,0.45)] sm:p-7">
      <div className="space-y-6">
        <div className="relative min-h-[120px] overflow-hidden rounded-[1.4rem] bg-gradient-to-r from-white via-white to-orange-50/80 px-5 py-6 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 sm:px-6">
          <FinanceHeroIllustration />
          <div className="relative z-10 max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600 dark:border-orange-900/60 dark:bg-orange-950/70 dark:text-orange-300">
              Reimbursement Finance
            </div>
            <h1 className="text-[28px] font-extrabold leading-tight text-slate-900 dark:text-slate-50">
              Data Reimbursement
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">
              Kelola reimbursement yang siap dimasukkan ke payroll dan pantau data yang sudah masuk payroll.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-semibold">{error}</span>
              <button
                type="button"
                className="btn btn-sm rounded-xl border-none bg-red-500 text-white hover:bg-red-600"
                onClick={loadData}
              >
                Muat Ulang
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              label: "Siap Masuk Payroll",
              value: readyCount,
              desc: "Reimbursement sudah disetujui",
              className:
                "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/50 dark:bg-orange-950/30 dark:text-orange-300",
            },
            {
              label: "Sudah Masuk Payroll",
              value: includedCount,
              desc: "Reimbursement sudah terhubung payroll",
              className:
                "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300",
            },
            {
              label: "Total Reimbursement",
              value: totalCount,
              desc: "Total data siap dan masuk payroll",
              className:
                "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300",
            },
          ].map((card) => (
            <div
              key={card.label}
              className={`rounded-2xl border p-5 shadow-sm ${card.className}`}
            >
              <p className="text-sm font-semibold opacity-80">{card.label}</p>
              <p className="mt-2 text-3xl font-extrabold">{card.value}</p>
              <p className="mt-1 text-xs font-medium opacity-80">{card.desc}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">
                Daftar Reimbursement
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Total nominal hasil filter: {formatCurrency(totalAmount)}
              </p>
            </div>
          </div>

          <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-950/50">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
              <select
                className="select select-bordered w-full rounded-xl bg-white text-slate-900 lg:col-span-3 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="ready_for_payroll">Siap Masuk Payroll</option>
                <option value="included_in_payroll">Sudah Masuk Payroll</option>
              </select>

              <select
                className="select select-bordered w-full rounded-xl bg-white text-slate-900 lg:col-span-3 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
              >
                <option value="">Semua Jenis</option>
                {typeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <select
                className="select select-bordered w-full rounded-xl bg-white text-slate-900 lg:col-span-4 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                value={employeeFilter}
                onChange={(event) => setEmployeeFilter(event.target.value)}
              >
                <option value="">Semua Pegawai</option>
                {employeeOptions.map((employee) => {
                  const [code, name] = employee.split("|");
                  return (
                    <option key={employee} value={employee}>
                      {code} - {name}
                    </option>
                  );
                })}
              </select>

              <button
                type="button"
                className="btn rounded-xl border-none bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 lg:col-span-2"
                onClick={resetFilters}
              >
                Reset
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="table table-sm w-full min-w-[760px]">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th>Pegawai</th>
                  <th>Kode</th>
                  <th>Jenis</th>
                  <th>Nominal</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {itemsPagination.paginatedItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-slate-100 hover:bg-orange-50/50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                  >
                    <td>
                      <div className="font-bold text-slate-900 dark:text-slate-50">
                        {item.employee_name || "-"}
                      </div>
                    </td>
                    <td className="text-slate-500 dark:text-slate-400">
                      {item.employee_code || "-"}
                    </td>
                    <td>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {item.reimbursement_type || "-"}
                      </span>
                    </td>
                    <td className="font-extrabold text-orange-600 dark:text-orange-300">
                      {formatCurrency(item.amount)}
                    </td>
                    <td>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getFinanceStatusBadge(
                          item,
                        )}`}
                      >
                        {getFinanceStatusLabel(item)}
                      </span>
                    </td>
                    <td className="text-slate-500 dark:text-slate-400">
                      {formatDate(item.created_at)}
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500 dark:text-slate-400">
                      Belum ada data reimbursement yang sesuai filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredItems.length > 0 && (
            <div className="mt-3">
              <Pagination
                page={itemsPagination.page}
                totalPages={itemsPagination.totalPages}
                onChangePage={itemsPagination.setPage}
                itemsPerPage={itemsPagination.itemsPerPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FinanceReimbursements;
