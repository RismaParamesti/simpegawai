import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../../features/common/headerSlice";
import { financeApi } from "../../../features/finance/api";
import Pagination from "../../../components/Pagination/Pagination";
import useTablePagination from "../../../hooks/useTablePagination";
import * as XLSX from "xlsx";

function FinanceReports() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [payrolls, setPayrolls] = useState([]);
  const payrollsPagination = useTablePagination(payrolls);
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    String(now.getMonth() + 1),
  );
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));

  const toNumber = (value) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const normalized = value.replace(/[^0-9.-]/g, "");
      const parsed = Number(normalized);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  };

  const formatRupiah = (v) => `Rp ${toNumber(v).toLocaleString("id-ID")}`;

  const formatDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const result = await financeApi.getDashboard();
      setDashboard(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPayrolls = useCallback(async (month, year) => {
    try {
      setLoading(true);
      setError("");
      const params = { month: Number(month), year: Number(year) };
      const list = await financeApi.getPayrollList(params);
      setPayrolls(list || []);
    } catch (err) {
      setError(err.message || "Gagal memuat data payroll");
      setPayrolls([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateTotals = () => ({
    basicSalary: payrolls.reduce((sum, item) => sum + toNumber(item.basic_salary), 0),
    allowance: payrolls.reduce((sum, item) => sum + toNumber(item.allowance), 0),
    transportAllowance: payrolls.reduce((sum, item) => sum + toNumber(item.transport_allowance), 0),
    mealAllowance: payrolls.reduce((sum, item) => sum + toNumber(item.meal_allowance), 0),
    healthAllowance: payrolls.reduce((sum, item) => sum + toNumber(item.health_allowance), 0),
    bonus: payrolls.reduce((sum, item) => sum + toNumber(item.bonus), 0),
    otherAllowance: payrolls.reduce((sum, item) => sum + toNumber(item.other_allowance), 0),
    grossSalary: payrolls.reduce((sum, item) => sum + toNumber(item.gross_salary), 0),
    totalIncome: payrolls.reduce((sum, item) => sum + toNumber(item.total_income), 0),
    reimbursementTotal: payrolls.reduce((sum, item) => sum + toNumber(item.reimbursement_total), 0),
    totalDeduction: payrolls.reduce((sum, item) => sum + toNumber(item.deduction), 0),
    lateDeduction: payrolls.reduce((sum, item) => sum + toNumber(item.late_deduction), 0),
    absentDeduction: payrolls.reduce((sum, item) => sum + toNumber(item.absent_deduction), 0),
    bpjsDeduction: payrolls.reduce((sum, item) => sum + toNumber(item.bpjs_deduction), 0),
    taxDeduction: payrolls.reduce((sum, item) => sum + toNumber(item.tax_deduction), 0),
    otherDeduction: payrolls.reduce((sum, item) => sum + toNumber(item.other_deduction), 0),
    totalPaid: payrolls.reduce((sum, item) => sum + toNumber(item.final_amount || item.net_salary), 0),
  });

  const exportExcel = () => {
    const data = payrolls.map((item, i) => ({
      No: i + 1,
      "Nama Pegawai": item.employee_name || item.employee_id,
      "Gaji Pokok": toNumber(item.basic_salary),
      Tunjangan: toNumber(item.allowance),
      Transport: toNumber(item.transport_allowance),
      Makan: toNumber(item.meal_allowance),
      Kesehatan: toNumber(item.health_allowance),
      Bonus: toNumber(item.bonus),
      Lainnya: toNumber(item.other_allowance),
      Gross: toNumber(item.gross_salary),
      "Total Income": toNumber(item.total_income),
      Reimbursement: toNumber(item.reimbursement_total),
      Potongan: toNumber(item.deduction),
      Terlambat: toNumber(item.late_deduction),
      Absen: toNumber(item.absent_deduction),
      BPJS: toNumber(item.bpjs_deduction),
      Pajak: toNumber(item.tax_deduction),
      "Lainnya Potongan": toNumber(item.other_deduction),
      "Hari Telat": item.total_late_days,
      "Hari Absen": item.total_absent_days,
      Sakit: item.total_sakit_days,
      Izin: item.total_izin_days,
      Masuk: item.present_days,
      "Gaji Bersih": toNumber(item.net_salary),
      Status: item.status,
      "Final Gaji": toNumber(item.final_amount || item.net_salary),
      Created: formatDate(item.created_at),
    }));

    const totals = calculateTotals();
    data.push({
      No: "",
      "Nama Pegawai": "Total",
      "Gaji Pokok": totals.basicSalary,
      Tunjangan: totals.allowance,
      Transport: totals.transportAllowance,
      Makan: totals.mealAllowance,
      Kesehatan: totals.healthAllowance,
      Bonus: totals.bonus,
      Lainnya: totals.otherAllowance,
      "Gaji Kotor": totals.grossSalary,
      "Total Pendapatan": totals.totalIncome,
      Reimbursement: totals.reimbursementTotal,
      Potongan: totals.totalDeduction,
      Terlambat: totals.lateDeduction,
      Absen: totals.absentDeduction,
      BPJS: totals.bpjsDeduction,
      Pajak: totals.taxDeduction,
      "Potongan Lainnya": totals.otherDeduction,
      "Hari Telat": "",
      "Hari Absen": "",
      Sakit: "",
      Izin: "",
      Masuk: "",
      "Gaji Bersih": totals.totalPaid,
      Status: "",
      "Final Gaji": "",
      Created: "",
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet["!cols"] = [
      { wch: 5 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll");
    XLSX.writeFile(
      workbook,
      `laporan-payroll-${selectedMonth}-${selectedYear}.xlsx`,
    );
  };

  useEffect(() => {
    dispatch(setPageTitle({ title: "Laporan Finance" }));
    loadData();
    loadPayrolls(selectedMonth, selectedYear);
  }, [dispatch, loadData, loadPayrolls, selectedMonth, selectedYear]);

  const getStatusBadgeClass = (status) => {
    const s = String(status || "").toLowerCase();

    switch (s) {
      case "draft":
        return "border-blue-200 bg-blue-100 text-blue-700";
      case "claimed":
      case "submitted":
        return "border-amber-200 bg-amber-100 text-amber-700";
      case "approved":
      case "published":
      case "transferred":
      case "done":
        return "border-emerald-200 bg-emerald-100 text-emerald-700";
      case "rejected":
        return "border-red-200 bg-red-100 text-red-700";
      default:
        return "border-slate-200 bg-slate-100 text-slate-600";
    }
  };

  const getStatusLabel = (status) => {
    const s = String(status || "").toLowerCase();

    switch (s) {
      case "draft":
        return "Draf";
      case "claimed":
        return "Diklaim";
      case "submitted":
        return "Menunggu";
      case "approved":
        return "Disetujui";
      case "published":
        return "Dipublikasikan";
      case "transferred":
        return "Sudah Ditransfer";
      case "done":
        return "Selesai";
      case "rejected":
        return "Ditolak";
      default:
        return status || "-";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-orange-500" />
          <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
            Memuat laporan finance...
          </p>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();

  const summaryCards = [
    {
      label: "Total Pegawai",
      value: payrolls.length,
      description: "Jumlah payroll pada periode terpilih",
      icon: "👥",
      className: "border-orange-200 bg-orange-50 text-orange-700",
    },
    {
      label: "Total Dibayarkan",
      value: formatRupiah(totals.totalPaid),
      description: "Akumulasi final gaji bersih",
      icon: "💰",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    {
      label: "Reimbursement",
      value: formatRupiah(totals.reimbursementTotal),
      description: "Total reimbursement payroll",
      icon: "🧾",
      className: "border-blue-200 bg-blue-50 text-blue-700",
    },
    {
      label: "Total Potongan",
      value: formatRupiah(totals.totalDeduction),
      description: "Total seluruh komponen potongan",
      icon: "📉",
      className: "border-red-200 bg-red-50 text-red-700",
    },
  ];

  return (
    <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white p-4 shadow-[0_20px_70px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-950 dark:shadow-[0_20px_70px_rgba(2,6,23,0.45)] sm:p-7">
      <div className="space-y-6">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        ) : null}

        {dashboard ? (
          <pre className="sr-only">{JSON.stringify(dashboard)}</pre>
        ) : null}

        {/* Hero */}
        <div className="relative overflow-hidden rounded-[1.4rem] bg-gradient-to-r from-white via-white to-orange-50/80 px-5 py-6 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 sm:px-6">
          <div className="relative z-10 max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600 dark:border-orange-900/60 dark:bg-orange-950/70 dark:text-orange-300">
              Laporan Finance
            </div>
            <h1 className="text-[28px] font-extrabold leading-tight text-slate-900 dark:text-slate-50">
              Laporan Payroll Bulanan
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">
              Pantau rekap payroll bulanan, total pembayaran, komponen pendapatan,
              potongan, dan ekspor laporan dalam format Excel.
            </p>
          </div>
          <div className="pointer-events-none absolute right-8 top-3 hidden text-[108px] opacity-20 lg:block">
            📊
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className={`rounded-3xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${card.className}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold opacity-80">{card.label}</p>
                  <p className="mt-2 text-2xl font-extrabold leading-tight">
                    {card.value}
                  </p>
                  <p className="mt-1 text-xs font-medium opacity-75">
                    {card.description}
                  </p>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-2xl shadow-sm">
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">
                Tabel Rekap Payroll
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Pilih periode laporan, lalu unduh data payroll dalam format Excel.
              </p>
            </div>

            <button
              type="button"
              className="inline-flex w-fit items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600"
              onClick={exportExcel}
            >
              Export Excel
            </button>
          </div>

          {/* Filter */}
          <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-950/50">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Cari
                </label>
                <input
                  className="input input-bordered input-sm w-full rounded-xl bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  placeholder="Cari..."
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Bulan
                </label>
                <select
                  className="select select-sm select-bordered w-full rounded-xl bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {Array.from({ length: 12 }, (_, i) => ({
                    value: String(i + 1),
                    label: new Date(0, i).toLocaleString("id-ID", {
                      month: "long",
                    }),
                  })).map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Tahun
                </label>
                <select
                  className="select select-sm select-bordered w-full rounded-xl bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {Array.from({ length: 6 }, (_, idx) =>
                    String(now.getFullYear() - 3 + idx),
                  ).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="table table-sm min-w-[2600px]">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th>No</th>
                  <th>Nama Pegawai</th>
                  <th>Gaji Pokok</th>
                  <th>Tunjangan</th>
                  <th>Transport</th>
                  <th>Makan</th>
                  <th>Kesehatan</th>
                  <th>Bonus</th>
                  <th>Lainnya</th>
                  <th>Gaji Kotor</th>
                  <th>Total Pendapatan</th>
                  <th>Reimbursement</th>
                  <th>Potongan</th>
                  <th>Terlambat</th>
                  <th>Absen</th>
                  <th>BPJS</th>
                  <th>Pajak</th>
                  <th>Potongan Lainnya</th>
                  <th>Hari Telat</th>
                  <th>Hari Absen</th>
                  <th>Sakit</th>
                  <th>Izin</th>
                  <th>Masuk</th>
                  <th>Gaji Bersih</th>
                  <th>Status</th>
                  <th>Final Gaji</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payrollsPagination.paginatedItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-orange-50/50 dark:hover:bg-slate-800/60"
                  >
                    <td>{payrollsPagination.startIndex + index + 1}</td>
                    <td className="font-bold text-slate-800 dark:text-slate-100">
                      {item.employee_name || "-"}
                    </td>
                    <td>{formatRupiah(item.basic_salary)}</td>
                    <td>{formatRupiah(item.allowance)}</td>
                    <td>{formatRupiah(item.transport_allowance)}</td>
                    <td>{formatRupiah(item.meal_allowance)}</td>
                    <td>{formatRupiah(item.health_allowance)}</td>
                    <td>{formatRupiah(item.bonus)}</td>
                    <td>{formatRupiah(item.other_allowance)}</td>
                    <td>{formatRupiah(item.gross_salary)}</td>
                    <td>{formatRupiah(item.total_income)}</td>
                    <td>{formatRupiah(item.reimbursement_total)}</td>
                    <td>{formatRupiah(item.deduction)}</td>
                    <td>{formatRupiah(item.late_deduction)}</td>
                    <td>{formatRupiah(item.absent_deduction)}</td>
                    <td>{formatRupiah(item.bpjs_deduction)}</td>
                    <td>{formatRupiah(item.tax_deduction)}</td>
                    <td>{formatRupiah(item.other_deduction)}</td>
                    <td>{item.total_late_days}</td>
                    <td>{item.total_absent_days}</td>
                    <td>{item.total_sakit_days}</td>
                    <td>{item.total_izin_days}</td>
                    <td>{item.present_days}</td>
                    <td className="font-extrabold text-blue-700 dark:text-blue-300">
                      {formatRupiah(item.net_salary)}
                    </td>
                    <td>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusBadgeClass(
                          item.status,
                        )}`}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="font-bold text-emerald-700 dark:text-emerald-300">
                      {formatRupiah(item.final_amount || item.net_salary)}
                    </td>
                    <td>{formatDate(item.created_at)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-orange-50 font-extrabold text-slate-900 dark:bg-orange-950/30 dark:text-slate-50">
                  <td>Total</td>
                  <td></td>
                  <td>{formatRupiah(totals.basicSalary)}</td>
                  <td>{formatRupiah(totals.allowance)}</td>
                  <td>{formatRupiah(totals.transportAllowance)}</td>
                  <td>{formatRupiah(totals.mealAllowance)}</td>
                  <td>{formatRupiah(totals.healthAllowance)}</td>
                  <td>{formatRupiah(totals.bonus)}</td>
                  <td>{formatRupiah(totals.otherAllowance)}</td>
                  <td>{formatRupiah(totals.grossSalary)}</td>
                  <td>{formatRupiah(totals.totalIncome)}</td>
                  <td>{formatRupiah(totals.reimbursementTotal)}</td>
                  <td>{formatRupiah(totals.totalDeduction)}</td>
                  <td>{formatRupiah(totals.lateDeduction)}</td>
                  <td>{formatRupiah(totals.absentDeduction)}</td>
                  <td>{formatRupiah(totals.bpjsDeduction)}</td>
                  <td>{formatRupiah(totals.taxDeduction)}</td>
                  <td>{formatRupiah(totals.otherDeduction)}</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td>{formatRupiah(totals.totalPaid)}</td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-4">
            <Pagination
              page={payrollsPagination.page}
              totalPages={payrollsPagination.totalPages}
              onChangePage={payrollsPagination.setPage}
              itemsPerPage={payrollsPagination.itemsPerPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinanceReports;
