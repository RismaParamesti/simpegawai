import { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setPageTitle } from "../../../features/common/headerSlice";
import { financeApi } from "../../../features/finance/api";
import Pagination from "../../../components/Pagination/Pagination";
import Chart from "react-apexcharts";
import {
  WalletIcon,
  GiftIcon,
  ReceiptPercentIcon,
} from "@heroicons/react/24/outline";

const SummaryPagination = () => (
  <Pagination page={1} totalPages={1} onChangePage={() => {}} />
);

const fmt = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

const fmtM = (n) => {
  const num = Number(n || 0);
  if (Math.abs(num) >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (Math.abs(num) >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
  return "Rp 0";
};

const periodLabel = (month, year) =>
  new Date(
    Number(year || new Date().getFullYear()),
    Number(month || new Date().getMonth() + 1) - 1,
    1
  ).toLocaleDateString("id-ID", { month: "long", year: "numeric" });

const monthLabel = (month, year) =>
  new Date(
    Number(year || new Date().getFullYear()),
    Number(month || 1) - 1,
    1
  ).toLocaleDateString("id-ID", { month: "long" });

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
    <div className="absolute right-14 top-24 h-8 w-2 rounded-full bg-slate-400 dark:bg-slate-500" />
    <div className="absolute right-28 top-24 h-8 w-2 rounded-full bg-slate-400 dark:bg-slate-500" />
  </div>
);


function FinanceDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [selectedTrendIndex, setSelectedTrendIndex] = useState(null);
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(currentDate.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(currentDate.getFullYear()));

  const monthOptions = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
  ];
  const yearOptions = Array.from({ length: 7 }, (_, i) => String(currentDate.getFullYear() - 3 + i));

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await financeApi.getDashboard({ month: Number(selectedMonth), year: Number(selectedYear) });
      setDashboard(data);
    } catch (err) {
      setError(err.message || "Gagal memuat dashboard");
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    dispatch(setPageTitle({ title: "Dashboard Finance" }));
    loadDashboard();
  }, [dispatch, loadDashboard]);

  useEffect(() => {
    if (dashboard?.trends?.length) {
      setSelectedTrendIndex(dashboard.trends.length - 1);
    }
  }, [dashboard]);

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary" />
        <span className="ml-3 text-base-content/60">Memuat...</span>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center gap-3 py-20">
        <p className="text-error">{error}</p>
        <button className="btn btn-primary btn-sm" onClick={loadDashboard}>
          Coba Lagi
        </button>
      </div>
    );

  /* --- Data dari backend ------------------------------- */
  const period = dashboard?.period || {};
  const fin = dashboard?.financial_summary || {};
  const trends = dashboard?.trends || [];
  const topEarners = dashboard?.top_earners || [];

  const basicSalary = Number(fin.total_basic_salary || 0);
  const tunjangan = Number(fin.total_allowance || 0);
  const reimbursement = Number(fin.total_reimbursement || 0);
  const potongan = Number(fin.total_deduction || 0);
  const totalPayout = Number(fin.total_payout || 0);
  const activeTrendIndex =
    selectedTrendIndex !== null && selectedTrendIndex >= 0
      ? selectedTrendIndex
      : Math.max(trends.length - 1, 0);
  const activeTrend = trends[activeTrendIndex] || {};
  const activePeriodLabel = periodLabel(
    activeTrend.period_month || period.month,
    activeTrend.period_year || period.year
  );

  /* --- Chart (Line / Area 4 series) ------------------- */
  const cats = trends.map((t) => monthLabel(t.period_month, t.period_year));
  // Total Income (gross) = net_salary + deduction (reverse-engineering basic+reimb)
  const incomeData = trends.map(
    (t) => Number(t.total_salary || 0) + Number(t.total_deduction || 0)
  );
  const tunjData = trends.map((t) => Number(t.total_reimbursement || 0));
  const potData = trends.map((t) => Number(t.total_deduction || 0));
  const bayarData = trends.map((t) => Number(t.total_salary || 0)); // net
  const chartPeak = Math.max(
    0,
    ...incomeData,
    ...tunjData,
    ...potData,
    ...bayarData
  );
  const chartMax = chartPeak > 0 ? Math.ceil(chartPeak / 5000000) * 5000000 : 5000000;
  const highlightedIncomeValue = incomeData[activeTrendIndex] || 0;
  const highlightedIncomeIndex = Math.max(activeTrendIndex, 0);

  const chartOpts = {
    chart: {
      type: "line",
      toolbar: { show: false },
      zoom: { enabled: false },
      events: {
        dataPointSelection: (_event, _chartContext, config) => {
          if (typeof config?.dataPointIndex === "number" && config.dataPointIndex >= 0) {
            setSelectedTrendIndex(config.dataPointIndex);
          }
        },
      },
    },
    stroke: {
      curve: "smooth",
      width: [4, 2, 2, 3],
      lineCap: "round",
    },
    fill: {
      type: ["gradient", "solid", "solid", "solid"],
      gradient: {
        shade: "light",
        type: "vertical",
        opacityFrom: 0.55,
        opacityTo: 0.08,
      },
    },
    markers: {
      size: [5, 3, 3, 4],
      strokeWidth: 2,
      hover: { sizeOffset: 3 },
    },
    legend: {
      position: "bottom",
      horizontalAlign: "left",
      markers: { radius: 50 },
      fontSize: "12px",
    },
    xaxis: {
      categories: cats,
      axisBorder: { show: false },
      axisTicks: { show: false },
      crosshairs: {
        show: true,
        position: "back",
        stroke: {
          color: "#94a3b8",
          width: 1,
          dashArray: 4,
        },
      },
      labels: {
        style: {
          colors: "#64748b",
          fontSize: "11px",
          fontWeight: 500,
        },
      },
    },
    yaxis: {
      min: 0,
      max: chartMax,
      tickAmount: 4,
      crosshairs: {
        show: true,
        position: "back",
        stroke: {
          color: "#dbe3ef",
          width: 1,
          dashArray: 0,
        },
      },
      labels: {
        formatter: (v) => `${(v / 1000000).toFixed(0)}M`,
        style: {
          colors: "#94a3b8",
          fontSize: "12px",
        },
      },
    },
    tooltip: { y: { formatter: (v) => fmt(v) }, shared: true },
    grid: {
      borderColor: "#dbe3ef",
      strokeDashArray: 0,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } },
      padding: { left: 4, right: 4 },
    },
    colors: ["#1e40af", "#06b6d4", "#f87171", "#22c55e"],
    dataLabels: { enabled: false },
    annotations: {
      points: incomeData.length
        ? [
            {
              x: cats[highlightedIncomeIndex],
              y: highlightedIncomeValue,
              marker: {
                size: 6,
                fillColor: "#ffffff",
                strokeColor: "#1e40af",
                strokeWidth: 3,
              },
              label: {
                borderColor: "#1d4ed8",
                offsetY: -10,
                style: {
                  background: "#1d4ed8",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 700,
                  padding: {
                    left: 10,
                    right: 10,
                    top: 6,
                    bottom: 6,
                  },
                },
                text: fmt(highlightedIncomeValue),
              },
            },
          ]
        : [],
    },
  };

  const chartSeries = [
    { name: "Total Pendapatan", data: incomeData, type: "area" },
    { name: "Total Tunjangan", data: tunjData, type: "line" },
    { name: "Total Potongan", data: potData, type: "line" },
    { name: "Total Dibayarkan", data: bayarData, type: "line" },
  ];
  const activeIncome = Number(chartSeries[0]?.data?.[activeTrendIndex] || 0);
  const activeTunjangan = Number(chartSeries[1]?.data?.[activeTrendIndex] || 0);
  const activePotongan = Number(chartSeries[2]?.data?.[activeTrendIndex] || 0);
  const activeDibayarkan = Number(chartSeries[3]?.data?.[activeTrendIndex] || 0);

  /* --- Donut Chart ------------------------------------- */
  const donutSeries = [basicSalary, tunjangan, reimbursement, potongan];
  const donutOpts = {
    labels: ["Gaji Pokok", "Tunjangan", "Reimbursement", "Potongan"],
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              fontSize: "13px",
              color: "#6b7280",
              formatter: () => fmt(totalPayout),
            },
            value: {
              show: true,
              fontSize: "16px",
              fontWeight: 700,
              formatter: (v) => fmtM(Number(v)),
            },
          },
        },
      },
    },
    legend: { show: false },
    colors: ["#1e40af", "#22d3ee", "#a78bfa", "#f87171"],
    tooltip: { y: { formatter: (v) => fmt(v) } },
    dataLabels: { enabled: false },
  };

  const donutTotal = basicSalary + tunjangan + reimbursement + potongan;
  const pct = (val) =>
    donutTotal > 0 ? `${((val / donutTotal) * 100).toFixed(1)}%` : "0.0%";

  return (
    <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white p-4 shadow-[0_20px_70px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-950 dark:shadow-[0_20px_70px_rgba(2,6,23,0.45)] sm:p-7">
      <div className="space-y-6">
        {/* HERO */}
        <div className="relative min-h-[130px] overflow-hidden rounded-[1.4rem] bg-gradient-to-r from-white via-white to-orange-50/80 px-5 py-6 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 sm:px-6">
          <FinanceHeroIllustration />
          <div className="relative z-10 max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600 dark:border-orange-900/60 dark:bg-orange-950/70 dark:text-orange-300">
              Dashboard Finance
            </div>
            <h1 className="text-[28px] font-extrabold leading-tight text-slate-900 dark:text-slate-50">
              Ringkasan Payroll & Keuangan
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">
              Pantau total gaji, tunjangan, potongan, reimbursement, dan tren pengeluaran payroll berdasarkan periode yang dipilih.
            </p>
          </div>
        </div>

        {/* PERIOD FILTER */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">
                Periode Laporan
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Data yang ditampilkan untuk periode {monthOptions.find((m) => m.value === selectedMonth)?.label} {selectedYear}.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <select
                className="select select-bordered w-full rounded-xl bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setSelectedTrendIndex(null);
                }}
              >
                {monthOptions.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>

              <select
                className="select select-bordered w-full rounded-xl bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setSelectedTrendIndex(null);
                }}
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              label: "Total Gaji Pokok",
              value: fmt(basicSalary),
              icon: WalletIcon,
              box: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900/50",
            },
            {
              label: "Total Tunjangan",
              value: fmt(tunjangan),
              icon: GiftIcon,
              box: "bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-300 dark:border-cyan-900/50",
            },
            {
              label: "Total Potongan",
              value: fmt(potongan),
              icon: ReceiptPercentIcon,
              box: "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/50",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {item.label}
                    </p>
                    <p className="mt-2 text-xl font-extrabold text-slate-900 dark:text-slate-50 sm:text-2xl">
                      {item.value}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                      Periode {monthOptions.find((m) => m.value === selectedMonth)?.label} {selectedYear}
                    </p>
                  </div>
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${item.box}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* LEFT */}
          <div className="space-y-6 lg:col-span-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">
                    Grafik Pengeluaran Payroll
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Klik titik pada grafik untuk melihat rincian total payroll per bulan.
                  </p>
                </div>
                <div className="w-fit rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-right dark:border-orange-900/60 dark:bg-orange-950/30">
                  <p className="text-xs font-semibold text-orange-600/80 dark:text-orange-300/80">
                    Periode aktif
                  </p>
                  <p className="text-sm font-extrabold text-orange-600 dark:text-orange-300">
                    {activePeriodLabel}
                  </p>
                </div>
              </div>

              {trends.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center dark:border-slate-700">
                  <p className="font-bold text-slate-700 dark:text-slate-200">
                    Belum ada data tren
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Data tren payroll akan muncul setelah payroll tersedia.
                  </p>
                </div>
              ) : (
                <>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-700 dark:bg-slate-950/50">
                    <Chart
                      options={chartOpts}
                      series={chartSeries}
                      type="line"
                      height={280}
                    />
                  </div>

                  <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50/70 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-950/50">
                    <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-50">
                          Total Payroll
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Rincian {activePeriodLabel}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-right dark:border-emerald-900/60 dark:bg-emerald-950/30">
                        <p className="text-xs font-semibold text-emerald-600/80 dark:text-emerald-300/80">
                          Total Dibayarkan
                        </p>
                        <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-300">
                          {fmt(activeDibayarkan)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      {[
                        ["Total Pendapatan", "Gross", fmt(activeIncome), "bg-blue-500", "text-blue-600"],
                        ["Total Tunjangan", "Plus", fmt(activeTunjangan), "bg-cyan-400", "text-cyan-600"],
                        ["Total Potongan", "Minus", `-${fmt(activePotongan)}`, "bg-red-400", "text-red-500"],
                        ["Total Dibayarkan", "Netto", fmt(activeDibayarkan), "bg-emerald-500", "text-emerald-600"],
                      ].map(([label, type, value, dot, text]) => (
                        <div
                          key={label}
                          className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className={`inline-block h-3 w-3 shrink-0 rounded-full ${dot}`} />
                            <span className="truncate font-semibold text-slate-600 dark:text-slate-300">
                              {label}
                            </span>
                          </div>
                          <div className="flex shrink-0 items-center gap-3 text-right">
                            <span className="hidden text-[11px] font-bold uppercase tracking-wide text-slate-400 sm:inline">
                              {type}
                            </span>
                            <span className={`min-w-[130px] font-extrabold ${text}`}>
                              {value}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">
                  Rincian Gaji Bulan {periodLabel(period.month, period.year)}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Distribusi gaji pokok, tunjangan, reimbursement, dan potongan.
                </p>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-700 dark:bg-slate-950/50">
                <Chart options={donutOpts} series={donutSeries} type="donut" height={240} />
              </div>

              <div className="mt-5 space-y-3 text-sm">
                {[
                  ["Gaji Pokok", pct(basicSalary), "bg-blue-800"],
                  ["Tunjangan", pct(tunjangan), "bg-cyan-400"],
                  ["Reimbursement", pct(reimbursement), "bg-violet-400"],
                  ["Potongan", pct(potongan), "bg-red-400"],
                ].map(([label, value, dot]) => (
                  <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block h-3 w-3 rounded-full ${dot}`} />
                      <span className="font-medium text-slate-600 dark:text-slate-300">
                        {label}
                      </span>
                    </div>
                    <span className="font-extrabold text-slate-900 dark:text-slate-50">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">
                    5 Karyawan dengan Payroll Tertinggi
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Berdasarkan total payroll pada periode aktif.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                <table className="table table-sm w-full min-w-[520px]">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                    <tr>
                      <th className="w-10">No</th>
                      <th>Nama Karyawan</th>
                      <th>Departemen</th>
                      <th className="text-right">Total Payroll</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topEarners.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-500 dark:text-slate-400">
                          Belum ada data
                        </td>
                      </tr>
                    ) : (
                      topEarners.slice(0, 5).map((emp, i) => (
                        <tr key={`${emp.name || "employee"}-${i}`} className="border-t border-slate-100 hover:bg-orange-50/50 dark:border-slate-800 dark:hover:bg-slate-800/60">
                          <td className="align-middle">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-orange-50 text-xs font-bold text-orange-600 dark:bg-orange-950/40 dark:text-orange-300">
                              {i + 1}
                            </span>
                          </td>
                          <td className="align-middle">
                            <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-50">
                              {emp.name || "-"}
                            </p>
                            <p className="text-[11px] text-slate-400">Payroll tertinggi</p>
                          </td>
                          <td className="align-middle text-xs text-slate-600 dark:text-slate-300">
                            <span className="inline-flex whitespace-nowrap rounded-xl bg-slate-100 px-2 py-1 dark:bg-slate-800">
                              {emp.department_name || "-"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap text-right text-sm font-extrabold text-orange-600 dark:text-orange-300">
                            {fmt(emp.total_pay)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <SummaryPagination />
              </div>

              <div className="mt-4 text-right">
                <button
                  className="btn btn-sm rounded-xl border-none bg-orange-500 text-white hover:bg-orange-600"
                  onClick={() =>
                    navigate(
                      `/app/payroll/transfers?month=${period.month || ""}&year=${period.year || ""}&status=all&sort=top-pay`
                    )
                  }
                >
                  Lihat Semua
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinanceDashboard;
